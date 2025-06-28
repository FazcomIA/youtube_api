# YouTube API Unificada 🎬

API RESTful unificada para extração de informações e comentários de vídeos do YouTube em Node.js.

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
- Obter transcrição completa do vídeo no idioma principal
- Texto sincronizado com timestamps
- Informações sobre idioma e origem da transcrição
- Suporte a transcrições manuais e geradas automaticamente

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Para desenvolvimento (com auto-reload)
npm run dev
```

## 🔧 Dependências

- `express` - Framework web
- `cors` - Suporte CORS
- `swagger-jsdoc` & `swagger-ui-express` - Documentação API
- `axios` & `cheerio` - Scraping e requisições
- `youtube-sr` & `youtubei` - Bibliotecas auxiliares YouTube

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

**Resposta:**
```json
[
  {
    "titulo": "JavaScript Tutorial Full Course - Beginner to Pro",
    "url": "https://youtube.com/watch?v=EerdGm-ehJQ",
    "dataPublicacao": "há 1 ano",
    "nomeCanal": "SuperSimpleDev",
    "handleCanal": "@SuperSimpleDev",
    "visualizacoes": 5492959,
    "duracao": 80157,
    "thumbnail": "https://i.ytimg.com/vi/EerdGm-ehJQ/hq720.jpg",
    "descricao": "Lessons: 00:00:00 Intro 00:02:01 1 JavaScript Basics..."
  }
]
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

**Resposta:**
```json
{
  "videoId": "8JWEJKZ5Yrc",
  "titulo": "TÍTULO DO VÍDEO",
  "descricao": "Descrição do vídeo...",
  "autor": "RedCast [Oficial]",
  "channelId": "UCeL1a4rpEA8UG9IQIewPccg",
  "url": "https://www.youtube.com/watch?v=8JWEJKZ5Yrc",
  "thumbnail": "https://...",
  "visualizacoes": 5214,
  "likes": 0,
  "duracao": 970,
  "dataPublicacao": "há 2 dias",
  "data": "25-12-2024",
  "tags": ["tag1", "tag2"]
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

**Resposta:**
```json
[
  {
    "cid": "UgxnT6K...",
    "user": "Nome do usuário",
    "text": "Texto do comentário",
    "time": "há 2 dias",
    "data": "15-05-2023",
    "respostas": 3
  }
]
```

### 📝 Transcrição
```
POST /api/transcription
```

**Parâmetros:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Resposta:**
```json
{
  "language": "Português",
  "language_code": "pt",
  "is_generated": false,
  "snippets": [
    {
      "text": "Texto do trecho da transcrição",
      "start": 0.0,
      "duration": 1.54
    }
  ]
}
```

## 📝 Parâmetros Detalhados

### Ordenação de Pesquisa de Vídeos:
- `relevance` = Por relevância (padrão do YouTube)
- `date` = Mais recentes primeiro
- `views` = Mais visualizados primeiro

### Ordenação de Comentários:
- `0` = Mais populares
- `1` = Mais recentes (padrão)

### Códigos de Idioma (exemplos):
- `pt` = Português
- `en` = Inglês
- `es` = Espanhol
- `fr` = Francês

## 📊 Exemplos de Uso

### JavaScript/Node.js
```javascript
// Pesquisar vídeos por relevância (padrão)
const searchResponse = await fetch('http://localhost:3000/api/yt_search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'javascript tutorial', limit: 5 })
});
const searchResults = await searchResponse.json();

// Pesquisar vídeos mais recentes
const recentResponse = await fetch('http://localhost:3000/api/yt_search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'nodejs', limit: 3, order: 'date' })
});
const recentVideos = await recentResponse.json();

// Obter vídeo mais recente
const response = await fetch('http://localhost:3000/api/yt_last_video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ channelHandle: '@RedCastOficial' })
});
const videoInfo = await response.json();

// Obter comentários
const commentsResponse = await fetch('http://localhost:3000/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoIdOuUrl: 'https://www.youtube.com/watch?v=8JWEJKZ5Yrc',
    limite: 10
  })
});
const comments = await commentsResponse.json();

// Obter transcrição
const transcriptionResponse = await fetch('http://localhost:3000/api/transcription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
  })
});
const transcription = await transcriptionResponse.json();
```

### cURL
```bash
# Pesquisa de vídeos por relevância (padrão)
curl -X POST http://localhost:3000/api/yt_search \
  -H "Content-Type: application/json" \
  -d '{"query": "javascript tutorial", "limit": 5}'

# Pesquisa de vídeos mais recentes
curl -X POST http://localhost:3000/api/yt_search \
  -H "Content-Type: application/json" \
  -d '{"query": "nodejs", "limit": 3, "order": "date"}'

# Pesquisa de vídeos mais visualizados
curl -X POST http://localhost:3000/api/yt_search \
  -H "Content-Type: application/json" \
  -d '{"query": "python", "limit": 5, "order": "views"}'

# Vídeo mais recente
curl -X POST http://localhost:3000/api/yt_last_video \
  -H "Content-Type: application/json" \
  -d '{"channelHandle": "@RedCastOficial"}'

# Comentários
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"videoIdOuUrl": "https://www.youtube.com/watch?v=8JWEJKZ5Yrc", "limite": 5}'

# Transcrição
curl -X POST http://localhost:3000/api/transcription \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

## 🛠️ Estrutura do Projeto

```
ytb_api/
├── server.js                      # Servidor principal da API
├── index.js                       # Classe YouTubeExtractor
├── api_comentarios.js             # Módulo de comentários
├── youtube_comment_downloader.js  # Downloader de comentários
├── package.json                   # Configurações e dependências
├── README.md                      # Esta documentação
└── .gitignore                    # Arquivos ignorados
```

## 🚨 Limitações

- Dependente da estrutura HTML do YouTube (pode quebrar com mudanças)
- Rate limiting do YouTube pode afetar requisições em massa
- Algumas informações podem não estar disponíveis para todos os vídeos
- Comentários desabilitados retornarão array vazio

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Testar endpoints
curl -X GET http://localhost:3000/
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Nota:** Esta API é para fins educacionais e de pesquisa. Respeite os termos de serviço do YouTube. 