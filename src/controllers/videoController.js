const YouTubeExtractor = require('../services/youtubeService');
const { YoutubeCommentDownloader } = require('../services/youtube_comment_downloader');

// Instâncias dos serviços
const youtubeExtractor = new YouTubeExtractor();
const commentDownloader = new YoutubeCommentDownloader();

/**
 * Controller para obter vídeo mais recente de um canal
 */
const getLatestVideo = async (req, res) => {
  try {
    const { channelHandle } = req.body;
    
    if (!channelHandle) {
      return res.status(400).json({ erro: 'É necessário fornecer o handle do canal (ex: @nomedocanal)' });
    }
    
    console.log(`🔍 Buscando vídeo mais recente do canal: ${channelHandle}`);
    const videoInfo = await youtubeExtractor.getLatestVideo(channelHandle);
    
    // Adicionar propriedade 'data' convertendo dataPublicacao
    if (videoInfo.dataPublicacao) {
      videoInfo.data = commentDownloader.converterDataRelativa(videoInfo.dataPublicacao);
    }
    
    // Garantir que sempre temos as propriedades title e titulo
    if (videoInfo.titulo && !videoInfo.title) {
      videoInfo.title = videoInfo.titulo;
    } else if (videoInfo.title && !videoInfo.titulo) {
      videoInfo.titulo = videoInfo.title;
    }
    
    // Validar se conseguimos obter pelo menos o título
    if (!videoInfo.titulo && !videoInfo.title) {
      console.warn('⚠️ Nenhum título foi extraído do vídeo');
      videoInfo.titulo = 'Título não disponível';
      videoInfo.title = 'Título não disponível';
    }
    
    console.log(`✅ Vídeo mais recente encontrado: ${videoInfo.titulo || videoInfo.title}`);
    res.json(videoInfo);
  } catch (erro) {
    console.error('Erro ao processar requisição:', erro);
    res.status(500).json({ 
      erro: 'Erro ao obter vídeo mais recente',
      mensagem: erro.message 
    });
  }
};

/**
 * Controller para obter informações de um vídeo específico
 */
const getVideoInfo = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ erro: 'É necessário fornecer a URL do vídeo' });
    }
    
    // Validar se é uma URL válida do YouTube
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/;
    if (!youtubeUrlPattern.test(videoUrl)) {
      return res.status(400).json({ erro: 'URL deve ser um vídeo válido do YouTube' });
    }
    
    console.log(`🔍 Buscando informações do vídeo: ${videoUrl}`);
    
    // Extrair informações detalhadas do vídeo
    const videoInfo = await youtubeExtractor.getVideoDetails(videoUrl);
    
    // Verificar se houve erro na extração
    if (videoInfo.erro) {
      console.warn(`⚠️ Erro durante extração: ${videoInfo.erro}`);
    }
    
    // Adicionar propriedade 'data' convertendo dataPublicacao
    if (videoInfo.dataPublicacao) {
      videoInfo.data = commentDownloader.converterDataRelativa(videoInfo.dataPublicacao);
    }
    
    // Garantir que sempre temos as propriedades title e titulo
    if (videoInfo.titulo && !videoInfo.title) {
      videoInfo.title = videoInfo.titulo;
    } else if (videoInfo.title && !videoInfo.titulo) {
      videoInfo.titulo = videoInfo.title;
    }
    
    // Validar se conseguimos obter pelo menos o título
    if (!videoInfo.titulo && !videoInfo.title) {
      console.warn('⚠️ Nenhum título foi extraído do vídeo');
      videoInfo.titulo = 'Título não disponível';
      videoInfo.title = 'Título não disponível';
    }
    
    // Adicionar URL do vídeo na resposta
    videoInfo.url = videoUrl;
    
    // Garantir que temos valores numéricos válidos
    videoInfo.visualizacoes = videoInfo.visualizacoes || 0;
    videoInfo.likes = videoInfo.likes || 0;
    videoInfo.comentarios = videoInfo.comentarios || 0;
    videoInfo.duracao = videoInfo.duracao || 0;
    
    // Garantir que temos arrays válidos
    videoInfo.tags = videoInfo.tags || [];
    
    console.log(`✅ Informações do vídeo obtidas: ${videoInfo.titulo || videoInfo.title}`);
    console.log(`📊 Dados extraídos: visualizações=${videoInfo.visualizacoes}, likes=${videoInfo.likes}, comentários=${videoInfo.comentarios}`);
    
    res.json(videoInfo);
  } catch (erro) {
    console.error('Erro ao processar requisição:', erro);
    res.status(500).json({ 
      erro: 'Erro ao obter informações do vídeo',
      mensagem: erro.message 
    });
  }
};

module.exports = {
  getLatestVideo,
  getVideoInfo
}; 