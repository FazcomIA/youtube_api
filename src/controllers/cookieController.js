/**
 * Controller para gerenciamento de cookies do YouTube
 * Permite upload, consulta e remoção de cookies para transcrições
 */

const CookieManager = require('../services/cookieManager');

// Instância do gerenciador de cookies
const cookieManager = new CookieManager();

/**
 * Upload de cookies do YouTube
 */
const uploadCookies = async (req, res) => {
    try {
        const { cookies } = req.body;
        
        if (!cookies) {
            return res.status(400).json({
                success: false,
                error: 'É necessário fornecer os cookies no corpo da requisição'
            });
        }
        
        console.log('🍪 Recebendo upload de cookies...');
        console.log('📝 Tipo de dados recebidos:', typeof cookies);
        
        // Salvar cookies
        const success = await cookieManager.saveCookies(cookies);
        
        if (success) {
            const info = await cookieManager.getCookieInfo();
            
            res.json({
                success: true,
                message: 'Cookies salvos com sucesso',
                info: {
                    count: info.count,
                    lastModified: info.lastModified,
                    hasCookies: info.hasCookes
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Falha ao salvar cookies - verifique o formato'
            });
        }
        
    } catch (error) {
        console.error('❌ Erro no upload de cookies:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao processar cookies',
            message: error.message
        });
    }
};

/**
 * Consultar informações dos cookies salvos
 */
const getCookieInfo = async (req, res) => {
    try {
        console.log('🔍 Consultando informações dos cookies...');
        
        const info = await cookieManager.getCookieInfo();
        
        res.json({
            success: true,
            data: info
        });
        
    } catch (error) {
        console.error('❌ Erro ao consultar cookies:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao consultar informações dos cookies',
            message: error.message
        });
    }
};

/**
 * Remover todos os cookies salvos
 */
const deleteCookies = async (req, res) => {
    try {
        console.log('🗑️ Removendo todos os cookies...');
        
        const success = await cookieManager.deleteCookies();
        
        if (success) {
            res.json({
                success: true,
                message: 'Cookies removidos com sucesso'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Falha ao remover cookies'
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao remover cookies:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao remover cookies',
            message: error.message
        });
    }
};

/**
 * Verificar se há cookies salvos (endpoint simples)
 */
const checkCookies = async (req, res) => {
    try {
        const hasCookies = await cookieManager.hasCookies();
        
        res.json({
            success: true,
            hasCookies,
            message: hasCookies ? 'Cookies encontrados' : 'Nenhum cookie salvo'
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar cookies:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar cookies',
            message: error.message
        });
    }
};

/**
 * Obter informações sobre cookies padrão disponíveis
 */
const getDefaultCookiesInfo = async (req, res) => {
    try {
        console.log('🔍 Consultando informações dos cookies padrão...');
        
        const defaultInfo = cookieManager.getDefaultCookiesInfo();
        
        res.json({
            success: true,
            message: 'Cookies padrão disponíveis para inicialização automática',
            data: defaultInfo
        });
        
    } catch (error) {
        console.error('❌ Erro ao consultar cookies padrão:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao consultar cookies padrão',
            message: error.message
        });
    }
};

/**
 * Restaurar cookies padrão (sobrescrever existentes)
 */
const restoreDefaultCookies = async (req, res) => {
    try {
        console.log('🔄 Restaurando cookies padrão...');
        
        const success = await cookieManager.restoreDefaultCookies();
        
        if (success) {
            const info = await cookieManager.getCookieInfo();
            
            res.json({
                success: true,
                message: 'Cookies padrão restaurados com sucesso',
                info: {
                    count: info.count,
                    lastModified: info.lastModified,
                    hasCookies: info.hasCookes
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Falha ao restaurar cookies padrão'
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao restaurar cookies padrão:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao restaurar cookies padrão',
            message: error.message
        });
    }
};

/**
 * Status geral do sistema de cookies
 */
const getCookieStatus = async (req, res) => {
    try {
        console.log('📊 Consultando status geral dos cookies...');
        
        const [hasCookies, cookieInfo, defaultInfo] = await Promise.all([
            cookieManager.hasCookies(),
            cookieManager.getCookieInfo(),
            Promise.resolve(cookieManager.getDefaultCookiesInfo())
        ]);
        
        res.json({
            success: true,
            data: {
                hasCookies,
                current: cookieInfo,
                defaults: defaultInfo,
                transcriptionReady: hasCookies,
                system: {
                    autoInitialize: true,
                    supportedFormats: ['array', 'object', 'string'],
                    persistentStorage: true
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao consultar status dos cookies:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erro ao consultar status dos cookies',
            message: error.message
        });
    }
};

module.exports = {
    uploadCookies,
    getCookieInfo,
    deleteCookies,
    checkCookies,
    getDefaultCookiesInfo,
    restoreDefaultCookies,
    getCookieStatus
}; 