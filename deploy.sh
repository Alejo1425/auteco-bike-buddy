#!/bin/bash

################################################################################
# Script de Despliegue - Auteco Bike Buddy Multi-tenant
#
# Este script automatiza el despliegue de la aplicación en el servidor
# con soporte para múltiples asesores usando Traefik
################################################################################

set -e  # Detener en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
SERVER_USER="root"
SERVER_HOST="82.25.84.168"
SERVER_PATH="/opt/auteco-bike-buddy"
REPO_URL="https://github.com/TU_USUARIO/auteco-bike-buddy.git"  # Cambiar por tu repo

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Despliegue Auteco Bike Buddy Multi-tenant${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Función para ejecutar comandos en el servidor
remote_exec() {
    ssh ${SERVER_USER}@${SERVER_HOST} "$1"
}

# Función para copiar archivos al servidor
remote_copy() {
    scp -r "$1" ${SERVER_USER}@${SERVER_HOST}:"$2"
}

echo -e "${YELLOW}[1/6] Verificando conexión al servidor...${NC}"
if remote_exec "echo 'Conexión exitosa'"; then
    echo -e "${GREEN}✓ Conectado al servidor${NC}"
else
    echo -e "${RED}✗ Error al conectar al servidor${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/6] Preparando directorio en el servidor...${NC}"
remote_exec "mkdir -p ${SERVER_PATH}"
echo -e "${GREEN}✓ Directorio creado${NC}"

echo ""
echo -e "${YELLOW}[3/6] Copiando archivos al servidor...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
    ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
echo -e "${GREEN}✓ Archivos copiados${NC}"

echo ""
echo -e "${YELLOW}[4/6] Verificando red de Traefik...${NC}"
remote_exec "docker network inspect traefik_proxy >/dev/null 2>&1 || docker network create traefik_proxy"
echo -e "${GREEN}✓ Red de Traefik verificada${NC}"

echo ""
echo -e "${YELLOW}[5/6] Construyendo y desplegando contenedores...${NC}"
remote_exec "cd ${SERVER_PATH} && docker-compose down && docker-compose build && docker-compose up -d"
echo -e "${GREEN}✓ Contenedores desplegados${NC}"

echo ""
echo -e "${YELLOW}[6/6] Verificando estado de contenedores...${NC}"
remote_exec "cd ${SERVER_PATH} && docker-compose ps"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✓ Despliegue completado exitosamente${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Sitios disponibles:"
echo -e "  • ${GREEN}https://juan.autorunai.tech${NC}"
echo -e "  • ${GREEN}https://maria.autorunai.tech${NC}"
echo -e "  • ${GREEN}https://autorunai.tech${NC}"
echo ""
echo -e "Comandos útiles:"
echo -e "  Ver logs: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_PATH} && docker-compose logs -f'"
echo -e "  Reiniciar: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_PATH} && docker-compose restart'"
echo -e "  Detener: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_PATH} && docker-compose down'"
echo ""
