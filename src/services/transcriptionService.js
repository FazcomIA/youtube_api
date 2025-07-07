const axios = require('axios');

/**
 * Serviço de Transcrição usando API Externa (kome.ai)
 * Remove a necessidade de cookies e funciona em qualquer servidor
 */
class YouTubeTranscriptApi {
    constructor() {
        this.komeApiUrl = 'https://kome.ai/api/transcript';
        
        // Cliente HTTP configurado para a API kome.ai
        this.httpClient = axios.create({
            timeout: parseInt(process.env.TRANSCRIPT_TIMEOUT || '60000'), // 60 segundos por padrão
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
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
                
                if (config.retry < 2 && (
                    error.code === 'ECONNRESET' ||
                    error.code === 'ENOTFOUND' ||
                    error.code === 'ECONNABORTED' ||
                    (error.response && [429, 503, 502, 504].includes(error.response.status))
                )) {
                    config.retry += 1;
                    console.log(`🔄 Tentativa ${config.retry}/2 para transcrição via kome.ai`);
                    
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
     * Processa a transcrição bruta e limpa o texto
     * @param {string} rawTranscript - Transcrição bruta da API
     * @returns {string} Transcrição formatada
     */
    processTranscript(rawTranscript) {
        if (!rawTranscript) {
            return '';
        }

        // Limpar texto básico
        let cleanText = rawTranscript
            .replace(/\n+/g, ' ')  // Substituir quebras de linha por espaços
            .replace(/\r+/g, ' ')  // Substituir retornos de carro por espaços
            .replace(/\s+/g, ' ')  // Remover espaços múltiplos
            .trim();

        return cleanText;
    }



    /**
     * Obtém a transcrição usando a API kome.ai
     * @param {string} videoId - ID do vídeo do YouTube
     * @returns {Promise<Object>} Objeto com dados da transcrição
     */
    async getTranscript(videoId) {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        try {
            console.log('📝 Obtendo transcrição via kome.ai para:', videoId);
            console.log('🌐 URL do vídeo:', videoUrl);
            
            // Preparar payload para a API kome.ai (apenas os campos necessários)
            const payload = {
                video_id: videoUrl,
                format: true
            };
            
            console.log('📤 Enviando requisição para kome.ai...');
            
            // Fazer requisição para a API kome.ai
            const response = await this.httpClient.post(this.komeApiUrl, payload);
            
            if (!response.data) {
                throw new Error('Resposta vazia da API de transcrição');
            }
            
            const { transcript } = response.data;
            
            if (!transcript) {
                throw new Error('Transcrição não encontrada na resposta da API');
            }
            
            console.log('✅ Transcrição obtida com sucesso via kome.ai');
            console.log(`📊 Tamanho da transcrição: ${transcript.length} caracteres`);
            
            // Processar transcrição (sempre texto simples)
            const processedTranscript = this.processTranscript(transcript);
            
            // Retornar resposta no formato padrão da API
            return {
                success: true,
                error: '',
                video_id: videoId,
                video_url: videoUrl,
                transcript: processedTranscript,
                service: 'kome.ai'
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter transcrição via kome.ai:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                videoId,
                videoUrl
            });
            
            // Categorizar erros
            let errorMessage = error.message;
            
            if (error.response) {
                const status = error.response.status;
                
                if (status === 400) {
                    errorMessage = 'URL do vídeo inválida ou vídeo não acessível';
                } else if (status === 403 || status === 401) {
                    errorMessage = 'Acesso negado à API de transcrição';
                } else if (status === 404) {
                    errorMessage = 'Vídeo não encontrado ou transcrição não disponível';
                } else if (status === 429) {
                    errorMessage = 'Muitas requisições à API de transcrição. Tente novamente em alguns minutos.';
                } else if (status >= 500) {
                    errorMessage = 'Erro no servidor de transcrição. Tente novamente mais tarde.';
                }
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errorMessage = 'Erro de conexão com o serviço de transcrição. Verifique sua conexão com a internet.';
            } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = 'Timeout ao obter transcrição. O vídeo pode ser muito longo ou o serviço estar sobrecarregado.';
            }
            
            return {
                success: false,
                error: errorMessage,
                video_id: videoId,
                video_url: videoUrl,
                transcript: '',
                service: 'kome.ai'
            };
        }
    }
}

module.exports = { YouTubeTranscriptApi }; 