const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { obterComentarios, ORDENACAO_POPULARES, ORDENACAO_RECENTES } = require('./api_comentarios');
const { YoutubeCommentDownloader } = require('./youtube_comment_downloader');
const { searchYouTube } = require('./youtube-search');
const YouTubeExtractor = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YouTube API Unificada',
      version: '1.0.0',
      description: 'API unificada para extração de informações e comentários de vídeos do YouTube'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ]
  },
  apis: ['./server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Instância do extrator de vídeos e conversor de data
const youtubeExtractor = new YouTubeExtractor();
const commentDownloader = new YoutubeCommentDownloader();

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    message: 'YouTube API Unificada - Informações e Comentários',
    documentacao: `/api-docs`,
    endpoints: {
      ytSearch: 'POST /api/yt_search',
      comments: 'POST /api/comments',
      ytLastVideo: 'POST /api/yt_last_video'
    }
  });
});

/**
 * @swagger
 * /api/yt_search:
 *   post:
 *     summary: Pesquisa vídeos no YouTube
 *     description: Retorna resultados de pesquisa do YouTube com informações detalhadas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Termo de pesquisa
 *                 example: "javascript tutorial"
 *               limit:
 *                 type: integer
 *                 description: Número máximo de resultados (1-50)
 *                 default: 10
 *                 minimum: 1
 *                 maximum: 50
 *               order:
 *                 type: string
 *                 description: Tipo de ordenação dos resultados
 *                 enum: [relevance, date, views]
 *                 default: relevance
 *     responses:
 *       200:
 *         description: Lista de resultados da pesquisa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   titulo:
 *                     type: string
 *                     description: Título do vídeo
 *                   url:
 *                     type: string
 *                     description: URL do vídeo no YouTube
 *                   dataPublicacao:
 *                     type: string
 *                     description: Data de publicação (ex - há 2 dias)
 *                   data:
 *                     type: string
 *                     description: Data formatada como DD-MM-YYYY
 *                   nomeCanal:
 *                     type: string
 *                     description: Nome do canal
 *                   handleCanal:
 *                     type: string
 *                     description: Handle do canal (ex - @nomedocanal)
 *                   visualizacoes:
 *                     type: integer
 *                     description: Número de visualizações
 *                   duracao:
 *                     type: integer
 *                     description: Duração em segundos
 *                   thumbnail:
 *                     type: string
 *                     description: URL da thumbnail
 *                   descricao:
 *                     type: string
 *                     description: Descrição do vídeo
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/api/yt_search', async (req, res) => {
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
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Obtém comentários de um vídeo do YouTube
 *     description: Retorna os comentários de um vídeo do YouTube com base na URL ou ID fornecido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoIdOuUrl
 *             properties:
 *               videoIdOuUrl:
 *                 type: string
 *                 description: ID ou URL completa do vídeo do YouTube
 *               limite:
 *                 type: integer
 *                 description: Número máximo de comentários a serem retornados
 *                 default: 50
 *               idioma:
 *                 type: string
 *                 description: Código do idioma para os comentários
 *                 default: pt
 *               ordenacao:
 *                 type: integer
 *                 description: Tipo de ordenação (1 = mais recentes, 0 = mais populares)
 *                 default: 1
 *     responses:
 *       200:
 *         description: Lista de comentários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cid:
 *                     type: string
 *                     description: ID do comentário
 *                   user:
 *                     type: string
 *                     description: Nome do autor do comentário
 *                   text:
 *                     type: string
 *                     description: Texto do comentário
 *                   time:
 *                     type: string
 *                     description: Tempo relativo (ex - há 2 dias)
 *                   data:
 *                     type: string
 *                     description: Data formatada como DD-MM-YYYY
 *                   respostas:
 *                     type: integer
 *                     description: Número de respostas ao comentário
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/api/comments', async (req, res) => {
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
});

/**
 * @swagger
 * /api/yt_last_video:
 *   post:
 *     summary: Obtém informações do vídeo mais recente de um canal
 *     description: Retorna informações detalhadas do vídeo mais recente de um canal do YouTube
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelHandle
 *             properties:
 *               channelHandle:
 *                 type: string
 *                 description: Handle do canal (ex - @nomedocanal)
 *                 example: "@RedCastOficial"
 *     responses:
 *       200:
 *         description: Informações do vídeo mais recente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videoId:
 *                   type: string
 *                   description: ID do vídeo
 *                 titulo:
 *                   type: string
 *                   description: Título do vídeo
 *                 descricao:
 *                   type: string
 *                   description: Descrição do vídeo
 *                 autor:
 *                   type: string
 *                   description: Nome do canal/autor
 *                 channelId:
 *                   type: string
 *                   description: ID do canal
 *                 url:
 *                   type: string
 *                   description: URL do vídeo
 *                 thumbnail:
 *                   type: string
 *                   description: URL da thumbnail
 *                 visualizacoes:
 *                   type: integer
 *                   description: Número de visualizações
 *                 likes:
 *                   type: integer
 *                   description: Número de likes
 *                 duracao:
 *                   type: integer
 *                   description: Duração em segundos
 *                 dataPublicacao:
 *                   type: string
 *                   description: Data de publicação
 *                 data:
 *                   type: string
 *                   description: Data formatada como DD-MM-YYYY
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Tags do vídeo
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/api/yt_last_video', async (req, res) => {
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
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 YouTube API Unificada iniciada!');
  console.log(`📡 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
  console.log('\n📋 Endpoints disponíveis:');
  console.log('  • POST /api/yt_search - Pesquisar vídeos no YouTube');
  console.log('  • POST /api/comments - Obter comentários de vídeos');
  console.log('  • POST /api/yt_last_video - Obter vídeo mais recente de um canal');
}); 