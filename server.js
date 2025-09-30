const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Importar rotas
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Detectar ambiente e configurar URL base
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Configuração de CORS flexível
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: aplicações mobile, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Em produção, permitir todas as origens para máxima compatibilidade
    if (NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    // Em desenvolvimento, aplicar verificações mais rigorosas
    const developmentOrigins = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/127\.0\.0\.1:\d+$/
    ];
    
    // Adicionar origens personalizadas das variáveis de ambiente
    if (process.env.CORS_ORIGINS) {
      const customOrigins = process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
      developmentOrigins.push(...customOrigins);
    }
    
    const isAllowed = developmentOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      }
      return pattern.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS: Origem não permitida em desenvolvimento - ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));

// Função para detectar URL base dinamicamente
const getBaseUrl = (req) => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('x-forwarded-host') || req.get('host') || `localhost:${PORT}`;
  return `${protocol}://${host}`;
};

// Configuração do Swagger com detecção dinâmica
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FCI - API Youtube v1',
      version: '1.0.0',
      description: 'API unificada para extração de informações e comentários de vídeos do YouTube com transcrições via serviço externo'
    },
    servers: [
      {
        url: BASE_URL,
        description: NODE_ENV === 'production' ? 'Servidor de produção' : 'Servidor de desenvolvimento'
      }
    ]
  },
  apis: ['./server.js', './src/routes/*.js', './src/controllers/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware personalizado para Swagger com URL dinâmica
app.use('/api-docs', (req, res, next) => {
  const dynamicBaseUrl = getBaseUrl(req);
  
  // Atualizar as configurações do Swagger dinamicamente
  const dynamicSwaggerOptions = {
    ...swaggerOptions,
    definition: {
      ...swaggerOptions.definition,
      servers: [
        {
          url: dynamicBaseUrl,
          description: NODE_ENV === 'production' ? 'Servidor de produção' : 'Servidor de desenvolvimento'
        }
      ]
    }
  };
  
  const dynamicSwaggerDocs = swaggerJsDoc(dynamicSwaggerOptions);
  req.swaggerDoc = dynamicSwaggerDocs;
  next();
}, swaggerUi.serve, swaggerUi.setup());

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    message: 'FCI - API Youtube v1 - Informações, Comentários e Transcrições',
    documentacao: `/api-docs`,
    endpoints: {
      ytSearch: 'POST /api/yt_search',
      comments: 'POST /api/comments',
      ytLastVideo: 'POST /api/yt_last_video',
      ytVideoInfo: 'POST /api/yt_video_info',
      transcription: 'POST /api/transcription',
      transcriptionJson: 'POST /api/transcription/json',
      channelVideos: 'POST /api/channel/videos',
      channelUrls: 'POST /api/channel/urls',
      
      health: 'GET /health'
    },
    features: {
      videoSearch: 'Pesquisa avançada de vídeos no YouTube',
      commentExtraction: 'Extração de comentários com filtros',
      videoInfo: 'Informações detalhadas de vídeos e canais',
      transcription: 'Transcrição completa de vídeos com arquivos SRT temporários'
    }
  });
});

// Usar as rotas
app.use(routes);

// Adicionar rotas de canal diretamente para garantir que apareçam no Swagger
const { getChannelVideos, getChannelVideoUrls } = require('./src/controllers/channelController');

app.post('/api/channel/videos', getChannelVideos);
app.post('/api/channel/urls', getChannelVideoUrls);

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
 * /api/yt_video_info:
 *   post:
 *     summary: Obtém informações de um vídeo específico
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
 *     responses:
 *       200:
 *         description: Informações do vídeo
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/transcription:
 *   post:
 *     summary: Obtém transcrição completa em texto de um vídeo do YouTube
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
 *                 description: "Lista de idiomas preferidos (ex: [\"pt\", \"pt-BR\", \"en\"])"
 *                 default: ["pt", "pt-BR", "en"]
 *     responses:
 *       200:
 *         description: Transcrição em texto completo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 videoId:
 *                   type: string
 *                 videoUrl:
 *                   type: string
 *                 language_used:
 *                   type: string
 *                 available_languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 segments_count:
 *                   type: integer
 *                 srt_file:
 *                   type: string
 *                 transcription:
 *                   type: string
 *                 total_words:
 *                   type: integer
 *                 total_characters:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/transcription/json:
 *   post:
 *     summary: Obtém transcrição em formato JSON (SRT) de um vídeo do YouTube
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
 *                 description: "Lista de idiomas preferidos (ex: [\"pt\", \"pt-BR\", \"en\"])"
 *                 default: ["pt", "pt-BR", "en"]
 *     responses:
 *       200:
 *         description: Transcrição em formato JSON com timestamps
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 videoId:
 *                   type: string
 *                 videoUrl:
 *                   type: string
 *                 language_used:
 *                   type: string
 *                 available_languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 segments_count:
 *                   type: integer
 *                 srt_file:
 *                   type: string
 *                 transcript:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         description: Tempo inicial (HH:MM:SS)
 *                       dur:
 *                         type: string
 *                         description: Duração em segundos
 *                       text:
 *                         type: string
 *                         description: Texto do segmento
 *                 total_words:
 *                   type: integer
 *                 total_characters:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */





/**
 * @swagger
 * /api/channel/videos:
 *   post:
 *     summary: Extrai todos os vídeos de um canal do YouTube
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
 *                 description: Handle do canal
 *               maxVideos:
 *                 type: integer
 *                 description: Número máximo de vídeos a extrair (padrão: 100)
 *                 default: 100
 *     responses:
 *       200:
 *         description: Lista completa de vídeos do canal
 *       400:
 *         description: Erro na requisição
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/channel/urls:
 *   post:
 *     summary: Extrai apenas as URLs dos vídeos de um canal
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
 *                 description: Handle do canal
 *     responses:
 *       200:
 *         description: Lista de URLs dos vídeos
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
  console.log(`📡 Servidor rodando em ${BASE_URL}`);
  console.log(`📚 Documentação Swagger disponível em ${BASE_URL}/api-docs`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  
  console.log('\n📋 Endpoints disponíveis:');
  console.log('  • POST /api/yt_search - Pesquisar vídeos no YouTube');
  console.log('  • POST /api/comments - Obter comentários de vídeos');
  console.log('  • POST /api/yt_last_video - Obter vídeo mais recente de um canal');
  console.log('  • POST /api/yt_video_info - Obter informações de vídeo específico');
  console.log('  • POST /api/transcription - Obter transcrição em texto completo');
  console.log('  • POST /api/transcription/json - Obter transcrição em formato JSON');
  console.log('  • POST /api/channel/videos - Extrair todos os vídeos de um canal');
  console.log('  • POST /api/channel/urls - Extrair URLs dos vídeos de um canal');

  console.log('  • GET /health - Verificar saúde da API');
}); 