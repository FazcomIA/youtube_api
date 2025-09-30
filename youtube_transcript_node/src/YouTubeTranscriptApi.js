const axios = require('axios');
const xml2js = require('xml2js');

// Configurações baseadas no código Python original
const WATCH_URL = 'https://www.youtube.com/watch?v={video_id}';
const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?key={api_key}';

// Pool de User-Agents realistas para rotação
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Contextos InnerTube alternativos
const INNERTUBE_CONTEXTS = [
    {
        client: {
            clientName: 'WEB',
            clientVersion: '2.20231208.00.00'
        }
    },
    {
        client: {
            clientName: 'ANDROID',
            clientVersion: '18.48.37',
            androidSdkVersion: 30
        }
    },
    {
        client: {
            clientName: 'IOS',
            clientVersion: '18.48.3',
            deviceModel: 'iPhone14,3'
        }
    }
];

class YouTubeTranscriptApi {
    constructor() {
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 segundo entre requisições
    }

    /**
     * Cria um cliente HTTP com headers realistas e rotação
     * @private
     */
    _createHttpClient() {
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const acceptLanguages = [
            'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'en-US,en;q=0.9,pt;q=0.8',
            'pt,pt-BR;q=0.9,en;q=0.8'
        ];
        
        return axios.create({
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+917; YSC=dQw4w9WgXcQ'
            },
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: (status) => status < 500 // Aceita códigos 4xx para melhor tratamento
        });
    }

    /**
     * Implementa rate limiting básico
     * @private
     */
    async _waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
        this.requestCount++;
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
            /(?:youtu\.be\/)([0-9A-Za-z_-]{11})/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        throw new Error('ID do vídeo não encontrado na URL fornecida');
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
     * Obtém os dados da transcrição do vídeo com retry automático
     * @param {string} videoId - ID do vídeo do YouTube
     * @param {Object} options - Opções de configuração
     * @returns {Promise<Object>} Objeto com dados da transcrição
     */
    async getTranscript(videoId, options = {}) {
        const { languages = ['pt', 'pt-BR', 'en'], includeTimestamps = false, maxRetries = 3 } = options;

        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📝 Extraindo transcrição do vídeo: ${videoId} (tentativa ${attempt}/${maxRetries})`);
                console.log('🌐 Idiomas preferidos:', languages);

                // Obtém os dados das legendas
                const captionsJson = await this._fetchCaptionsJson(videoId, attempt);
                
                // Constrói a lista de transcrições
                const transcriptList = this._buildTranscriptList(videoId, captionsJson);
                
                // Lista idiomas disponíveis
                const availableLanguages = this._getAvailableLanguages(transcriptList);
                console.log('🌐 Idiomas disponíveis:', availableLanguages);
                
                // Encontra a transcrição no idioma preferido
                const transcript = this._findTranscript(transcriptList, languages);
                
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
                lastError = error;
                console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
                
                // Se foi detectado como bot, espera mais tempo antes de tentar novamente
                if (error.message.includes('bot') || error.message.includes('bloqueado')) {
                    const waitTime = attempt * 2000; // Aumenta o tempo de espera progressivamente
                    console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
                
                // Se chegou na última tentativa, retorna erro
                if (attempt === maxRetries) {
                    break;
                }
            }
        }

        console.error('❌ Todas as tentativas falharam. Último erro:', lastError?.message);
        return {
            success: false,
            error: lastError?.message || 'Erro desconhecido ao obter transcrição',
            video_id: videoId,
            video_url: `https://www.youtube.com/watch?v=${videoId}`,
            transcript: includeTimestamps ? [] : '',
            available_languages: []
        };
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
     * Obtém os dados JSON das legendas com retry
     * @private
     */
    async _fetchCaptionsJson(videoId, attempt = 1) {
        try {
            // Rate limiting
            await this._waitForRateLimit();
            
            // Obtém o HTML da página do vídeo
            const html = await this._fetchVideoHtml(videoId, attempt);
            
            // Extrai a chave da API InnerTube
            const apiKey = this._extractInnertubeApiKey(html, videoId);
            
            // Obtém os dados do InnerTube
            const innertubeData = await this._fetchInnertubeData(videoId, apiKey, attempt);
            
            // Extrai os dados das legendas
            return this._extractCaptionsJson(innertubeData, videoId);
        } catch (error) {
            throw new Error(`Erro ao obter dados das legendas: ${error.message}`);
        }
    }

    /**
     * Obtém o HTML da página do vídeo com retry e rotação de headers
     * @private
     */
    async _fetchVideoHtml(videoId, attempt = 1) {
        const httpClient = this._createHttpClient();
        const url = WATCH_URL.replace('{video_id}', videoId);
        
        try {
            console.log(`🌐 Acessando página do YouTube (tentativa ${attempt}): ${url}`);
            const response = await httpClient.get(url);
            
            if (response.status === 429) {
                throw new Error('Rate limit excedido - muitas requisições');
            }
            
            if (response.status >= 400) {
                throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
                throw new Error('Conexão perdida - problema de rede');
            }
            throw error;
        }
    }

    /**
     * Extrai a chave da API InnerTube do HTML
     * @private
     */
    _extractInnertubeApiKey(html, videoId) {
        const patterns = [
            /"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/,
            /"innertubeApiKey":\s*"([a-zA-Z0-9_-]+)"/,
            /apikey:\s*"([a-zA-Z0-9_-]+)"/
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match.length === 2) {
                return match[1];
            }
        }
        
        if (html.includes('class="g-recaptcha"') || html.includes('recaptcha')) {
            throw new Error('IP bloqueado pelo YouTube - CAPTCHA detectado');
        }
        
        if (html.includes('Sign in to confirm you\'re not a bot')) {
            throw new Error('Requisição bloqueada - bot detectado pelo YouTube');
        }
        
        throw new Error('Não foi possível extrair a chave da API InnerTube');
    }

    /**
     * Obtém os dados do InnerTube com contexto rotativo
     * @private
     */
    async _fetchInnertubeData(videoId, apiKey, attempt = 1) {
        // Rate limiting
        await this._waitForRateLimit();
        
        const httpClient = this._createHttpClient();
        const url = INNERTUBE_API_URL.replace('{api_key}', apiKey);
        
        // Usa contexto diferente baseado na tentativa
        const contextIndex = (attempt - 1) % INNERTUBE_CONTEXTS.length;
        const context = INNERTUBE_CONTEXTS[contextIndex];
        
        console.log(`🔗 Chamando InnerTube API (contexto: ${context.client.clientName})`);
        
        try {
            const response = await httpClient.post(url, {
                context: context,
                videoId: videoId
            });
            
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('Acesso negado à API InnerTube - possível bloqueio de IP');
            }
            if (error.response?.status === 429) {
                throw new Error('Rate limit na API InnerTube');
            }
            throw error;
        }
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
        
        if (status === 'UNPLAYABLE') {
            throw new Error('Vídeo não reproduzível - pode estar privado ou removido');
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
        // Rate limiting
        await this._waitForRateLimit();
        
        const httpClient = this._createHttpClient();
        
        try {
            console.log('📄 Baixando dados da transcrição...');
            const response = await httpClient.get(url);
            return response.data;
        } catch (error) {
            throw new Error(`Erro ao baixar transcrição: ${error.message}`);
        }
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

module.exports = YouTubeTranscriptApi;