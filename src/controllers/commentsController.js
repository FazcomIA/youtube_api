const { obterComentarios } = require('../services/commentService');

/**
 * Controller para obter comentários de vídeos
 */
const getComments = async (req, res) => {
  try {
    const { videoIdOuUrl, limite = 50, idioma = 'pt', ordenacao = 1 } = req.body;
    
    if (!videoIdOuUrl) {
      return res.status(400).json({ erro: 'É necessário fornecer o ID do vídeo ou a URL' });
    }
    
    console.log(`🔍 Buscando comentários para: ${videoIdOuUrl}`);
    const comentarios = await obterComentarios(videoIdOuUrl, { limite, idioma, ordenacao });
    
    console.log(`✅ Encontrados ${comentarios.length} comentários`);
    res.json(comentarios);
  } catch (erro) {
    console.error('Erro ao processar requisição:', erro);
    res.status(500).json({ 
      erro: 'Erro ao obter comentários',
      mensagem: erro.message 
    });
  }
};

module.exports = {
  getComments
}; 