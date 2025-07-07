const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Importar rotas
const routes = require('./src/routes');

// Importar CookieManager para inicialização
const CookieManager = require('./src/services/cookieManager');

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
      description: 'API unificada para extração de informações e comentários de vídeos do YouTube'
    },
    servers: [
      {
        url: BASE_URL,
        description: NODE_ENV === 'production' ? 'Servidor de produção' : 'Servidor de desenvolvimento'
      }
    ]
  },
  apis: ['./server.js']
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
    message: 'FCI - API Youtube v1 - Informações e Comentários',
    documentacao: `/api-docs`,
    endpoints: {
      ytSearch: 'POST /api/yt_search',
      comments: 'POST /api/comments',
      ytLastVideo: 'POST /api/yt_last_video',
      ytVideoInfo: 'POST /api/yt_video_info',
      transcription: 'POST /api/transcription',
      cookies: {
        upload: 'POST /api/cookies/upload',
        info: 'GET /api/cookies/info',
        check: 'GET /api/cookies/check',
        delete: 'DELETE /api/cookies',
        defaults: 'GET /api/cookies/defaults',
        restore: 'POST /api/cookies/restore',
        status: 'GET /api/cookies/status',
        forceInit: 'POST /api/cookies/force-init'
      },
      health: 'GET /health'
    },
    features: {
      autoInitialization: 'API já funciona com cookies padrão para transcrições',
      cookieManagement: 'Sistema completo de gerenciamento de cookies',
      persistentStorage: 'Cookies salvos persistem entre reinicializações'
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

/**
 * @swagger
 * /api/cookies/upload:
 *   post:
 *     summary: Upload de cookies do YouTube para transcrições
 *     description: Permite enviar cookies do navegador para contornar bloqueios de IP/bot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cookies
 *             properties:
 *               cookies:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         value:
 *                           type: string
 *                         domain:
 *                           type: string
 *                   - type: object
 *                     additionalProperties:
 *                       type: string
 *                   - type: string
 *                 description: Cookies em formato array, objeto ou string
 *     responses:
 *       200:
 *         description: Cookies salvos com sucesso
 *       400:
 *         description: Erro na requisição ou formato inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies/info:
 *   get:
 *     summary: Obtém informações dos cookies salvos
 *     responses:
 *       200:
 *         description: Informações dos cookies
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies/check:
 *   get:
 *     summary: Verifica se há cookies salvos
 *     responses:
 *       200:
 *         description: Status dos cookies
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies:
 *   delete:
 *     summary: Remove todos os cookies salvos
 *     responses:
 *       200:
 *         description: Cookies removidos com sucesso
 *       400:
 *         description: Erro ao remover cookies
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies/defaults:
 *   get:
 *     summary: Obtém cookies padrão para transcrições
 *     responses:
 *       200:
 *         description: Cookies padrão
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies/restore:
 *   post:
 *     summary: Restaura cookies padrão
 *     description: Sobrescreve cookies existentes com cookies padrão funcionais
 *     responses:
 *       200:
 *         description: Cookies padrão restaurados com sucesso
 *       400:
 *         description: Falha ao restaurar cookies
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies/status:
 *   get:
 *     summary: Verifica o status do gerenciamento de cookies
 *     responses:
 *       200:
 *         description: Status do gerenciamento de cookies
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/cookies/force-init:
 *   post:
 *     summary: Força reinicialização do sistema de cookies (emergência)
 *     description: Endpoint de emergência para reinicializar o sistema de cookies quando há problemas
 *     responses:
 *       200:
 *         description: Sistema reinicializado com sucesso
 *       500:
 *         description: Erro na reinicialização
 */

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('🚀 FCI - API Youtube v1 iniciada!');
  console.log(`📡 Servidor rodando em ${BASE_URL}`);
  console.log(`📚 Documentação Swagger disponível em ${BASE_URL}/api-docs`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  
  // Garantir inicialização dos cookies padrão
  try {
    console.log('\n🔄 Inicializando sistema de cookies...');
    const cookieManager = new CookieManager();
    await cookieManager.initializeDefaultCookiesIfNeeded();
    
    const hasCookies = await cookieManager.hasCookies();
    if (hasCookies) {
      const info = await cookieManager.getCookieInfo();
      console.log(`✅ Sistema de cookies operacional (${info.count} cookies carregados)`);
    } else {
      console.log('⚠️ Falha na inicialização do sistema de cookies');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar cookies:', error.message);
    console.log('⚠️ API funcionará sem cookies (funcionalidade limitada)');
  }
  
  console.log('\n📋 Endpoints disponíveis:');
  console.log('  • POST /api/yt_search - Pesquisar vídeos no YouTube');
  console.log('  • POST /api/comments - Obter comentários de vídeos');
  console.log('  • POST /api/yt_last_video - Obter vídeo mais recente de um canal');
  console.log('  • POST /api/yt_video_info - Obter informações de vídeo específico');
  console.log('  • POST /api/transcription - Obter transcrição de vídeos');
  console.log('  • GET /health - Verificar saúde da API');
  console.log('\n🍪 Sistema de Cookies:');
  console.log('  • Cookies padrão carregados automaticamente');
  console.log('  • Transcrições já funcionam sem configuração');
  console.log('  • GET /api/cookies/status - Status do sistema');
  console.log('  • POST /api/cookies/upload - Upload cookies personalizados');
}); 