#!/bin/bash

# Script para build multi-arquitetura e push para Docker Hub
# FCI - API Youtube v1
# Autor: Mateus Gomes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Build Multi-Arquitetura - FCI API Youtube v1${NC}"
echo "======================================================"

# Verificar se o usuário Docker Hub foi fornecido
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: É necessário fornecer o usuário do Docker Hub${NC}"
    echo -e "${YELLOW}Uso: $0 <seu-usuario-dockerhub> [versao]${NC}"
    echo -e "${YELLOW}Exemplo: $0 mateusgomes 1.0.0${NC}"
    exit 1
fi

DOCKER_USER="$1"
VERSION="${2:-latest}"
IMAGE_NAME="$DOCKER_USER/fci-api-youtube-v1"

echo -e "${BLUE}📋 Configurações:${NC}"
echo "   • Usuário Docker Hub: $DOCKER_USER"
echo "   • Nome da Imagem: $IMAGE_NAME"
echo "   • Versão: $VERSION"
echo "   • Arquiteturas: linux/amd64, linux/arm64"
echo ""

# Verificar se está logado no Docker Hub
echo -e "${YELLOW}🔐 Verificando login no Docker Hub...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  Não está logado. Fazendo login...${NC}"
    docker login
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Falha no login do Docker Hub${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Login verificado${NC}"

# Verificar se buildx está disponível
echo -e "${YELLOW}🔧 Verificando Docker Buildx...${NC}"
if ! docker buildx version &> /dev/null; then
    echo -e "${RED}❌ Docker Buildx não está disponível${NC}"
    echo "Instale o Docker Desktop ou atualize para uma versão mais recente"
    exit 1
fi

echo -e "${GREEN}✅ Docker Buildx disponível${NC}"

# Criar builder multi-arquitetura se não existir
echo -e "${YELLOW}🏗️  Configurando builder multi-arquitetura...${NC}"
if ! docker buildx ls | grep -q "multiarch-builder"; then
    echo "Criando novo builder..."
    docker buildx create --name multiarch-builder --use
    docker buildx inspect --bootstrap
else
    echo "Usando builder existente..."
    docker buildx use multiarch-builder
fi

echo -e "${GREEN}✅ Builder configurado${NC}"

# Build e push da imagem
echo -e "${YELLOW}🔨 Iniciando build multi-arquitetura...${NC}"
echo "   Isso pode levar alguns minutos..."
echo ""

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --file docker/Dockerfile \
    --tag "$IMAGE_NAME:$VERSION" \
    --tag "$IMAGE_NAME:latest" \
    --push \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 BUILD E PUSH CONCLUÍDOS COM SUCESSO!${NC}"
    echo "======================================================"
    echo -e "${BLUE}📦 Imagem disponível no Docker Hub:${NC}"
    echo "   • $IMAGE_NAME:$VERSION"
    echo "   • $IMAGE_NAME:latest"
    echo ""
    echo -e "${BLUE}🖥️  Para usar no Mac (ARM64):${NC}"
    echo "   docker run -p 3000:3000 $IMAGE_NAME:$VERSION"
    echo ""
    echo -e "${BLUE}🐧 Para usar no Linux (AMD64):${NC}"
    echo "   docker run -p 3000:3000 $IMAGE_NAME:$VERSION"
    echo ""
    echo -e "${BLUE}📋 Docker Compose (substitua no seu docker-compose.yml):${NC}"
    echo "   image: $IMAGE_NAME:$VERSION"
    echo ""
    echo -e "${GREEN}✅ Compatível com Mac M1/M2 e servidores Linux!${NC}"
else
    echo -e "${RED}❌ Falha no build ou push${NC}"
    exit 1
fi 