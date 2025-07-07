# 🍪 Guia de Cookies para Transcrições do YouTube

Este guia explica como extrair e usar cookies do seu navegador para resolver problemas de transcrição no servidor.

## 🆕 NOVIDADE: Cookies Padrão Automáticos

**✅ A API já funciona automaticamente!**

A partir desta versão, a API vem **pré-configurada** com cookies funcionais que resolvem a maioria dos problemas de transcrição. 

**Principais benefícios:**
- 🚀 **Zero configuração**: Transcrições funcionam imediatamente após iniciar a API
- 🔄 **Auto-inicialização**: Cookies padrão são carregados automaticamente se nenhum existir
- 💾 **Persistência**: Cookies salvos permanecem entre reinicializações
- 🔧 **Flexibilidade**: Você ainda pode enviar seus próprios cookies se necessário

**Quando usar cookies personalizados:**
- Se os cookies padrão não funcionarem no seu ambiente específico
- Para vídeos com restrições regionais específicas
- Se você tiver cookies de uma conta premium/específica

## 🤔 Por que Precisamos de Cookies?

O YouTube usa cookies para:
- **Autenticação de sessão**: Identificar usuários válidos vs. bots
- **Controle anti-bot**: Verificar comportamento humano
- **Geo-localização**: Aplicar restrições regionais
- **Preferências**: Idioma, qualidade, etc.

**Problema:** No servidor Docker não há navegador, então não há cookies de sessão. Isso pode causar bloqueios.

## 📋 Como Extrair Cookies do Navegador

### Método 1: DevTools do Chrome/Firefox

1. **Abra o YouTube** no seu navegador
2. **Faça login** na sua conta (recomendado)
3. **Abra as ferramentas de desenvolvedor** (F12)
4. **Vá para a aba "Application"** (Chrome) ou "Storage" (Firefox)
5. **Clique em "Cookies"** no painel esquerdo
6. **Selecione "https://www.youtube.com"**
7. **Copie os cookies importantes**

### Método 2: Extensão Browser (Recomendado)

1. **Instale uma extensão** como "Cookie Editor" ou "EditThisCookie"
2. **Acesse o YouTube** e faça login
3. **Clique na extensão**
4. **Exporte todos os cookies** em formato JSON

### Método 3: Console do Navegador

```javascript
// Cole este código no console do navegador (F12 > Console)
// Estando no YouTube
document.cookie.split(';').map(c => {
  const [name, value] = c.trim().split('=');
  return { name, value, domain: '.youtube.com' };
});
```

## 🔧 Formatos Suportados

A API aceita cookies em diferentes formatos:

### Formato 1: Array de Objetos (Recomendado)
```json
{
  "cookies": [
    {
      "name": "VISITOR_INFO1_LIVE",
      "value": "valor_do_cookie",
      "domain": ".youtube.com"
    },
    {
      "name": "YSC",
      "value": "outro_valor",
      "domain": ".youtube.com"
    }
  ]
}
```

### Formato 2: Objeto Simples
```json
{
  "cookies": {
    "VISITOR_INFO1_LIVE": "valor_do_cookie",
    "YSC": "outro_valor",
    "CONSENT": "YES+cb"
  }
}
```

### Formato 3: String
```json
{
  "cookies": "VISITOR_INFO1_LIVE=valor; YSC=outro_valor; CONSENT=YES+cb"
}
```

## 🎯 Cookies Importantes do YouTube

### Essenciais:
- `VISITOR_INFO1_LIVE` - Identificação do visitante
- `YSC` - Sessão do YouTube
- `CONSENT` - Consentimento de cookies (Europa)

### Úteis:
- `PREF` - Preferências do usuário
- `GPS` - Informações de geolocalização
- `__Secure-YEC` - Token de segurança

### Opcionais (se logado):
- `LOGIN_INFO` - Informações de login
- `SID`, `HSID`, `SSID` - Sessões do Google
- `SAPISID`, `APISID` - Tokens de API

## 🔧 Como Usar na API

### 🆕 Gerenciamento de Cookies Padrão

**Verificar status do sistema:**
```bash
curl -X GET http://localhost:3000/api/cookies/status
```

**Ver cookies padrão disponíveis:**
```bash
curl -X GET http://localhost:3000/api/cookies/defaults
```

**Restaurar cookies padrão:**
```bash
curl -X POST http://localhost:3000/api/cookies/restore
```

### 📤 Gerenciamento de Cookies Personalizados

### 1. Upload de Cookies
```bash
curl -X POST http://localhost:3000/api/cookies/upload \
  -H "Content-Type: application/json" \
  -d '{
    "cookies": [
      {
        "name": "VISITOR_INFO1_LIVE",
        "value": "seu_valor_aqui",
        "domain": ".youtube.com"
      }
    ]
  }'
```

### 2. Verificar Status
```bash
curl -X GET http://localhost:3000/api/cookies/check
```

### 3. Ver Informações
```bash
curl -X GET http://localhost:3000/api/cookies/info
```

### 4. Remover Cookies
```bash
curl -X DELETE http://localhost:3000/api/cookies
```

## 📝 Exemplo Prático Completo

### Passo 1: Extrair Cookies
1. Acesse https://www.youtube.com
2. Faça login (opcional, mas recomendado)
3. Abra DevTools (F12) > Application > Cookies
4. Copie os cookies principais

### Passo 2: Preparar JSON
```json
{
  "cookies": [
    {
      "name": "VISITOR_INFO1_LIVE",
      "value": "xyz123...",
      "domain": ".youtube.com"
    },
    {
      "name": "YSC",
      "value": "abc456...",
      "domain": ".youtube.com"
    },
    {
      "name": "CONSENT",
      "value": "YES+cb",
      "domain": ".youtube.com"
    }
  ]
}
```

### Passo 3: Enviar para API
```bash
curl -X POST https://sua-api.com/api/cookies/upload \
  -H "Content-Type: application/json" \
  -d @cookies.json
```

### Passo 4: Testar Transcrição
```bash
curl -X POST https://sua-api.com/api/transcription \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "languages": ["pt", "en"]
  }'
```

## ⚠️ Considerações Importantes

### Segurança
- **NÃO compartilhe cookies** publicamente
- **Cookies expiram** - podem precisar ser atualizados
- **Use HTTPS** sempre ao transmitir cookies

### Privacidade
- Cookies podem conter **informações pessoais**
- **Não use cookies de outras pessoas**
- **Revogue cookies** se necessário (logout/login)

### Limitações
- Cookies podem **expirar**
- YouTube pode **mudar políticas**
- **Não é 100% garantido** que resolva todos os bloqueios

## 🔄 Automação

### Script para Extrair Cookies (Chrome)

Salve como `extract_cookies.js`:
```javascript
// Execute no console do YouTube
const cookies = document.cookie.split(';').map(c => {
  const [name, value] = c.trim().split('=');
  return { 
    name: name, 
    value: value || '', 
    domain: '.youtube.com',
    path: '/',
    secure: true 
  };
}).filter(c => c.name);

console.log('Cookies extraídos:');
console.log(JSON.stringify({cookies}, null, 2));
```

### Script Python para Enviar Cookies
```python
import requests
import json

# Carregar cookies de arquivo
with open('cookies.json', 'r') as f:
    cookies_data = json.load(f)

# Enviar para API
response = requests.post(
    'http://localhost:3000/api/cookies/upload',
    json=cookies_data
)

print(f"Status: {response.status_code}")
print(f"Resposta: {response.json()}")
```

## 🛠️ Troubleshooting

### Problema: "Cookies inválidos"
- **Solução**: Verifique o formato JSON
- **Causa**: Formato incorreto ou cookies corrompidos

### Problema: "Ainda não funciona"
- **Solução**: Tente extrair mais cookies
- **Causa**: Cookies insuficientes ou expirados

### Problema: "Erro ao salvar"
- **Solução**: Verifique permissões da pasta `data/cookies`
- **Causa**: Problemas de permissão no servidor

### Problema: "Cookies expiram rapidamente"
- **Solução**: Use conta logada e extraia cookies essenciais
- **Causa**: Cookies de sessão sem login expiram rápido

## 📚 Recursos Adicionais

- [Documentação da API Swagger](http://localhost:3000/api-docs)
- [DevTools do Chrome](https://developer.chrome.com/docs/devtools/)
- [Extensão Cookie Editor](https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)

## ❓ FAQ

**P: Os cookies são seguros?**
R: Sim, são armazenados localmente no servidor e não são transmitidos para terceiros.

**P: Preciso estar logado no YouTube?**
R: Não é obrigatório, mas recomendado para melhor estabilidade.

**P: Com que frequência preciso atualizar?**
R: Varia, mas tipicamente a cada 1-7 dias dependendo do uso.

**P: Funciona com qualquer conta?**
R: Sim, mas contas mais estabelecidas podem ter melhor resultado.

---

💡 **Dica:** Mantenha sempre uma cópia dos cookies que funcionam como backup! 