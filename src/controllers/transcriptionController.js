const TranscriptionService = require('../services/transcriptionService');

// Instância do serviço de transcrição
const transcriptionService = new TranscriptionService();

/**
 * Controller para obter transcrição em texto completo
 */
const getTranscriptionText = async (req, res) => {
  try {
    const { videoUrl, languages } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'É necessário fornecer a URL do vídeo' 
      });
    }
    
    // Validar se é uma URL válida do YouTube
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
    if (!youtubeUrlPattern.test(videoUrl)) {
      return res.status(400).json({ 
        success: false,
        error: 'URL deve ser um vídeo válido do YouTube' 
      });
    }
    
    console.log(`📝 Requisição de transcrição em texto: ${videoUrl}`);
    
    // Configurar idiomas
    const options = {};
    if (languages && Array.isArray(languages)) {
      options.languages = languages;
    }
    
    // Obter transcrição
    const result = await transcriptionService.getTranscriptionText(videoUrl, options);
    
    if (result.success) {
      console.log(`✅ Transcrição em texto obtida com sucesso para: ${videoUrl}`);
      console.log(`📊 Estatísticas: ${result.total_words} palavras, ${result.total_characters} caracteres`);
      
      res.json({
        success: true,
        videoId: result.videoId,
        videoUrl: result.videoUrl,
        language_used: result.language_used,
        available_languages: result.available_languages,
        segments_count: result.segments_count,
        srt_file: result.srt_file,
        transcription: result.transcription,
        total_words: result.total_words,
        total_characters: result.total_characters,
        message: 'Transcrição obtida com sucesso. Arquivo SRT será deletado automaticamente em 30 segundos.'
      });
    } else {
      console.error(`❌ Erro na transcrição: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error,
        videoUrl: result.videoUrl
      });
    }
    
  } catch (erro) {
    console.error('Erro ao processar requisição de transcrição em texto:', erro);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: erro.message 
    });
  }
};

/**
 * Controller para obter transcrição em formato JSON (SRT)
 */
const getTranscriptionJson = async (req, res) => {
  try {
    const { videoUrl, languages } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'É necessário fornecer a URL do vídeo' 
      });
    }
    
    // Validar se é uma URL válida do YouTube
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
    if (!youtubeUrlPattern.test(videoUrl)) {
      return res.status(400).json({ 
        success: false,
        error: 'URL deve ser um vídeo válido do YouTube' 
      });
    }
    
    console.log(`📝 Requisição de transcrição em JSON: ${videoUrl}`);
    
    // Configurar idiomas
    const options = {};
    if (languages && Array.isArray(languages)) {
      options.languages = languages;
    }
    
    // Obter transcrição
    const result = await transcriptionService.getTranscriptionJson(videoUrl, options);
    
    if (result.success) {
      console.log(`✅ Transcrição em JSON obtida com sucesso para: ${videoUrl}`);
      console.log(`📊 Estatísticas: ${result.total_words} palavras, ${result.total_characters} caracteres`);
      
      res.json({
        success: true,
        videoId: result.videoId,
        videoUrl: result.videoUrl,
        language_used: result.language_used,
        available_languages: result.available_languages,
        segments_count: result.segments_count,
        srt_file: result.srt_file,
        transcript: result.transcript,
        total_words: result.total_words,
        total_characters: result.total_characters,
        message: 'Transcrição obtida com sucesso. Arquivo SRT será deletado automaticamente em 30 segundos.'
      });
    } else {
      console.error(`❌ Erro na transcrição: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error,
        videoUrl: result.videoUrl
      });
    }
    
  } catch (erro) {
    console.error('Erro ao processar requisição de transcrição em JSON:', erro);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: erro.message 
    });
  }
};

module.exports = {
  getTranscriptionText,
  getTranscriptionJson
}; 