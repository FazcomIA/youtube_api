const { YouTubeTranscriptApi } = require('../services/transcriptionService');

// Instância do serviço
const youtubeTranscriptApi = new YouTubeTranscriptApi();

/**
 * Controller para obter transcrição de vídeos usando API externa (kome.ai)
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
    
    console.log(`🔍 Solicitação de transcrição via kome.ai: ${videoUrl}`);
    console.log(`📋 Parâmetros: timestamps=${includeTimestamps}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    
    let videoId;
    try {
      // Extrair o ID do vídeo da URL
      videoId = youtubeTranscriptApi.extractVideoId(videoUrl);
      console.log(`🆔 Video ID extraído: ${videoId}`);
    } catch (extractError) {
      console.error('❌ Erro ao extrair ID do vídeo:', extractError.message);
      return res.status(400).json({
        success: false,
        error: 'URL do vídeo inválida. Verifique se é uma URL válida do YouTube.',
        video_id: '',
        video_url: videoUrl,
        transcript: includeTimestamps ? [] : ''
      });
    }
    
    // Obter transcrição via kome.ai
    const transcriptResult = await youtubeTranscriptApi.getTranscript(videoId, {
      languages,
      includeTimestamps
    });
    
    if (transcriptResult.success) {
      console.log(`✅ Transcrição obtida com sucesso via kome.ai (${transcriptResult.segments_count} segmentos)`);
      res.json(transcriptResult);
    } else {
      console.log(`❌ Erro ao obter transcrição via kome.ai: ${transcriptResult.error}`);
      // Retornar status 200 mas com success: false (conforme formato da API)
      res.json(transcriptResult);
    }
    
  } catch (erro) {
    console.error('❌ Erro crítico ao processar requisição de transcrição:', {
      message: erro.message,
      stack: erro.stack,
      videoUrl: req.body.videoUrl,
      environment: process.env.NODE_ENV
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor ao processar transcrição',
      video_id: '',
      video_url: req.body.videoUrl || '',
      transcript: req.body.includeTimestamps ? [] : '',
      service: 'kome.ai'
    });
  }
};

module.exports = {
  getTranscription
}; 