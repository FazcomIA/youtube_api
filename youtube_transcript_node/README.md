# YouTube Transcript API - Node.js

Uma implementação Node.js da biblioteca Python `youtube_transcript_api`, criada através da análise reversa do código fonte original.

## Características

- ✅ **Funcionalmente equivalente** à versão Python
- ✅ Usa as mesmas APIs internas do YouTube (InnerTube)
- ✅ Suporta múltiplos idiomas
- ✅ Prioriza transcrições manuais sobre automáticas
- ✅ **Formato JSON idêntico** à API Python
- ✅ Timestamps em formato HH:MM:SS
- ✅ Tratamento de erros robusto
- ✅ Sem dependências externas pesadas

## Instalação

```bash
npm install axios xml2js
```

## Uso Básico

```javascript
const YouTubeTranscriptApi = require('./src/YouTubeTranscriptApi');

async function exemploUso() {
    const api = new YouTubeTranscriptApi();
    
    // Extrai ID do vídeo
    const videoId = api.extractVideoId('https://www.youtube.com/watch?v=VIDEO_ID');
    
    // Obtém transcrição com timestamps (formato igual à API Python)
    const result = await api.getTranscript(videoId, {
        languages: ['pt', 'pt-BR', 'en'],
        includeTimestamps: true
    });
    
    if (result.success) {
        console.log('Transcrição obtida com sucesso!');
        console.log('Idioma usado:', result.language_used);
        console.log('Total de segmentos:', result.segments_count);
        
        // Cada segmento tem: start (HH:MM:SS), dur (segundos), text
        result.transcript.forEach((segment, index) => {
            console.log(`[${segment.start}] (${segment.dur}s) ${segment.text}`);
        });
    } else {
        console.error('Erro:', result.error);
    }
}
```

## Formato de Resposta

### Com Timestamps (`includeTimestamps: true`)

```javascript
{
    success: true,
    error: '',
    video_id: 'qvZeLp3bkd4',
    video_url: 'https://www.youtube.com/watch?v=qvZeLp3bkd4',
    language_used: 'pt',
    available_languages: ['pt', 'en', 'es'],
    segments_count: 245,
    include_timestamps: true,
    transcript: [
        {
            start: '00:00:12',    // Tempo inicial em HH:MM:SS
            dur: '3.840',         // Duração em segundos
            text: 'Olá pessoal'   // Texto limpo
        },
        {
            start: '00:00:16',
            dur: '4.200',
            text: 'Bem-vindos ao canal'
        }
        // ... mais segmentos
    ]
}
```

### Sem Timestamps (`includeTimestamps: false`)

```javascript
{
    success: true,
    error: '',
    video_id: 'qvZeLp3bkd4',
    video_url: 'https://www.youtube.com/watch?v=qvZeLp3bkd4',
    language_used: 'pt',
    available_languages: ['pt', 'en', 'es'],
    segments_count: 245,
    include_timestamps: false,
    transcript: 'Olá pessoal Bem-vindos ao canal...' // Texto corrido
}
```

### Em Caso de Erro

```javascript
{
    success: false,
    error: 'No transcript found for this video',
    video_id: 'qvZeLp3bkd4',
    video_url: 'https://www.youtube.com/watch?v=qvZeLp3bkd4',
    transcript: [], // Array vazio se includeTimestamps=true, string vazia se false
    available_languages: []
}
```

## Opções Disponíveis

```javascript
const options = {
    languages: ['pt', 'pt-BR', 'en'],  // Idiomas preferidos (ordem de prioridade)
    includeTimestamps: true            // true = array de objetos, false = texto corrido
};
```

## Idiomas Suportados

A biblioteca tentará obter transcrições nos idiomas especificados, seguindo esta ordem de prioridade:

1. **Transcrições manuais** nos idiomas especificados
2. **Transcrições automáticas** nos idiomas especificados
3. **Qualquer transcrição disponível** (se nenhuma for encontrada)

### Códigos de Idioma Comuns

- `pt` - Português
- `pt-BR` - Português (Brasil)
- `en` - Inglês
- `en-US` - Inglês (Estados Unidos)
- `es` - Espanhol
- `fr` - Francês
- `de` - Alemão
- `it` - Italiano

## Tratamento de Erros

A biblioteca trata diversos tipos de erro:

- **Vídeo não encontrado**: URL inválida ou vídeo inexistente
- **Transcrições desabilitadas**: Vídeo sem legendas disponíveis
- **Restrições de idade**: Vídeos com restrição de idade
- **Bloqueio de IP**: Quando o YouTube detecta comportamento automatizado
- **Vídeo privado**: Vídeos não públicos

## Compatibilidade

- ✅ Node.js 12+
- ✅ Funciona com qualquer vídeo público do YouTube
- ✅ Suporta vídeos longos (>1 hora)
- ✅ Compatível com diferentes formatos de URL do YouTube

## Limitações

- Não funciona com vídeos privados
- Não funciona com vídeos que têm transcrições desabilitadas
- Pode ser bloqueado em caso de uso intensivo (rate limiting do YouTube)

## Exemplo Completo

Veja o arquivo `examples/example.js` para um exemplo completo de uso.

## Comparação com a API Python

Esta implementação é **funcionalmente idêntica** à biblioteca Python `youtube_transcript_api`:

| Funcionalidade | Python | Node.js |
|---|---|---|
| Formato de resposta | ✅ | ✅ |
| Timestamps HH:MM:SS | ✅ | ✅ |
| Múltiplos idiomas | ✅ | ✅ |
| Priorização manual/automática | ✅ | ✅ |
| Tratamento de erros | ✅ | ✅ |
| Limpeza de texto | ✅ | ✅ |

## Licença

MIT

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

---

**Nota**: Esta biblioteca foi criada através da análise reversa do código fonte da biblioteca Python `youtube_transcript_api` e implementa exatamente o mesmo fluxo interno, garantindo compatibilidade total. 