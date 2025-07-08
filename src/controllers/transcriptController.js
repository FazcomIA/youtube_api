const TranscriptService = require('../services/transcriptService');

// Instância do serviço
const transcriptService = new TranscriptService();

/**
 * Controller para obter transcrição via kome.ai
 */
const getTranscript = async (req, res) => {
    try {
        const { video_id, format } = req.body;
        
        // Validar se video_id foi fornecido
        if (!video_id) {
            return res.status(400).json({ 
                error: 'É necessário fornecer video_id no body da requisição' 
            });
        }

        // Validar se é uma URL válida do YouTube
        const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
        if (!youtubeUrlPattern.test(video_id)) {
            return res.status(400).json({ 
                error: 'video_id deve ser uma URL válida do YouTube' 
            });
        }

        console.log(`🔍 Requisição de transcrição para: ${video_id}`);
        
        // Fazer requisição para kome.ai
        const transcript = await transcriptService.getTranscript(video_id, format);
        
        // Retornar resposta direta da kome.ai
        res.json(transcript);

    } catch (error) {
        console.error('❌ Erro ao processar requisição de transcrição:', error);
        
        // Se for erro estruturado (do serviço), usar o status e dados do erro
        if (error.status && error.data) {
            return res.status(error.status).json(error.data);
        }
        
        // Erro genérico
        res.status(500).json({ 
            error: 'Erro interno do servidor ao processar transcrição' 
        });
    }
};

module.exports = {
    getTranscript
}; 