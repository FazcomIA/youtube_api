# 🍪 Instruções: Como Extrair Cookies do YouTube

Este guia te ensina como extrair cookies do seu navegador para usar na API de transcrições.

## 📋 Passo a Passo Completo

### 1. Preparação no YouTube
```
1. Abra seu navegador (Chrome, Firefox, Safari, Edge)
2. Acesse https://www.youtube.com
3. FAÇA LOGIN na sua conta YouTube (IMPORTANTE!)
4. Navegue um pouco pelo YouTube (opcional, mas recomendado)
```

### 2. Abrir Console do Navegador
```
Chrome/Edge:
• Pressione F12 ou Ctrl+Shift+I
• Clique na aba "Console"

Firefox:
• Pressione F12 ou Ctrl+Shift+K
• Clique na aba "Console"

Safari:
• Cmd+Option+I (Mac)
• Clique na aba "Console"
```

### 3. Executar o Script
```
1. Abra o arquivo: extract_cookies_browser.js
2. Copie TODO o conteúdo do arquivo (Ctrl+A, Ctrl+C)
3. Cole no console do navegador (Ctrl+V)
4. Pressione Enter
```

### 4. Copiar o Resultado
```
O script irá mostrar:
• Estatísticas dos cookies encontrados
• Lista de cookies importantes
• JSON formatado para upload na API

Copie o JSON que aparece (desde { até })
```

## 📤 Como Usar o JSON na API

### Opção 1: cURL (Terminal/CMD)
```bash
curl -X POST https://sua-api.com/api/cookies/upload \
  -H "Content-Type: application/json" \
  -d '{
    "cookies": [
      {
        "name": "VISITOR_INFO1_LIVE",
        "value": "seu_valor_aqui",
        "domain": ".youtube.com",
        "path": "/",
        "secure": true,
        "httpOnly": false
      }
    ]
  }'
```

### Opção 2: Postman
```
1. Método: POST
2. URL: https://sua-api.com/api/cookies/upload
3. Headers: Content-Type: application/json
4. Body: Raw (JSON) - cole o JSON extraído
```

### Opção 3: JavaScript/Fetch
```javascript
fetch('https://sua-api.com/api/cookies/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cookies: [
      // ... seus cookies aqui
    ]
  })
});
```

## ✅ Verificar se Funcionou

Depois do upload, teste as transcrições:

```bash
curl -X POST https://sua-api.com/api/transcription \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "languages": ["pt", "en"],
    "includeTimestamps": false
  }'
```

## 🔍 Troubleshooting

### ❌ "Nenhum cookie encontrado"
**Soluções:**
- Certifique-se de estar no youtube.com
- Faça login na sua conta YouTube
- Atualize a página e tente novamente

### ❌ "Script deve ser executado apenas no domínio youtube.com"
**Soluções:**
- Acesse https://www.youtube.com primeiro
- Não execute em páginas de outros sites

### ❌ "Erro ao salvar cookies na API"
**Soluções:**
- Verifique se a URL da API está correta
- Confirme que o JSON está bem formatado
- Teste primeiro com curl ou Postman

### ❌ "Transcrições ainda não funcionam"
**Possíveis causas:**
- Cookies podem ter expirado
- Necessário mais cookies específicos
- Tente extrair novamente após usar o YouTube por mais tempo

## 🔄 Quando Atualizar os Cookies

Atualize os cookies quando:
- Transcrições param de funcionar
- Você faz logout/login no YouTube
- Após alguns dias/semanas de uso
- Mudança de IP/localização

## 🛡️ Segurança

**IMPORTANTE:**
- ❌ NUNCA compartilhe estes cookies publicamente
- ❌ NUNCA envie cookies para sites não confiáveis
- ✅ Use apenas em servidores que você controla
- ✅ Monitore se há atividade suspeita na sua conta
- ✅ Revogue acesso fazendo logout/login se necessário

## 📝 Exemplo de Resultado Esperado

```json
{
  "cookies": [
    {
      "name": "VISITOR_INFO1_LIVE",
      "value": "abc123def456",
      "domain": ".youtube.com",
      "path": "/",
      "secure": true,
      "httpOnly": false
    },
    {
      "name": "YSC",
      "value": "xyz789uvw456",
      "domain": ".youtube.com",
      "path": "/",
      "secure": true,
      "httpOnly": false
    }
  ]
}
```

## 💡 Dicas Extras

1. **Login Antecipado:** Faça login no YouTube alguns minutos antes de extrair
2. **Navegação:** Assista alguns vídeos antes de extrair (ativa mais cookies)
3. **Backup:** Guarde uma cópia dos cookies que funcionam
4. **Teste Local:** Teste primeiro em localhost antes de usar em produção
5. **Monitoramento:** Verifique logs da API para ver se cookies estão sendo usados

---

**💬 Precisa de ajuda?** Verifique os logs da API ou entre em contato! 