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

### ✅ Extração de Comentários
- Comentários de vídeos por URL ou ID
- Filtragem por quantidade e ordenação (recentes/populares)
- Formato JSON personalizado com informações úteis

### ✅ Extração de Transcrição
- Obter transcrição completa do vídeo no idioma solicitado
- Texto sincronizado com timestamps formatados (HH:MM:SS)
- Informações sobre idioma usado e idiomas disponíveis
- Suporte a transcrições manuais (priorizadas) e geradas automaticamente
- Resposta flexível: texto corrido ou array de objetos com timestamps

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
./scripts/docker-build-push.sh mateusgomes 1.0.0
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
YOUTUBE_TIMEOUT=45000  # Timeout específico para requisições ao YouTube (em ms)
YOUTUBE_MAX_RESULTS=50
YOUTUBE_DEFAULT_LANGUAGE=pt
CORS_ORIGINS=https://meusite.com,https://localhost:3000  # (para desenvolvimento)
RATE_LIMIT_MAX=100
```

**Importante para EasyPanel/Produção:**
- `NODE_ENV=production` - Define o ambiente como produção
- `BASE_URL` - (Opcional) URL completa da sua aplicação se não for detectada automaticamente
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

### 📝 Transcrição
```
POST /api/transcription
```

**Parâmetros:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "languages": ["pt", "pt-BR", "en"],
  "includeTimestamps": false
}
```

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

// Obter informações de vídeo específico
const videoInfoResponse = await fetch('http://localhost:3000/api/yt_video_info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
  })
});
const videoInfo = await videoInfoResponse.json();
```

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

# Informações de vídeo específico
curl -X POST http://localhost:3000/api/yt_video_info \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'

# Health check
curl -X GET http://localhost:3000/health
```

## 🚨 Limitações

- Dependente da estrutura HTML do YouTube (pode quebrar com mudanças)
- Rate limiting do YouTube pode afetar requisições em massa
- Algumas informações podem não estar disponíveis para todos os vídeos

## 🛠️ Troubleshooting

### Problemas Comuns em Produção

#### Transcrições não funcionam no servidor (mas funcionam localmente)
**Causa:** YouTube pode bloquear IPs de datacenters/cloud providers.

**Soluções:**
1. **Configurar timeout maior:**
   ```bash
   YOUTUBE_TIMEOUT=60000  # 60 segundos
   ```

2. **Verificar logs detalhados:**
   - Acesse os logs da aplicação no seu provedor
   - Procure por mensagens como "IP bloqueado" ou "timeout"

3. **Problemas conhecidos por ambiente:**
   - **EasyPanel/VPS:** IPs podem estar em blacklist do YouTube
   - **Heroku/Railway:** Rate limiting mais agressivo
   - **Vercel/Netlify:** Timeouts em functions

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

#### CORS ainda não funciona
**Verificar configuração:**
1. Confirme que `NODE_ENV=production` está definido
2. Verifique se a URL do Swagger está correta no navegador
3. Teste endpoints diretamente via cURL primeiro

### Alternativas para Transcrições

Se o serviço de transcrição não funcionar em produção:
1. **Use a API local** para desenvolvimento/testes
2. **Configure proxy** através de serviço intermediário
3. **Use serviços alternativos** como OpenAI Whisper API

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