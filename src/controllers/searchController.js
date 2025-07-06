const { searchYouTube } = require('../services/searchService');

/**
 * Controller para pesquisa de vídeos no YouTube
 */
const searchVideos = async (req, res) => {
  try {
    const { query, limit = 10, order = 'relevance' } = req.body;
    
    if (!query) {
      return res.status(400).json({ erro: 'É necessário fornecer um termo de pesquisa (query)' });
    }
    
    console.log(`🔍 Pesquisando vídeos: "${query}" (limite: ${limit}, ordenação: ${order})`);
    const resultados = await searchYouTube(query, { limit, order });
    
    console.log(`✅ Retornando ${resultados.length} resultados da pesquisa`);
    res.json(resultados);
  } catch (erro) {
    console.error('Erro ao processar pesquisa:', erro);
    res.status(500).json({ 
      erro: 'Erro ao pesquisar vídeos',
      mensagem: erro.message 
    });
  }
};

module.exports = {
  searchVideos
}; 