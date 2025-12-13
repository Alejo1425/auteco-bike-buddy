#!/bin/bash

################################################################################
# Quick Start Guide - Auteco Bike Buddy
#
# Este script te guía paso a paso en el proceso de despliegue
################################################################################

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🏍️  AUTECO BIKE BUDDY - QUICK START  🏍️           ║
║                                                           ║
║           Sistema Multi-tenant de Catálogo                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}Este asistente te ayudará a:${NC}"
echo "  1. Verificar pre-requisitos"
echo "  2. Configurar el proyecto"
echo "  3. Subir a GitHub"
echo "  4. Desplegar al servidor"
echo ""

read -p "¿Continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 1: Verificando Pre-requisitos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar Node.js
echo -n "Verificando Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Instalado ($NODE_VERSION)${NC}"
else
    echo -e "${RED}✗ No instalado${NC}"
    echo "Por favor instala Node.js 20+ desde https://nodejs.org"
    exit 1
fi

# Verificar npm
echo -n "Verificando npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ Instalado ($NPM_VERSION)${NC}"
else
    echo -e "${RED}✗ No instalado${NC}"
    exit 1
fi

# Verificar Git
echo -n "Verificando Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓ Instalado ($GIT_VERSION)${NC}"
else
    echo -e "${RED}✗ No instalado${NC}"
    echo "Por favor instala Git desde https://git-scm.com"
    exit 1
fi

# Verificar Docker (opcional)
echo -n "Verificando Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Instalado ($DOCKER_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ No instalado (opcional para desarrollo local)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 2: Instalando Dependencias${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias (esto puede tomar unos minutos)..."
    npm install
    echo -e "${GREEN}✓ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✓ Dependencias ya instaladas${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 3: Configuración${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -f ".env" ]; then
    echo "Creando archivo .env..."
    cp .env.example .env
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo -e "${YELLOW}  Puedes editarlo si necesitas cambiar el asesor por defecto${NC}"
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 4: Prueba Local${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "¿Quieres probar la aplicación localmente? (s/n)"
read -p "> " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${GREEN}Iniciando servidor de desarrollo...${NC}"
    echo -e "${YELLOW}La aplicación se abrirá en http://localhost:5173${NC}"
    echo -e "${YELLOW}Presiona Ctrl+C para detener el servidor${NC}"
    echo ""
    npm run dev
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 5: Configurar Git${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -d ".git" ]; then
    echo "¿Inicializar repositorio Git? (s/n)"
    read -p "> " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git init
        echo -e "${GREEN}✓ Repositorio Git inicializado${NC}"

        echo ""
        echo "Configuremos tu información de Git:"
        read -p "Tu nombre: " GIT_NAME
        read -p "Tu email: " GIT_EMAIL

        git config user.name "$GIT_NAME"
        git config user.email "$GIT_EMAIL"

        echo -e "${GREEN}✓ Git configurado${NC}"
    fi
else
    echo -e "${GREEN}✓ Repositorio Git ya inicializado${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PRÓXIMOS PASOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}✅ Configuración inicial completada!${NC}"
echo ""
echo "Ahora puedes:"
echo ""
echo -e "${YELLOW}1. Subir a GitHub:${NC}"
echo "   - Lee: GITHUB_SETUP.md"
echo "   - Crea un repositorio en GitHub"
echo "   - Ejecuta los comandos de Git"
echo ""
echo -e "${YELLOW}2. Desplegar al servidor:${NC}"
echo "   - Lee: DEPLOYMENT.md"
echo "   - Configura DNS para los subdominios"
echo "   - Ejecuta: ./deploy.sh"
echo ""
echo -e "${YELLOW}3. Agregar asesores:${NC}"
echo "   - Ejecuta: ./add-asesor.sh nombre \"Nombre Completo\" email tel whatsapp"
echo ""
echo -e "${YELLOW}4. Desarrollo local:${NC}"
echo "   - Ejecuta: npm run dev"
echo "   - Abre: http://localhost:5173"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  COMANDOS RÁPIDOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  npm run dev              - Servidor desarrollo"
echo "  npm run build            - Build producción"
echo "  ./deploy.sh              - Desplegar a servidor"
echo "  ./add-asesor.sh          - Agregar nuevo asesor"
echo ""
echo -e "${GREEN}¡Listo para comenzar! 🚀${NC}"
echo ""
