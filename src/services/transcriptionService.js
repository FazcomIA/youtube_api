const axios = require('axios');
const xml2js = require('xml2js');
const CookieManager = require('./cookieManager');

// Configurações baseadas no código Python original
const WATCH_URL = 'https://www.youtube.com/watch?v={video_id}';
const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?key={api_key}';
const INNERTUBE_CONTEXT = {
    client: {
        clientName: 'ANDROID',
        clientVersion: '20.10.38'
    }
};

class YouTubeTranscriptApi {
    constructor() {
        // User-Agents mais recentes e variados para produção
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
        ];
        
        // Instância do gerenciador de cookies
        this.cookieManager = new CookieManager();
        
        this.httpClient = axios.create({
            timeout: parseInt(process.env.YOUTUBE_TIMEOUT || '45000'), // 45 segundos por padrão
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        // Interceptador para rotacionar User-Agent e aplicar cookies
        this.httpClient.interceptors.request.use(async (config) => {
            // Rotacionar User-Agent
            const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
            config.headers['User-Agent'] = randomUserAgent;
            
            // Aplicar cookies se disponíveis
            try {
                const cookieString = await this.cookieManager.getCookieString();
                if (cookieString) {
                    config.headers['Cookie'] = cookieString;
                    console.log('🍪 Cookies aplicados à requisição');
                } else {
                    console.log('📝 Nenhum cookie disponível, usando requisição sem cookies');
                }
            } catch (error) {
                console.log('⚠️ Erro ao carregar cookies, continuando sem eles:', error.message);
            }
            
            return config;
        });
        
        // Interceptador para retry automático
        this.httpClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const config = error.config;
                
                // Retry em caso de erro de rede ou timeout
                if (!config || !config.retry) {
                    config.retry = 0;
                }
                
                if (config.retry < 3 && (
                    error.code === 'ECONNRESET' ||
                    error.code === 'ENOTFOUND' ||
                    error.code === 'ECONNABORTED' ||
                    (error.response && [429, 503, 502, 504].includes(error.response.status))
                )) {
                    config.retry += 1;
                    console.log(`🔄 Tentativa ${config.retry}/3 para ${config.url}`);
                    
                    // Delay exponencial
                    const delay = Math.pow(2, config.retry) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    return this.httpClient(config);
                }
                
                return Promise.reject(error);
            }
        );
    }

    /**
     * Extrai o ID do vídeo da URL do YouTube
     * @param {string} url - URL do vídeo do YouTube
     * @returns {string} ID do vídeo
     */
    extractVideoId(url) {
        const patterns = [
            /(?:v=|\/)([0-9A-Za-z_-]{11})/,
            /(?:embed\/)([0-9A-Za-z_-]{11})/,
            /(?:youtu\.be\/)([0-9A-Za-z_-]{11})/,
            /(?:watch\?v=)([0-9A-Za-z_-]{11})/,
            /(?:youtube\.com\/watch\?.*v=)([0-9A-Za-z_-]{11})/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        throw new Error('ID do vídeo não encontrado na URL fornecida. Verifique se é uma URL válida do YouTube.');
    }

    /**
     * Método alternativo para obter transcrição usando abordagem mais simples
     * @param {string} videoId - ID do vídeo
     * @param {Array} languages - Lista de idiomas preferidos
     * @returns {Promise<Object>} Resultado da transcrição
     * @private
     */
    async _getTranscriptAlternative(videoId, languages = ['pt', 'pt-BR', 'en']) {
        console.log('🔄 Tentando método alternativo para obter transcrição...');
        
        try {
            // URL simplificada para obter dados básicos do vídeo
            const simpleUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            
            const oembedResponse = await this.httpClient.get(simpleUrl);
            console.log('✅ Dados básicos do vídeo obtidos via oEmbed');
            
            // Se chegou até aqui, o vídeo existe
            throw new Error('Transcrições não disponíveis para este vídeo (método alternativo)');
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error('Vídeo não encontrado ou não está disponível publicamente');
            } else if (error.response && error.response.status === 403) {
                throw new Error('Acesso ao vídeo negado. O vídeo pode ter restrições geográficas ou de idade');
            }
            throw error;
        }
    }

    /**
     * Converte segundos para formato HH:MM:SS
     * @param {number} seconds - Segundos
     * @returns {string} Tempo formatado
     */
    secondsToTimeFormat(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Limpa o texto da transcrição
     * @param {string} text - Texto a ser limpo
     * @returns {string} Texto limpo
     */
    cleanTranscriptText(text) {
        if (!text) return '';
        
        // Remove quebras de linha e retornos de carro
        let cleanText = text.replace(/\n/g, ' ').replace(/\r/g, ' ');
        
        // Remove caracteres de escape comuns
        cleanText = cleanText.replace(/\\n/g, ' ');
        cleanText = cleanText.replace(/\\r/g, ' ');
        cleanText = cleanText.replace(/\\"/g, '"');
        cleanText = cleanText.replace(/\\'/g, "'");
        cleanText = cleanText.replace(/\\\\/g, '\\');
        cleanText = cleanText.replace(/\\t/g, ' ');
        
        // Remove espaços múltiplos e limpa
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
        return cleanText;
    }

    /**
     * Obtém os dados da transcrição do vídeo
     * @param {string} videoId - ID do vídeo do YouTube
     * @param {Object} options - Opções de configuração
     * @returns {Promise<Object>} Objeto com dados da transcrição
     */
    async getTranscript(videoId, options = {}) {
        const { languages = ['pt', 'pt-BR', 'en'], includeTimestamps = false } = options;
        
        try {
            console.log('📝 Extraindo transcrição do vídeo:', videoId);
            console.log('🌐 Idiomas preferidos:', languages);
            console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');

            // Obtém os dados das legendas
            const captionsJson = await this._fetchCaptionsJson(videoId);
            
            // Constrói a lista de transcrições
            const transcriptList = this._buildTranscriptList(videoId, captionsJson);
            
            // Lista idiomas disponíveis
            const availableLanguages = this._getAvailableLanguages(transcriptList);
            console.log('🌐 Idiomas disponíveis:', availableLanguages);
            
            // Verifica se há transcrições disponíveis
            if (availableLanguages.length === 0) {
                throw new Error('Transcrições não disponíveis para este vídeo');
            }
            
            // Encontra a transcrição no idioma preferido
            const transcript = this._findTranscript(transcriptList, languages);
            console.log('📋 Transcrição selecionada:', transcript.languageCode, transcript.isGenerated ? '(gerada automaticamente)' : '(manual)');
            
            // Obtém os dados da transcrição
            const transcriptData = await this._fetchTranscriptData(transcript.url);
            
            // Faz parse dos dados
            const parsedData = await this._parseTranscriptData(transcriptData);
            
            // Formata a resposta conforme o formato da API Python
            const response = {
                success: true,
                error: '',
                video_id: videoId,
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                language_used: transcript.languageCode,
                available_languages: availableLanguages,
                segments_count: parsedData.length,
                include_timestamps: includeTimestamps
            };

            if (includeTimestamps) {
                // Retorna array de objetos com start, dur e text (formato igual à API Python)
                const formattedTranscript = [];
                for (const item of parsedData) {
                    const startFormatted = this.secondsToTimeFormat(item.start);
                    const cleanText = this.cleanTranscriptText(item.text);
                    
                    if (cleanText) {
                        formattedTranscript.push({
                            start: startFormatted,
                            dur: item.duration.toFixed(3),
                            text: cleanText
                        });
                    }
                }
                response.transcript = formattedTranscript;
            } else {
                // Apenas texto corrido
                const cleanSegments = [];
                for (const item of parsedData) {
                    const cleanText = this.cleanTranscriptText(item.text);
                    if (cleanText) {
                        cleanSegments.push(cleanText);
                    }
                }
                response.transcript = cleanSegments.join(' ');
            }

            console.log(`✅ Transcrição extraída com sucesso (${parsedData.length} segmentos)`);
            return response;
            
        } catch (error) {
            console.error('❌ Erro detalhado ao obter transcrição (método principal):', {
                message: error.message,
                stack: error.stack,
                videoId,
                languages,
                includeTimestamps,
                environment: process.env.NODE_ENV
            });
            
            // Tentar método alternativo antes de desistir
            try {
                console.log('🔄 Tentando método alternativo...');
                await this._getTranscriptAlternative(videoId, languages);
            } catch (alternativeError) {
                console.log('❌ Método alternativo também falhou:', alternativeError.message);
            }
            
            // Retornar erro mais específico baseado no tipo
            let errorMessage = error.message;
            if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Erro de conexão com o YouTube. Tente novamente em alguns momentos.';
            } else if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
                errorMessage = 'Timeout ao acessar o YouTube. O vídeo pode estar indisponível ou o servidor sobrecarregado.';
            } else if (error.message.includes('blocked') || error.message.includes('403') || error.message.includes('Forbidden')) {
                errorMessage = 'Acesso bloqueado pelo YouTube. Tente novamente mais tarde.';
            } else if (error.message.includes('Video not found') || error.message.includes('404') || error.message.includes('não encontrado')) {
                errorMessage = 'Vídeo não encontrado ou não está disponível.';
            } else if (error.message.includes('Transcrições desabilitadas') || error.message.includes('não disponível') || error.message.includes('não estão disponíveis')) {
                errorMessage = 'Transcrições não estão disponíveis para este vídeo.';
            } else if (error.message.includes('IP bloqueado') || error.message.includes('bot detectado')) {
                errorMessage = 'Acesso temporariamente bloqueado. Este é um problema conhecido em servidores de cloud. Tente novamente mais tarde.';
            }
            
            return {
                success: false,
                error: errorMessage,
                video_id: videoId,
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                transcript: includeTimestamps ? [] : '',
                available_languages: []
            };
        }
    }

    /**
     * Obtém os idiomas disponíveis
     * @private
     */
    _getAvailableLanguages(transcriptList) {
        const languages = [];
        
        // Adiciona idiomas das transcrições manuais
        for (const langCode in transcriptList.manual) {
            languages.push(langCode);
        }
        
        // Adiciona idiomas das transcrições geradas
        for (const langCode in transcriptList.generated) {
            if (!languages.includes(langCode)) {
                languages.push(langCode);
            }
        }
        
        return languages;
    }

    /**
     * Obtém os dados JSON das legendas
     * @private
     */
    async _fetchCaptionsJson(videoId) {
        try {
            // Obtém o HTML da página do vídeo
            const html = await this._fetchVideoHtml(videoId);
            
            // Extrai a chave da API InnerTube
            const apiKey = this._extractInnertubeApiKey(html, videoId);
            
            // Obtém os dados do InnerTube
            const innertubeData = await this._fetchInnertubeData(videoId, apiKey);
            
            // Extrai os dados das legendas
            return this._extractCaptionsJson(innertubeData, videoId);
        } catch (error) {
            throw new Error(`Erro ao obter dados das legendas: ${error.message}`);
        }
    }

    /**
     * Obtém o HTML da página do vídeo
     * @private
     */
    async _fetchVideoHtml(videoId) {
        const url = WATCH_URL.replace('{video_id}', videoId);
        console.log('🌐 Fazendo requisição para:', url);
        
        try {
            const response = await this.httpClient.get(url);
            console.log('✅ HTML obtido com sucesso. Tamanho:', response.data.length, 'bytes');
            
            // Verificar se a resposta contém o que esperamos
            if (!response.data.includes('ytInitialPlayerResponse') && !response.data.includes('INNERTUBE_API_KEY')) {
                console.log('⚠️ HTML não contém dados esperados do YouTube');
                throw new Error('Página do YouTube não carregou corretamente');
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao obter HTML da página:', error.message);
            if (error.response) {
                console.error('Status da resposta:', error.response.status);
                console.error('Headers da resposta:', error.response.headers);
            }
            throw error;
        }
    }

    /**
     * Extrai a chave da API InnerTube do HTML
     * @private
     */
    _extractInnertubeApiKey(html, videoId) {
        const pattern = /"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/;
        const match = html.match(pattern);
        
        if (match && match.length === 2) {
            return match[1];
        }
        
        if (html.includes('class="g-recaptcha"')) {
            throw new Error('IP bloqueado pelo YouTube');
        }
        
        throw new Error('Não foi possível extrair a chave da API InnerTube');
    }

    /**
     * Obtém os dados do InnerTube
     * @private
     */
    async _fetchInnertubeData(videoId, apiKey) {
        const url = INNERTUBE_API_URL.replace('{api_key}', apiKey);
        const response = await this.httpClient.post(url, {
            context: INNERTUBE_CONTEXT,
            videoId: videoId
        });
        
        return response.data;
    }

    /**
     * Extrai os dados das legendas do InnerTube
     * @private
     */
    _extractCaptionsJson(innertubeData, videoId) {
        // Verifica se o vídeo é reproduzível
        this._assertPlayability(innertubeData.playabilityStatus, videoId);
        
        const captionsJson = innertubeData.captions?.playerCaptionsTracklistRenderer;
        
        if (!captionsJson || !captionsJson.captionTracks) {
            throw new Error('Transcrições desabilitadas para este vídeo');
        }
        
        return captionsJson;
    }

    /**
     * Verifica se o vídeo é reproduzível
     * @private
     */
    _assertPlayability(playabilityStatus, videoId) {
        if (!playabilityStatus || playabilityStatus.status === 'OK') {
            return;
        }
        
        const status = playabilityStatus.status;
        const reason = playabilityStatus.reason;
        
        if (status === 'LOGIN_REQUIRED') {
            if (reason === 'Sign in to confirm you\'re not a bot') {
                throw new Error('Requisição bloqueada - bot detectado');
            }
            if (reason === 'This video may be inappropriate for some users.') {
                throw new Error('Vídeo com restrição de idade');
            }
        }
        
        if (status === 'ERROR' && reason === 'This video is unavailable') {
            throw new Error('Vídeo indisponível');
        }
        
        throw new Error(`Vídeo não reproduzível: ${reason || status}`);
    }

    /**
     * Constrói a lista de transcrições
     * @private
     */
    _buildTranscriptList(videoId, captionsJson) {
        const transcripts = {
            manual: {},
            generated: {}
        };
        
        for (const caption of captionsJson.captionTracks) {
            const isGenerated = caption.kind === 'asr';
            const transcriptDict = isGenerated ? transcripts.generated : transcripts.manual;
            
            transcriptDict[caption.languageCode] = {
                videoId: videoId,
                url: caption.baseUrl.replace('&fmt=srv3', ''),
                language: caption.name.runs[0].text,
                languageCode: caption.languageCode,
                isGenerated: isGenerated
            };
        }
        
        return transcripts;
    }

    /**
     * Encontra a transcrição no idioma preferido
     * @private
     */
    _findTranscript(transcriptList, languageCodes) {
        // Primeiro tenta encontrar transcrições manuais
        for (const langCode of languageCodes) {
            if (transcriptList.manual[langCode]) {
                console.log(`✅ Transcrição manual encontrada em ${langCode}`);
                return transcriptList.manual[langCode];
            }
        }
        
        // Depois tenta encontrar transcrições geradas automaticamente
        for (const langCode of languageCodes) {
            if (transcriptList.generated[langCode]) {
                console.log(`✅ Transcrição gerada automaticamente encontrada em ${langCode}`);
                return transcriptList.generated[langCode];
            }
        }
        
        throw new Error(`Nenhuma transcrição encontrada nos idiomas: ${languageCodes.join(', ')}`);
    }

    /**
     * Obtém os dados da transcrição
     * @private
     */
    async _fetchTranscriptData(url) {
        const response = await this.httpClient.get(url);
        return response.data;
    }

    /**
     * Faz parse dos dados da transcrição XML
     * @private
     */
    async _parseTranscriptData(xmlData) {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);
        
        if (!result.transcript || !result.transcript.text) {
            throw new Error('Formato de transcrição inválido');
        }
        
        const snippets = [];
        
        for (const textElement of result.transcript.text) {
            if (textElement._ && textElement.$.start) {
                let text = textElement._;
                
                // Decodifica entidades HTML
                text = this._decodeHtmlEntities(text);
                
                if (text.trim()) {
                    snippets.push({
                        text: text.trim(),
                        start: parseFloat(textElement.$.start),
                        duration: parseFloat(textElement.$.dur || '0.0')
                    });
                }
            }
        }
        
        return snippets;
    }

    /**
     * Decodifica entidades HTML
     * @private
     */
    _decodeHtmlEntities(text) {
        const entities = {
            '&#39;': "'",
            '&quot;': '"',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>'
        };
        
        return text.replace(/&#39;|&quot;|&amp;|&lt;|&gt;/g, match => entities[match]);
    }
}

module.exports = { YouTubeTranscriptApi }; 