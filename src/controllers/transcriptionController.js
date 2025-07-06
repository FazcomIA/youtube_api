const { YouTubeTranscriptApi } = require('../services/transcriptionService');

// Instância do serviço
const youtubeTranscriptApi = new YouTubeTranscriptApi();

/**
 * Controller para obter transcrição de vídeos
 */
const getTranscription = async (req, res) => {
  try {
    const { videoUrl, languages = ['pt', 'pt-BR', 'en'], includeTimestamps = false } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'É necessário fornecer a URL do vídeo do YouTube' 
      });
    }
    
    console.log(`🔍 Obtendo transcrição do vídeo: ${videoUrl}`);
    
    // Extrair o ID do vídeo da URL
    const videoId = youtubeTranscriptApi.extractVideoId(videoUrl);
    
    // Obter transcrição
    const transcriptResult = await youtubeTranscriptApi.getTranscript(videoId, {
      languages,
      includeTimestamps
    });
    
    if (transcriptResult.success) {
      console.log(`✅ Transcrição obtida com sucesso (${transcriptResult.segments_count} segmentos)`);
    } else {
      console.log(`❌ Erro ao obter transcrição: ${transcriptResult.error}`);
    }
    
    res.json(transcriptResult);
    
  } catch (erro) {
    console.error('Erro ao processar requisição de transcrição:', erro);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao obter transcrição do vídeo',
      video_id: '',
      video_url: req.body.videoUrl || '',
      transcript: req.body.includeTimestamps ? [] : '',
      available_languages: []
    });
  }
};

module.exports = {
  getTranscription
}; 