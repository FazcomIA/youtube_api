const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Importar rotas
const routes = require('./src/routes');

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
      title: 'FCI - API Youtube v1',
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

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    message: 'FCI - API Youtube v1 - Informações e Comentários',
    documentacao: `/api-docs`,
    endpoints: {
      ytSearch: 'POST /api/yt_search',
      comments: 'POST /api/comments',
      ytLastVideo: 'POST /api/yt_last_video',
      transcription: 'POST /api/transcription',
      health: 'GET /health'
    }
  });
});

// Usar as rotas
app.use(routes);

/**
 * @swagger
 * /api/yt_search:
 *   post:
 *     summary: Pesquisa vídeos no YouTube
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
 *               limit:
 *                 type: integer
 *                 description: Número máximo de resultados (1-50)
 *                 default: 10
 *               order:
 *                 type: string
 *                 description: Ordenação dos resultados
 *                 enum: [relevance, date, views]
 *                 default: relevance
 *     responses:
 *       200:
 *         description: Lista de resultados da pesquisa
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Obtém comentários de um vídeo do YouTube
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
 *                 description: ID ou URL do vídeo do YouTube
 *               limite:
 *                 type: integer
 *                 description: Número máximo de comentários
 *                 default: 50
 *               idioma:
 *                 type: string
 *                 description: Código do idioma
 *                 default: pt
 *               ordenacao:
 *                 type: integer
 *                 description: Ordenação (1 = recentes, 0 = populares)
 *                 default: 1
 *     responses:
 *       200:
 *         description: Lista de comentários
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/yt_last_video:
 *   post:
 *     summary: Obtém vídeo mais recente de um canal
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
 *     responses:
 *       200:
 *         description: Informações do vídeo mais recente
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/transcription:
 *   post:
 *     summary: Obtém transcrição de um vídeo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoUrl
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 description: URL do vídeo do YouTube
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de idiomas preferidos
 *                 default: ["pt", "pt-BR", "en"]
 *               includeTimestamps:
 *                 type: boolean
 *                 description: Incluir timestamps na transcrição
 *                 default: false
 *     responses:
 *       200:
 *         description: Transcrição do vídeo
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica saúde da API
 *     responses:
 *       200:
 *         description: Status da API
 */

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 FCI - API Youtube v1 iniciada!');
  console.log(`📡 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
  console.log('\n📋 Endpoints disponíveis:');
  console.log('  • POST /api/yt_search - Pesquisar vídeos no YouTube');
  console.log('  • POST /api/comments - Obter comentários de vídeos');
  console.log('  • POST /api/yt_last_video - Obter vídeo mais recente de um canal');
  console.log('  • POST /api/transcription - Obter transcrição de vídeos');
  console.log('  • GET /health - Verificar saúde da API');
}); 