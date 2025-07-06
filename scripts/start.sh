#!/bin/bash

# Script de inicialização da FCI - API Youtube v1
# Autor: Mateus Gomes

set -e

echo "🚀 Iniciando FCI - API Youtube v1..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Versão mínima requerida: $REQUIRED_VERSION"
    exit 1
fi

echo "✅ Node.js versão $NODE_VERSION detectada"

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Definir variáveis de ambiente padrão se não estiverem definidas
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3000}
export LOG_LEVEL=${LOG_LEVEL:-info}

echo "🔧 Configurações:"
echo "   - Ambiente: $NODE_ENV"
echo "   - Porta: $PORT"
echo "   - Log Level: $LOG_LEVEL"

# Verificar se a porta está disponível
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Porta $PORT já está em uso. Tentando usar a próxima disponível..."
    export PORT=$((PORT + 1))
    echo "   Nova porta: $PORT"
fi

echo ""
echo "🌐 A aplicação estará disponível em:"
echo "   http://localhost:$PORT"
echo "   http://localhost:$PORT/api-docs (Documentação Swagger)"
echo ""

# Iniciar a aplicação
if [ "$NODE_ENV" = "development" ]; then
    echo "🔄 Iniciando em modo desenvolvimento..."
    if command -v nodemon &> /dev/null; then
        nodemon server.js
    else
        echo "⚠️  nodemon não encontrado. Instalando..."
        npm install -g nodemon
        nodemon server.js
    fi
else
    echo "🚀 Iniciando em modo produção..."
    node server.js
fi 