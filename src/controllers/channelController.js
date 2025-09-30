const ChannelService = require('../services/channelService');

// Instância do serviço
const channelService = new ChannelService();

/**
 * Controller para obter todos os vídeos de um canal
 */
const getChannelVideos = async (req, res) => {
  try {
    const { channelHandle, maxVideos = 100 } = req.body;
    
    if (!channelHandle) {
      return res.status(400).json({ 
        erro: 'É necessário fornecer o handle do canal (ex: @nomedocanal ou nomedocanal)' 
      });
    }
    
    console.log(`🔍 Buscando vídeos do canal: ${channelHandle} (máx: ${maxVideos})`);
    
    // Extrai vídeos do canal
    const result = await channelService.getChannelVideos(channelHandle, maxVideos);
    
    console.log(`✅ Vídeos extraídos com sucesso: ${result.totalVideos} vídeos encontrados`);
    
    res.json({
      success: true,
      message: `Vídeos extraídos com sucesso do canal @${result.channelHandle}`,
      data: result
    });
    
  } catch (erro) {
    console.error('❌ Erro ao processar requisição:', erro);
    res.status(500).json({ 
      success: false,
      erro: 'Erro ao extrair vídeos do canal',
      mensagem: erro.message 
    });
  }
};

/**
 * Controller para obter apenas URLs dos vídeos de um canal
 */
const getChannelVideoUrls = async (req, res) => {
  try {
    const { channelHandle } = req.body;
    
    if (!channelHandle) {
      return res.status(400).json({ 
        erro: 'É necessário fornecer o handle do canal (ex: @nomedocanal ou nomedocanal)' 
      });
    }
    
    console.log(`🔍 Buscando URLs dos vídeos do canal: ${channelHandle}`);
    
    // Extrai apenas URLs dos vídeos
    const urls = await channelService.getChannelVideoUrls(channelHandle);
    
    console.log(`✅ URLs extraídas com sucesso: ${urls.length} vídeos encontrados`);
    
    res.json({
      success: true,
      message: `URLs extraídas com sucesso do canal @${channelHandle.replace('@', '')}`,
      data: {
        channelHandle: channelHandle.replace('@', ''),
        totalVideos: urls.length,
        urls: urls
      }
    });
    
  } catch (erro) {
    console.error('❌ Erro ao processar requisição:', erro);
    res.status(500).json({ 
      success: false,
      erro: 'Erro ao extrair URLs dos vídeos do canal',
      mensagem: erro.message 
    });
  }
};

module.exports = {
  getChannelVideos,
  getChannelVideoUrls
}; 