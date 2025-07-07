# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção apenas
RUN npm ci --only=production && \
    npm cache clean --force

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências básicas do sistema
RUN apk add --no-cache ca-certificates tzdata

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S youtubeapi -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências do stage builder
COPY --from=builder --chown=youtubeapi:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=youtubeapi:nodejs . .

# Criar diretórios necessários
RUN mkdir -p logs data/cookies && \
    chown -R youtubeapi:nodejs logs data

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Expor porta da aplicação
EXPOSE 3000

# Usar usuário não-root
USER youtubeapi

# Health check básico
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node scripts/healthcheck.js || exit 1

# Comando para iniciar a aplicação
CMD ["node", "server.js"] 