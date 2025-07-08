const axios = require('axios');

/**
 * Serviço para fazer requisições diretas para a API kome.ai
 */
class TranscriptService {
    constructor() {
        this.komeApiUrl = 'https://kome.ai/api/transcript';
        this.timeout = 60000; // 60 segundos
    }

    /**
     * Faz requisição direta para a API kome.ai
     * @param {string} videoId - URL do vídeo do YouTube
     * @param {boolean} format - Flag de formatação (sempre true)
     * @returns {Promise<Object>} - Resposta da API kome.ai
     */
    async getTranscript(videoId, format = true) {
        try {
            console.log(`📝 Fazendo requisição para kome.ai: ${videoId}`);
            
            const payload = {
                video_id: videoId,
                format: format
            };

            const response = await axios.post(this.komeApiUrl, payload, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log(`✅ Resposta recebida da kome.ai (status: ${response.status})`);
            return response.data;

        } catch (error) {
            console.error(`❌ Erro na requisição para kome.ai:`, error.message);
            
            if (error.response) {
                // Erro com resposta do servidor
                throw {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data || { error: 'Erro no servidor kome.ai' }
                };
            } else if (error.request) {
                // Erro de rede/timeout
                throw {
                    status: 500,
                    statusText: 'Network Error',
                    data: { error: 'Erro de conexão com o servidor de transcrição' }
                };
            } else {
                // Erro genérico
                throw {
                    status: 500,
                    statusText: 'Internal Server Error',
                    data: { error: 'Erro interno do servidor' }
                };
            }
        }
    }
}

module.exports = TranscriptService; 