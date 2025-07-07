# 🔧 Troubleshooting: Problema de Cookies no Servidor

## 🚨 Problema Relatado

**Sintomas:**
- API funcionava normalmente com cookies padrão
- Usuário injetou cookies personalizados via API
- Cookies personalizados não funcionaram
- Usuário removeu todos os cookies
- **API parou de funcionar completamente** (erro 404 nas rotas)

**Causa:** O sistema de cookies padrão não foi reinicializado após a remoção dos cookies, deixando a API sem cookies funcionais.

## ✅ Soluções Implementadas

### 1. **Auto-Recuperação Automática**
- Sistema agora reinicializa cookies padrão automaticamente quando não há cookies
- Modificado `loadCookies()` para sempre garantir que há cookies funcionais
- Startup da API força inicialização de cookies

### 2. **Endpoint de Emergência**
```bash
# Nova rota para forçar reinicialização
POST /api/cookies/force-init
```

### 3. **Script de Correção Manual**
```bash
# Executar localmente no servidor
npm run fix-cookies

# Ou diretamente:
node scripts/fix-cookies.js
```

## 🔧 Como Resolver AGORA

### **Opção 1: Reiniciar a API** ⭐ **RECOMENDADO**
```bash
# 1. Parar a API no servidor
# 2. Reiniciar a API
# A nova versão vai inicializar automaticamente os cookies padrão
```

### **Opção 2: Usar Endpoint de Emergência**
```bash
# Se a API estiver respondendo pelo menos na rota /health
curl -X POST https://sua-api.com/api/cookies/force-init
```

### **Opção 3: Script Manual no Servidor**
```bash
# Conectar no servidor via SSH
cd /path/to/your/api
npm run fix-cookies
# Depois reiniciar a API
```

### **Opção 4: Restaurar via API (se funcionando)**
```bash
# Se a API responder
curl -X POST https://sua-api.com/api/cookies/restore
```

## 📊 Como Verificar se Foi Resolvido

### 1. **Teste Health Check**
```bash
curl -X GET https://sua-api.com/health
# Deve retornar: {"status":"healthy",...}
```

### 2. **Teste Status dos Cookies**
```bash
curl -X GET https://sua-api.com/api/cookies/status
# Deve mostrar cookies carregados
```

### 3. **Teste Transcrição**
```bash
curl -X POST https://sua-api.com/api/transcription \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "languages": ["pt", "en"]
  }'
```

## 🛡️ Prevenção Futura

### **Sistema Agora É Auto-Recuperável:**
- ✅ Cookies padrão sempre inicializados na startup
- ✅ Auto-recuperação quando cookies são removidos
- ✅ Endpoint de emergência disponível
- ✅ Logs mais detalhados para diagnóstico

### **Melhores Práticas:**
1. **Sempre teste cookies personalizados primeiro** em ambiente local
2. **Use `/api/cookies/status`** para verificar antes de remover
3. **Tenha backup dos cookies que funcionam**
4. **Use `/api/cookies/restore`** em vez de deletar tudo

## 🚀 Atualizações Feitas

### **CookieManager.js:**
- Auto-inicialização melhorada em `loadCookies()`
- Recuperação automática em caso de erro
- Sempre retorna cookies funcionais

### **server.js:**
- Inicialização forçada na startup
- Logs de status do sistema de cookies
- Documentação da nova rota

### **Novas Rotas:**
- `POST /api/cookies/force-init` - Emergência
- Logs melhorados em todas as rotas

### **Scripts:**
- `npm run fix-cookies` - Correção manual
- `scripts/fix-cookies.js` - Diagnóstico completo

## 📞 Suporte

Se o problema persistir após essas correções:

1. **Verificar logs da API** para erros específicos
2. **Testar acesso de escrita** na pasta `data/cookies`
3. **Verificar permissões** do container Docker
4. **Verificar variáveis de ambiente** do servidor

---

**🎯 Resultado Esperado:** API funcionando automaticamente com cookies padrão, sem necessidade de configuração manual. 