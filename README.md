# FCI - API Youtube v1 🎬

API RESTful unificada para extração de informações e comentários de vídeos do YouTube em Node.js.

## 🔗 Links Importantes

- **📦 Docker Hub:** [nexxusdigital/fci-api-youtube-v1](https://hub.docker.com/r/nexxusdigital/fci-api-youtube-v1)
- **🐙 GitHub:** [FazcomIA/youtube_api](https://github.com/FazcomIA/youtube_api)

## 🚀 Início Rápido

### Usando Docker (Recomendado)
```bash
# Executar diretamente do Docker Hub
docker run -p 3000:3000 nexxusdigital/fci-api-youtube-v1:latest

# Ou com Docker Compose
curl -O https://raw.githubusercontent.com/FazcomIA/youtube_api/master/docker/docker-compose.hub.yml
docker-compose -f docker-compose.hub.yml up
```

### Desenvolvimento Local
```bash
# Clonar o repositório
git clone https://github.com/FazcomIA/youtube_api.git
cd youtube_api

# Instalar dependências
npm install

# Executar
npm start
```

## 🚀 Funcionalidades

### ✅ Pesquisa de Vídeos no YouTube
- Pesquisar vídeos por termo/palavra-chave
- Resultados com título, URL, data, canal, handle, views, duração
- Filtro de quantidade de resultados (1-50)
- Dados formatados e estruturados

### ✅ Extração de Vídeo Mais Recente
- Obter informações do vídeo mais recente de um canal por handle (@canal)
- Dados completos: título, descrição, autor, visualizações, likes, duração, tags, etc.

### ✅ Extração de Vídeos de Canal (NOVO!)
- **📺 Extração completa**: Obter todos os vídeos de um canal por handle (@canal)
- **🔗 URLs simples**: Extrair apenas as URLs dos vídeos de um canal
- **📊 Informações básicas**: Título, URL, duração, visualizações e data de publicação
- **🎯 Múltiplas opções**: 3 endpoints diferentes para diferentes necessidades
- **⚡ Alta performance**: Usa scraping direto do YouTube sem dependências externas

### ✅ Extração de Comentários
- Comentários de vídeos por URL ou ID
- Filtragem por quantidade e ordenação (recentes/populares)
- Formato JSON personalizado com informações úteis

### ✅ Extração de Transcrição (Sistema Atualizado!)
- **🌟 Biblioteca própria**: Implementação Node.js da youtube_transcript_api
- **🔧 Zero configuração**: Funciona imediatamente em qualquer servidor
- **🌍 Compatibilidade total**: Sem problemas de cookies ou bloqueios de IP
- **📝 Texto completo**: Transcrição completa do vídeo
- **⏱️ Timestamps precisos**: Suporte a timestamps reais do YouTube
- **🎯 Detecção automática**: Idioma detectado automaticamente
- **🛡️ Mais estável**: Sem dependência de sistemas externos
- **📁 Arquivos SRT**: Geração automática de arquivos SRT temporários
- **🗑️ Limpeza automática**: Arquivos deletados após 30 segundos

## 🛠️ Estrutura do Projeto

```
ytb_api/
├── src/
│   ├── controllers/          # Controllers para cada endpoint
│   ├── routes/              # Definição das rotas
│   └── services/            # Lógica de negócio
├── docker/                  # Arquivos Docker
├── scripts/                 # Scripts utilitários
├── server.js               # Servidor principal
├── package.json            # Dependências e scripts
└── README.md              # Esta documentação
```

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Para desenvolvimento (com auto-reload)
npm run dev
```

## 🐳 Docker

### Build Local
```bash
# Construir imagem local
npm run docker:build

# Executar com Docker Compose
npm run docker:compose

# Parar containers
npm run docker:compose:down
```

### 🌍 Build Multi-Arquitetura (Mac + Linux)

Para criar uma imagem compatível com Mac (ARM64) e servidores Linux (AMD64):

#### Método 1: Script Automatizado (Recomendado)
```bash
# Fazer build e push para Docker Hub
./scripts/docker-build-push.sh SEU_USUARIO_DOCKERHUB

# Exemplo:
./scripts/docker-build-push.sh mateusgomes

# Com versão específica:
./scripts/docker-build-push.sh mateusgomes 1.2.0
```

#### Método 2: Comandos Manuais
```bash
# 1. Configurar buildx
npm run docker:setup:buildx

# 2. Login no Docker Hub
docker login

# 3. Build multi-arquitetura
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile \
  -t SEU_USUARIO/fci-api-youtube-v1:latest \
  --push .
```

### 📦 Usar Imagem do Docker Hub

#### No Mac (ARM64/Intel):
```bash
docker run -p 3000:3000 SEU_USUARIO/fci-api-youtube-v1:latest
```

#### No Servidor Linux (AMD64):
```bash
docker run -p 3000:3000 SEU_USUARIO/fci-api-youtube-v1:latest
```

#### Docker Compose com imagem do Hub:
```yaml
services:
  fci-api-youtube:
    image: SEU_USUARIO/fci-api-youtube-v1:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## 🔧 Dependências

- `express` - Framework web
- `cors` - Suporte CORS
- `swagger-jsdoc` & `swagger-ui-express` - Documentação API
- `axios` & `cheerio` - Scraping e requisições
- `youtube-sr` & `youtubei` - Bibliotecas auxiliares YouTube

## 🌍 Variáveis de Ambiente

Para configurar a aplicação em produção, defina as seguintes variáveis de ambiente:

```bash
# Essencial para produção
NODE_ENV=production

# Configurações opcionais
PORT=3000
BASE_URL=https://seu-dominio.com  # (auto-detectado na maioria dos casos)
LOG_LEVEL=info
API_TIMEOUT=30000
TRANSCRIPT_TIMEOUT=60000  # Timeout para API de transcrição (em ms)
YOUTUBE_MAX_RESULTS=50
YOUTUBE_DEFAULT_LANGUAGE=pt
CORS_ORIGINS=https://meusite.com,https://localhost:3000  # (para desenvolvimento)
RATE_LIMIT_MAX=100
```

**Importante para EasyPanel/Produção:**
- `NODE_ENV=production` - Define o ambiente como produção
- `BASE_URL` - (Opcional) URL completa da sua aplicação se não for detectada automaticamente
- `TRANSCRIPT_TIMEOUT` - Timeout para requisições de transcrição (padrão: 60 segundos)
- `CORS_ORIGINS` - (Opcional) Domínios específicos para CORS em desenvolvimento

**Nota:** A aplicação detecta automaticamente a URL base através dos headers HTTP do EasyPanel/proxy reverso. Você só precisa definir `BASE_URL` se quiser forçar uma URL específica.

## 💻 Uso

### Iniciar a API:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`.

### Documentação Interativa:
Acesse `http://localhost:3000/api-docs` para a documentação Swagger completa.

## 🌐 Endpoints da API

### 🏠 Rota Principal
```
GET /
```
Retorna informações básicas da API e lista de endpoints.

### 🔍 Pesquisa de Vídeos
```
POST /api/yt_search
```

**Parâmetros:**
```json
{
  "query": "javascript tutorial",
  "limit": 10,
  "order": "relevance"
}
```

### 💬 Comentários
```
POST /api/comments
```

**Parâmetros:**
```json
{
  "videoIdOuUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "limite": 20,
  "idioma": "pt",
  "ordenacao": 1
}
```

### 🎬 Vídeo Mais Recente
```
POST /api/yt_last_video
```

**Parâmetros:**
```json
{
  "channelHandle": "@RedCastOficial"
}
```

### 📹 Informações de Vídeo Específico
```
POST /api/yt_video_info
```

**Parâmetros:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Retorna:** Título, autor, visualizações, likes, data de publicação, duração, comentários, tags, descrição, etc.

### 📺 Extração de Vídeos de Canal (NOVO!)
```
POST /api/channel/videos
```

**Parâmetros:**
```json
{
  "channelHandle": "@FazcomIA"
}
```

**Retorna:** Lista completa de vídeos com todas as informações (título, URL, thumbnail, duração, views, etc.)

```
POST /api/channel/urls
```

**Parâmetros:**
```json
{
  "channelHandle": "@FazcomIA"
}
```

**Retorna:** Lista de URLs dos vídeos do canal

```
POST /api/channel/basic
```

**Parâmetros:**
```json
{
  "channelHandle": "@FazcomIA"
}
```

**Retorna:** Informações básicas dos vídeos (título, URL, duração, views, data de publicação)

### 📝 Transcrição em Texto Completo
```
POST /api/transcription
```

**Parâmetros:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "languages": ["pt", "pt-BR", "en"]
}
```

### 📝 Transcrição em Formato JSON (SRT)
```
POST /api/transcription/json
```

**Parâmetros:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "languages": ["pt", "pt-BR", "en"]
}
```

**🌟 Novidades da versão 1.3.0:**
- **Biblioteca própria**: Implementação Node.js da youtube_transcript_api
- **Arquivos SRT**: Geração automática de arquivos SRT temporários
- **Limpeza automática**: Arquivos deletados após 30 segundos
- **Timestamps precisos**: Suporte a timestamps reais do YouTube
- **Múltiplos idiomas**: Suporte a transcrições em vários idiomas

### 🏥 Health Check
```
GET /health
```

Verifica se a API está funcionando corretamente.

## 📊 Exemplos de Uso

### JavaScript/Node.js
```javascript
// Pesquisar vídeos
const searchResponse = await fetch('http://localhost:3000/api/yt_search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'javascript tutorial', limit: 5 })
});
const searchResults = await searchResponse.json();

// Obter comentários
const commentsResponse = await fetch('http://localhost:3000/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoIdOuUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
    limite: 10
  })
});
const comments = await commentsResponse.json();

// Obter transcrição em texto completo
const transcriptionResponse = await fetch('http://localhost:3000/api/transcription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
    languages: ['pt', 'pt-BR', 'en']
  })
});
const transcription = await transcriptionResponse.json();

// Obter transcrição em formato JSON (SRT)
const transcriptionJsonResponse = await fetch('http://localhost:3000/api/transcription/json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
    languages: ['pt', 'pt-BR', 'en']
  })
});
const transcriptionJson = await transcriptionJsonResponse.json();

// Obter informações de vídeo específico
const videoInfoResponse = await fetch('http://localhost:3000/api/yt_video_info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
  })
});
const videoInfo = await videoInfoResponse.json();

// Obter todos os vídeos de um canal
const channelVideosResponse = await fetch('http://localhost:3000/api/channel/videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelHandle: '@FazcomIA'
  })
});
const channelVideos = await channelVideosResponse.json();

// Obter apenas URLs dos vídeos de um canal
const channelUrlsResponse = await fetch('http://localhost:3000/api/channel/urls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelHandle: '@FazcomIA'
  })
});
const channelUrls = await channelUrlsResponse.json();

// Obter informações básicas dos vídeos de um canal
const channelBasicResponse = await fetch('http://localhost:3000/api/channel/basic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelHandle: '@FazcomIA'
  })
});
const channelBasic = await channelBasicResponse.json();

### cURL
```bash
# Pesquisa de vídeos
curl -X POST http://localhost:3000/api/yt_search \
  -H "Content-Type: application/json" \
  -d '{"query": "javascript tutorial", "limit": 5}'

# Comentários
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"videoIdOuUrl": "https://www.youtube.com/watch?v=VIDEO_ID", "limite": 5}'

# Transcrição em texto completo
curl -X POST http://localhost:3000/api/transcription \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID", "languages": ["pt", "pt-BR", "en"]}'

# Transcrição em formato JSON (SRT)
curl -X POST http://localhost:3000/api/transcription/json \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID", "languages": ["pt", "pt-BR", "en"]}'

# Informações de vídeo específico
curl -X POST http://localhost:3000/api/yt_video_info \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'

# Extrair todos os vídeos de um canal
curl -X POST http://localhost:3000/api/channel/videos \
  -H "Content-Type: application/json" \
  -d '{"channelHandle": "@FazcomIA"}'

# Extrair apenas URLs dos vídeos de um canal
curl -X POST http://localhost:3000/api/channel/urls \
  -H "Content-Type: application/json" \
  -d '{"channelHandle": "@FazcomIA"}'

# Extrair informações básicas dos vídeos de um canal
curl -X POST http://localhost:3000/api/channel/basic \
  -H "Content-Type: application/json" \
  -d '{"channelHandle": "@FazcomIA"}'

# Health check
curl -X GET http://localhost:3000/health
```

## 🚨 Limitações

- Dependente da estrutura HTML do YouTube (pode quebrar com mudanças)
- Rate limiting do YouTube pode afetar requisições em massa  
- Algumas informações podem não estar disponíveis para todos os vídeos
- Transcrições dependem do serviço externo kome.ai

## 🛠️ Troubleshooting

### ✅ Transcrições com Biblioteca Própria!

**🎉 Sistema ATUALIZADO na v1.3.0:** 
- **Antes**: Dependência de serviços externos para transcrições
- **Agora**: Biblioteca própria implementada em Node.js baseada na youtube_transcript_api
- **Resultado**: Funciona perfeitamente em desenvolvimento, produção e qualquer tipo de servidor
- **Recursos**: Arquivos SRT temporários com limpeza automática após 30 segundos

### Problemas Comuns

#### ✅ Transcrições
- **Status**: ✅ FUNCIONANDO - Sistema atualizado na v1.3.0
- **Solução**: Usa biblioteca própria (youtube_transcript_node) - compatível com qualquer servidor
- **Nenhuma configuração necessária** - funciona imediatamente
- **Recursos**: Arquivos SRT temporários com limpeza automática

#### Erro 500 em endpoints específicos
**Diagnóstico:**
```bash
# Testar health check
curl https://sua-api.com/health

# Testar endpoint específico
curl -X POST https://sua-api.com/api/transcription \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

#### CORS não funciona
**Verificar configuração:**
1. Confirme que `NODE_ENV=production` está definido
2. Verifique se a URL do Swagger está correta no navegador
3. Teste endpoints diretamente via cURL primeiro

## 🔄 Changelog

### 🌟 v1.4.0 - Extração de Vídeos de Canal (NOVO!)
- **📺 Extração completa**: Obter todos os vídeos de um canal por handle (@canal)
- **🔗 URLs simples**: Extrair apenas as URLs dos vídeos de um canal
- **📊 Informações básicas**: Título, URL, duração, visualizações e data de publicação
- **🎯 Múltiplas opções**: 3 endpoints diferentes para diferentes necessidades
- **⚡ Alta performance**: Usa scraping direto do YouTube sem dependências externas
- **🛡️ Estabilidade**: Funciona com qualquer canal público do YouTube
- **📱 Compatibilidade**: Suporte a handles com ou sem @

### 🌟 v1.3.0 - Sistema de Transcrição com Biblioteca Própria
- **🎯 Biblioteca própria**: Implementação Node.js da youtube_transcript_api
- **📁 Arquivos SRT**: Geração automática de arquivos SRT temporários
- **🗑️ Limpeza automática**: Arquivos deletados após 30 segundos
- **⏱️ Timestamps precisos**: Suporte a timestamps reais do YouTube
- **🌍 Múltiplos idiomas**: Suporte a transcrições em vários idiomas
- **🚀 Zero configuração**: Funciona imediatamente após deploy
- **📈 Maior estabilidade**: Sem dependência de sistemas externos

### 📚 Versões Anteriores
- **v1.2.0**: Sistema de transcrição via serviço externo (kome.ai)
- **v1.1.0**: Sistema de cookies padrão automático
- **v1.0.0**: Release inicial com sistema próprio de transcrições

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Health check
npm run health
```

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Nota:** Esta API é para fins educacionais e de pesquisa. Respeite os termos de serviço do YouTube. 