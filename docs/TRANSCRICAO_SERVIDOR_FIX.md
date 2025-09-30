# 🔧 Correções para Transcrições em Servidor

## 🚨 Problema Identificado

As rotas `/api/transcription` e `/api/transcription/json` funcionavam localmente mas falhavam no servidor devido a **dependências implícitas do navegador** que não estavam sendo simuladas adequadamente.

## 🔍 Análise dos Problemas

### 1. **User-Agent Estático**
- Código original usava um User-Agent fixo de 2021
- YouTube detectava como bot no servidor

### 2. **Headers Insuficientes**
- Faltavam headers importantes para simular navegador real
- Ausência de cookies de consentimento

### 3. **Sem Retry Logic**
- Nenhuma tentativa de recuperação em caso de bloqueio
- Falta de rate limiting

### 4. **Contexto InnerTube Limitado**
- Usava apenas contexto ANDROID fixo
- Sem rotação de estratégias

## ✅ Soluções Implementadas

### 🔄 **1. Rotação de User-Agents**
```javascript
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // ... mais user agents realistas
];
```

### 🍪 **2. Cookies de Consentimento**
```javascript
headers: {
    'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+917; YSC=dQw4w9WgXcQ'
}
```

### 🌐 **3. Headers Completos de Navegador**
```javascript
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
'Accept-Encoding': 'gzip, deflate, br',
'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
'Sec-Fetch-Dest': 'document',
'Sec-Fetch-Mode': 'navigate',
'Sec-Fetch-Site': 'none',
'Sec-Fetch-User': '?1',
```

### 🔄 **4. Sistema de Retry Inteligente**
```javascript
async getTranscript(videoId, options = {}) {
    const { maxRetries = 3 } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Tentativa de transcrição
            return await this._getTranscriptAttempt(videoId, options, attempt);
        } catch (error) {
            if (attempt === maxRetries) throw error;
            
            // Se detectado como bot, espera progressivamente mais
            if (error.message.includes('bot')) {
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    }
}
```

### ⏱️ **5. Rate Limiting**
```javascript
async _waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
        const waitTime = this.minRequestInterval - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
}
```

### 🔄 **6. Contextos InnerTube Múltiplos**
```javascript
const INNERTUBE_CONTEXTS = [
    { client: { clientName: 'WEB', clientVersion: '2.20231208.00.00' } },
    { client: { clientName: 'ANDROID', clientVersion: '18.48.37' } },
    { client: { clientName: 'IOS', clientVersion: '18.48.3' } }
];
```

## 🧪 Como Testar

### 1. **Teste Local**
```bash
# Teste básico
npm run test:transcription

# Teste específico para servidor
node scripts/test-transcription-server.js
```

### 2. **Teste no Servidor**
```bash
# Executar no servidor
node scripts/test-transcription-server.js
```

### 3. **Teste via API**
```bash
# Teste de transcrição em texto
curl -X POST http://seu-servidor:3000/api/transcription \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=qvZeLp3bkd4",
    "languages": ["pt", "pt-BR", "en"]
  }'

# Teste de transcrição em JSON
curl -X POST http://seu-servidor:3000/api/transcription/json \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=qvZeLp3bkd4",
    "languages": ["pt", "pt-BR", "en"]
  }'
```

## 📊 Resultados Esperados

### ✅ **Sucesso**
```json
{
  "success": true,
  "videoId": "qvZeLp3bkd4",
  "videoUrl": "https://www.youtube.com/watch?v=qvZeLp3bkd4",
  "language_used": "pt",
  "available_languages": ["pt", "en"],
  "segments_count": 245,
  "srt_file": "qvZeLp3bkd4_1735566789123.srt",
  "transcription": "Olá pessoal, bem-vindos ao canal...",
  "total_words": 1856,
  "total_characters": 9876,
  "message": "Transcrição obtida com sucesso. Arquivo SRT será deletado automaticamente em 30 segundos."
}
```

### ❌ **Possíveis Erros (Agora com Diagnóstico)**
```json
{
  "success": false,
  "error": "IP bloqueado pelo YouTube - CAPTCHA detectado",
  "videoUrl": "https://www.youtube.com/watch?v=qvZeLp3bkd4"
}
```

## 🔧 Configurações Avançadas

### 1. **Aumentar Timeout**
```javascript
// No TranscriptionService.js
const transcriptApi = new YouTubeTranscriptApi();
transcriptApi.minRequestInterval = 2000; // 2 segundos entre requisições
```

### 2. **Mais Tentativas**
```javascript
const result = await transcriptionService.getTranscriptionText(videoUrl, {
    languages: ['pt', 'pt-BR', 'en'],
    maxRetries: 5 // Até 5 tentativas
});
```

### 3. **Timeout Personalizado**
```javascript
// Variável de ambiente
TRANSCRIPT_TIMEOUT=60000  # 60 segundos
```

## 🌍 Variáveis de Ambiente

```bash
# Timeout para transcrições (ms)
TRANSCRIPT_TIMEOUT=60000

# Intervalo mínimo entre requisições (ms)
TRANSCRIPT_RATE_LIMIT=1000

# Número máximo de tentativas
TRANSCRIPT_MAX_RETRIES=3

# User-Agent personalizado (opcional)
TRANSCRIPT_USER_AGENT="Mozilla/5.0 (..."
```

## 🔍 Troubleshooting

### Se ainda houver problemas:

#### 1. **Verificar Conectividade**
```bash
# Teste básico de conectividade
curl -I https://www.youtube.com/

# Deve retornar 200 OK
```

#### 2. **Verificar Firewall/Proxy**
```bash
# Verificar se requisições HTTPS estão sendo bloqueadas
telnet www.youtube.com 443
```

#### 3. **Logs Detalhados**
```bash
# Definir log level para debug
LOG_LEVEL=debug npm start
```

#### 4. **Teste de Região**
```bash
# Verificar se o servidor está em região restrita
curl -H "Accept-Language: en-US" https://www.youtube.com/
```

## 📈 Monitoramento

### Métricas Importantes:
- **Taxa de sucesso**: >90% esperado
- **Tempo de resposta**: <30s por transcrição
- **Rate limit**: ≤1 req/segundo
- **Retry rate**: <20% das requisições

### Logs para Monitorar:
- `IP bloqueado pelo YouTube`
- `Rate limit excedido`
- `Requisição bloqueada - bot detectado`
- `Conectividade perdida`

## 🚀 Deploy

### 1. **Atualizar Código**
```bash
git add .
git commit -m "fix: resolver problemas de transcrição em servidor"
git push origin master
```

### 2. **Deploy no Servidor**
```bash
# Pull das atualizações
git pull origin master

# Reinstalar dependências se necessário
npm install

# Restart da aplicação
pm2 restart all
# ou
systemctl restart your-app
```

### 3. **Validar Deploy**
```bash
# Teste imediato após deploy
curl -X POST http://seu-servidor:3000/api/transcription \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://www.youtube.com/watch?v=qvZeLp3bkd4"}'
```

## 📞 Suporte

Se os problemas persistirem após essas correções, as possíveis causas são:

1. **Restrições de Região**: Servidor em país com bloqueios mais rígidos
2. **Infraestrutura de Rede**: Firewall corporativo ou proxy
3. **Detecção Avançada**: YouTube implementou novas medidas anti-bot
4. **Volume de Requisições**: Necessário implementar pool de IPs

**Soluções Avançadas**:
- Usar serviços de proxy rotativos
- Implementar fallback para APIs de terceiros
- Distribuir requisições entre múltiplos servidores
