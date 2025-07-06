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
    
    console.log(`✅ Vídeo mais recente encontrado: ${videoInfo.titulo}`);
    res.json(videoInfo);
  } catch (erro) {
    console.error('Erro ao processar requisição:', erro);
    res.status(500).json({ 
      erro: 'Erro ao obter vídeo mais recente',
      mensagem: erro.message 
    });
  }
};

module.exports = {
  getLatestVideo
}; 