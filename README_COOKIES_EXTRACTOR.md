# 🍪 Extrator de Cookies do YouTube

Este diretório contém arquivos para extrair cookies do seu navegador e enviar para a API.

## 📁 Arquivos Criados

- `extract_cookies_browser.js` - Script para executar no console do navegador
- `INSTRUCOES_COOKIES.md` - Instruções detalhadas passo a passo
- `README_COOKIES_EXTRACTOR.md` - Este arquivo (resumo)

## 🚀 Uso Rápido

### 1. Preparar
```bash
# A API já funciona com cookies padrão, mas se precisar de cookies específicos:
1. Abra https://www.youtube.com
2. Faça login na sua conta
3. Abra F12 > Console
```

### 2. Extrair
```bash
# Cole o conteúdo de extract_cookies_browser.js no console
# O script irá mostrar o JSON pronto para usar
```

### 3. Enviar para API
```bash
curl -X POST http://localhost:3000/api/cookies/upload \
  -H "Content-Type: application/json" \
  -d @cookies.json
```

### 4. Testar
```bash
curl -X POST http://localhost:3000/api/transcription \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "languages": ["pt", "en"]
  }'
```

## ⚡ Método Mais Simples

**A API já vem com cookies padrão funcionais!** 

Você só precisa extrair cookies se:
- Os cookies padrão não funcionarem no seu ambiente
- Você quiser usar cookies de uma conta específica
- Houver vídeos com restrições regionais específicas

Para verificar o status atual:
```bash
curl http://localhost:3000/api/cookies/status
```

## 🔧 Rotas da API de Cookies

```bash
# Ver cookies padrão
GET /api/cookies/defaults

# Status completo
GET /api/cookies/status  

# Upload cookies personalizados
POST /api/cookies/upload

# Restaurar cookies padrão
POST /api/cookies/restore

# Remover todos os cookies
DELETE /api/cookies
```

## 📚 Documentação Completa

- **Instruções detalhadas:** `INSTRUCOES_COOKIES.md`
- **Guia geral de cookies:** `COOKIES_GUIDE.md`
- **Documentação da API:** http://localhost:3000/api-docs

## 🛡️ Segurança

- ❌ **NÃO** compartilhe os cookies extraídos
- ❌ **NÃO** faça commit dos arquivos de cookies
- ✅ Use apenas em servidores que você controla
- ✅ Os arquivos já estão no `.gitignore`

---

**💡 Dica:** Na maioria dos casos, você não precisará extrair cookies manualmente. A API já funciona automaticamente! 