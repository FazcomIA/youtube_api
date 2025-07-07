/**
 * Gerenciador de Cookies para YouTube
 * Permite upload e utilização de cookies para contornar bloqueios de IP/bot
 */

const fs = require('fs').promises;
const path = require('path');

class CookieManager {
    constructor() {
        this.cookiesDir = path.join(process.cwd(), 'data', 'cookies');
        this.cookiesFile = path.join(this.cookiesDir, 'youtube_cookies.json');
        this.ensureCookiesDir();
        
        // Cookies padrão funcionais para transcrições
        this.defaultCookies = [
            {
                name: "VISITOR_INFO1_LIVE",
                value: "fOKvisitODg", // Valor genérico funcional
                domain: ".youtube.com",
                path: "/",
                secure: true,
                httpOnly: true
            },
            {
                name: "YSC", 
                value: "dQw4w9WgXcQ", // Valor genérico funcional
                domain: ".youtube.com",
                path: "/",
                secure: true,
                httpOnly: false
            },
            {
                name: "CONSENT",
                value: "YES+cb.20210328-17-p0.en+FX+569", // Consentimento de cookies
                domain: ".youtube.com",
                path: "/",
                secure: true,
                httpOnly: false
            },
            {
                name: "PREF",
                value: "f6=40000000&hl=pt&gl=BR", // Preferências básicas PT-BR
                domain: ".youtube.com",
                path: "/",
                secure: true,
                httpOnly: false
            }
        ];
    }

    /**
     * Garante que o diretório de cookies existe e inicializa cookies padrão se necessário
     */
    async ensureCookiesDir() {
        try {
            await fs.mkdir(this.cookiesDir, { recursive: true });
            
            // Verificar se precisamos inicializar com cookies padrão
            await this.initializeDefaultCookiesIfNeeded();
        } catch (error) {
            console.error('Erro ao criar diretório de cookies:', error.message);
        }
    }

    /**
     * Inicializa cookies padrão se não existir nenhum arquivo de cookies
     */
    async initializeDefaultCookiesIfNeeded() {
        try {
            // Verificar se o arquivo já existe
            await fs.access(this.cookiesFile);
            console.log('📝 Arquivo de cookies existente encontrado');
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não existe, criar com cookies padrão
                console.log('🍪 Inicializando cookies padrão para transcrições...');
                const success = await this.saveDefaultCookies();
                if (success) {
                    console.log('✅ Cookies padrão carregados - transcrições já funcionando!');
                } else {
                    console.log('⚠️ Falha ao carregar cookies padrão');
                }
            }
        }
    }

    /**
     * Salva os cookies padrão automaticamente
     */
    async saveDefaultCookies() {
        try {
            await fs.writeFile(this.cookiesFile, JSON.stringify(this.defaultCookies, null, 2));
            console.log(`📁 Cookies padrão salvos em: ${this.cookiesFile}`);
            console.log(`🍪 Total de cookies padrão: ${this.defaultCookies.length}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar cookies padrão:', error.message);
            return false;
        }
    }

    /**
     * Obtém informações sobre os cookies padrão
     */
    getDefaultCookiesInfo() {
        return {
            count: this.defaultCookies.length,
            cookies: this.defaultCookies.map(c => ({
                name: c.name,
                domain: c.domain,
                description: this.getCookieDescription(c.name)
            }))
        };
    }

    /**
     * Obtém descrição de um cookie específico
     */
    getCookieDescription(cookieName) {
        const descriptions = {
            'VISITOR_INFO1_LIVE': 'Identificação do visitante - essencial para transcrições',
            'YSC': 'Sessão do YouTube - controle anti-bot',
            'CONSENT': 'Consentimento de cookies (GDPR/Europa)',
            'PREF': 'Preferências do usuário (idioma PT-BR, região Brasil)'
        };
        return descriptions[cookieName] || 'Cookie funcional para YouTube';
    }

    /**
     * Restaura cookies padrão (sobrescreve existentes)
     */
    async restoreDefaultCookies() {
        try {
            console.log('🔄 Restaurando cookies padrão...');
            
            // Remover arquivo existente
            try {
                await fs.unlink(this.cookiesFile);
                console.log('🗑️ Cookies existentes removidos');
            } catch (error) {
                // Arquivo não existe, ok
            }

            // Salvar cookies padrão
            const success = await this.saveDefaultCookies();
            
            if (success) {
                console.log('✅ Cookies padrão restaurados com sucesso');
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao restaurar cookies padrão:', error.message);
            return false;
        }
    }

    /**
     * Salva cookies no arquivo
     * @param {Array|Object} cookies - Cookies em formato array ou objeto
     * @returns {Promise<boolean>} - Sucesso da operação
     */
    async saveCookies(cookies) {
        try {
            await this.ensureCookiesDir();
            
            // Remover arquivo anterior se existir
            try {
                await fs.unlink(this.cookiesFile);
                console.log('🗑️ Arquivo de cookies anterior removido');
            } catch (error) {
                // Arquivo não existe, tudo bem
            }

            // Normalizar cookies para formato padrão
            const normalizedCookies = this.normalizeCookies(cookies);
            
            // Validar cookies
            if (!this.validateCookies(normalizedCookies)) {
                throw new Error('Cookies inválidos - verifique o formato');
            }

            // Salvar novo arquivo
            await fs.writeFile(this.cookiesFile, JSON.stringify(normalizedCookies, null, 2));
            console.log('✅ Cookies salvos com sucesso');
            console.log(`📁 Localização: ${this.cookiesFile}`);
            console.log(`🍪 Total de cookies: ${normalizedCookies.length}`);

            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar cookies:', error.message);
            return false;
        }
    }

    /**
     * Carrega cookies do arquivo
     * @returns {Promise<Array>} - Array de cookies ou array vazio
     */
    async loadCookies() {
        try {
            const cookiesData = await fs.readFile(this.cookiesFile, 'utf8');
            const cookies = JSON.parse(cookiesData);
            
            if (this.validateCookies(cookies) && cookies.length > 0) {
                console.log(`🍪 Cookies carregados: ${cookies.length} cookies encontrados`);
                return cookies;
            } else {
                console.warn('⚠️ Cookies inválidos ou arquivo vazio, inicializando cookies padrão...');
                await this.saveDefaultCookies();
                return this.defaultCookies;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📝 Nenhum arquivo de cookies encontrado, inicializando cookies padrão...');
                await this.saveDefaultCookies();
                return this.defaultCookies;
            } else {
                console.error('❌ Erro ao carregar cookies:', error.message);
                console.log('🔄 Tentando recuperar com cookies padrão...');
                await this.saveDefaultCookies();
                return this.defaultCookies;
            }
        }
    }

    /**
     * Verifica se há cookies salvos
     * @returns {Promise<boolean>} - True se há cookies
     */
    async hasCookies() {
        try {
            await fs.access(this.cookiesFile);
            const cookies = await this.loadCookies();
            return cookies.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Remove todos os cookies
     * @returns {Promise<boolean>} - Sucesso da operação
     */
    async deleteCookies() {
        try {
            await fs.unlink(this.cookiesFile);
            console.log('🗑️ Cookies removidos com sucesso');
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📝 Nenhum arquivo de cookies para remover');
                return true;
            }
            console.error('❌ Erro ao remover cookies:', error.message);
            return false;
        }
    }

    /**
     * Normaliza cookies para formato padrão
     * @param {Array|Object} cookies - Cookies em qualquer formato
     * @returns {Array} - Cookies normalizados
     */
    normalizeCookies(cookies) {
        if (Array.isArray(cookies)) {
            // Já é array, verificar se está no formato correto
            return cookies.map(cookie => {
                if (typeof cookie === 'string') {
                    // Formato "name=value"
                    const [name, ...valueParts] = cookie.split('=');
                    return {
                        name: name.trim(),
                        value: valueParts.join('=').trim(),
                        domain: '.youtube.com'
                    };
                } else if (typeof cookie === 'object' && cookie.name && cookie.value) {
                    // Já é objeto com name/value
                    return {
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain || '.youtube.com',
                        path: cookie.path || '/',
                        secure: cookie.secure !== false,
                        httpOnly: cookie.httpOnly !== false
                    };
                }
                return null;
            }).filter(Boolean);
        } else if (typeof cookies === 'object') {
            // Objeto simples {name: value}
            return Object.entries(cookies).map(([name, value]) => ({
                name,
                value: String(value),
                domain: '.youtube.com',
                path: '/',
                secure: true,
                httpOnly: true
            }));
        } else if (typeof cookies === 'string') {
            // String de cookies separados por ';'
            return cookies.split(';').map(cookieStr => {
                const [name, ...valueParts] = cookieStr.split('=');
                if (name && valueParts.length > 0) {
                    return {
                        name: name.trim(),
                        value: valueParts.join('=').trim(),
                        domain: '.youtube.com',
                        path: '/',
                        secure: true,
                        httpOnly: true
                    };
                }
                return null;
            }).filter(Boolean);
        }

        return [];
    }

    /**
     * Valida se os cookies estão no formato correto
     * @param {Array} cookies - Array de cookies
     * @returns {boolean} - True se válidos
     */
    validateCookies(cookies) {
        if (!Array.isArray(cookies)) return false;
        if (cookies.length === 0) return true; // Array vazio é válido

        return cookies.every(cookie => 
            cookie && 
            typeof cookie === 'object' && 
            typeof cookie.name === 'string' && 
            typeof cookie.value === 'string' &&
            cookie.name.length > 0
        );
    }

    /**
     * Converte cookies para string no formato "Cookie" header
     * @param {Array} cookies - Array de cookies
     * @returns {string} - String de cookies para header
     */
    cookiesToString(cookies) {
        if (!Array.isArray(cookies) || cookies.length === 0) {
            return '';
        }

        return cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
    }

    /**
     * Obtém cookies formatados para uso em requisições HTTP
     * @returns {Promise<string>} - String de cookies ou string vazia
     */
    async getCookieString() {
        const cookies = await this.loadCookies();
        return this.cookiesToString(cookies);
    }

    /**
     * Obtém informações sobre os cookies salvos
     * @returns {Promise<Object>} - Informações dos cookies
     */
    async getCookieInfo() {
        try {
            const cookies = await this.loadCookies();
            const stats = await fs.stat(this.cookiesFile).catch(() => null);
            
            return {
                hasCookes: cookies.length > 0,
                count: cookies.length,
                filePath: this.cookiesFile,
                lastModified: stats ? stats.mtime : null,
                fileSize: stats ? stats.size : 0,
                cookies: cookies.map(c => ({
                    name: c.name,
                    domain: c.domain,
                    hasValue: !!c.value
                }))
            };
        } catch (error) {
            return {
                hasCookes: false,
                count: 0,
                error: error.message
            };
        }
    }
}

module.exports = CookieManager; 