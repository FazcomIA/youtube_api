/**
 * Módulo para pesquisa no YouTube
 * Retorna resultados formatados conforme especificação da API
 */

const yts = require('yt-search');
const { YoutubeCommentDownloader } = require('./youtube_comment_downloader');

// Instância do conversor de datas
const commentDownloader = new YoutubeCommentDownloader();

/**
 * Pesquisa vídeos no YouTube
 * @param {string} query - Termo de pesquisa
 * @param {Object} opcoes - Opções de pesquisa
 * @param {number} [opcoes.limit=10] - Número máximo de resultados
 * @param {string} [opcoes.order='relevance'] - Tipo de ordenação ('relevance', 'date', 'views')
 * @returns {Promise<Array>} - Array com resultados da pesquisa
 */
async function searchYouTube(query, opcoes = {}) {
  // Validações
  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new Error('É necessário fornecer um termo de pesquisa válido');
  }

  const { limit = 10, order = 'relevance' } = opcoes;

  if (typeof limit !== 'number' || limit < 1 || limit > 50) {
    throw new Error('O limite deve ser um número entre 1 e 50');
  }

  const ordenacoesValidas = ['relevance', 'date', 'views'];
  if (!ordenacoesValidas.includes(order)) {
    throw new Error(`Ordenação deve ser uma das seguintes: ${ordenacoesValidas.join(', ')}`);
  }

  try {
    console.log(`🔍 Pesquisando no YouTube: "${query}" (limite: ${limit}, ordenação: ${order})`);
    
    // Realizar pesquisa usando yt-search
    const searchResults = await yts(query);
    
    if (!searchResults || !searchResults.videos) {
      return [];
    }

    // Filtrar apenas vídeos
    let videos = searchResults.videos;

    // Aplicar ordenação personalizada
    if (order === 'date') {
      videos = videos.sort((a, b) => {
        // Ordenar por data de publicação (mais recentes primeiro)
        const dataA = extrairDataPublicacao(a.ago);
        const dataB = extrairDataPublicacao(b.ago);
        return dataB - dataA;
      });
    } else if (order === 'views') {
      videos = videos.sort((a, b) => {
        // Ordenar por visualizações (mais visualizados primeiro)
        return parseInt(b.views) - parseInt(a.views);
      });
    }
    // 'relevance' mantém a ordem padrão do YouTube

    // Aplicar limite
    videos = videos.slice(0, limit);

    // Formatar resultados conforme especificação
    const resultadosFormatados = videos.map(video => {
      return {
        titulo: video.title || '',
        url: video.url || '',
        dataPublicacao: formatarDataPublicacao(video.ago) || '',
        data: commentDownloader.converterDataRelativa(formatarDataPublicacao(video.ago)) || '',
        nomeCanal: video.author?.name || '',
        handleCanal: extrairHandleCanal(video.author?.url) || '',
        visualizacoes: parseInt(video.views) || 0,
        duracao: video.duration?.seconds || 0,
        thumbnail: video.thumbnail || '',
        descricao: video.description || ''
      };
    });

    console.log(`✅ Encontrados ${resultadosFormatados.length} resultados para "${query}"`);
    return resultadosFormatados;

  } catch (error) {
    console.error('Erro ao pesquisar no YouTube:', error.message);
    throw new Error(`Falha na pesquisa: ${error.message}`);
  }
}

/**
 * Formata a data de publicação para formato padrão
 * @param {string} agoText - Texto como "2 days ago", "1 week ago"
 * @returns {string} - Data formatada ou texto original
 */
function formatarDataPublicacao(agoText) {
  if (!agoText) return '';
  
  // Converter para português se necessário
  const traducoes = {
    'second': 'segundo',
    'seconds': 'segundos', 
    'minute': 'minuto',
    'minutes': 'minutos',
    'hour': 'hora',
    'hours': 'horas',
    'day': 'dia',
    'days': 'dias',
    'week': 'semana',
    'weeks': 'semanas',
    'month': 'mês',
    'months': 'meses',
    'year': 'ano',
    'years': 'anos',
    'ago': 'atrás'
  };

  let textoFormatado = agoText.toLowerCase();
  for (const [eng, pt] of Object.entries(traducoes)) {
    textoFormatado = textoFormatado.replace(new RegExp(eng, 'g'), pt);
  }

  return `há ${textoFormatado.replace('atrás', '').trim()}`;
}

/**
 * Extrai timestamp de uma data relativa para comparação
 * @param {string} agoText - Texto como "2 days ago", "1 week ago"
 * @returns {number} - Timestamp para comparação
 */
function extrairDataPublicacao(agoText) {
  if (!agoText) return 0;
  
  const agora = Date.now();
  const texto = agoText.toLowerCase();
  
  // Extrair número e unidade
  const match = texto.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/);
  if (!match) return agora;
  
  const quantidade = parseInt(match[1]);
  const unidade = match[2];
  
  let multiplicador = 1000; // padrão: milissegundos
  
  switch (unidade) {
    case 'second': multiplicador = 1000; break;
    case 'minute': multiplicador = 60 * 1000; break;
    case 'hour': multiplicador = 60 * 60 * 1000; break;
    case 'day': multiplicador = 24 * 60 * 60 * 1000; break;
    case 'week': multiplicador = 7 * 24 * 60 * 60 * 1000; break;
    case 'month': multiplicador = 30 * 24 * 60 * 60 * 1000; break;
    case 'year': multiplicador = 365 * 24 * 60 * 60 * 1000; break;
  }
  
  return agora - (quantidade * multiplicador);
}

/**
 * Extrai o handle do canal a partir da URL
 * @param {string} authorUrl - URL do canal
 * @returns {string} - Handle do canal (ex: @nomedocanal)
 */
function extrairHandleCanal(authorUrl) {
  if (!authorUrl) return '';
  
  try {
    // Extrair ID/handle do canal da URL
    if (authorUrl.includes('/channel/')) {
      const channelId = authorUrl.split('/channel/')[1];
      return `@${channelId.substring(0, 15)}`; // Limitar tamanho
    } else if (authorUrl.includes('/c/')) {
      const channelName = authorUrl.split('/c/')[1];
      return `@${channelName}`;
    } else if (authorUrl.includes('/user/')) {
      const userName = authorUrl.split('/user/')[1];
      return `@${userName}`;
    } else if (authorUrl.includes('/@')) {
      const handle = authorUrl.split('/@')[1];
      return `@${handle}`;
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

module.exports = {
  searchYouTube,
  formatarDataPublicacao,
  extrairHandleCanal,
  extrairDataPublicacao
}; 