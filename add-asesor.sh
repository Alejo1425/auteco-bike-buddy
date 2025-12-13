#!/bin/bash

################################################################################
# Script para agregar un nuevo asesor
#
# Uso: ./add-asesor.sh nombre_asesor "Nombre Completo" email telefono whatsapp
# Ejemplo: ./add-asesor.sh pedro "Pedro Ramírez" pedro@autorunai.tech "+57 300 345 6789" "573003456789"
################################################################################

if [ "$#" -lt 5 ]; then
    echo "Uso: $0 <id_asesor> <nombre_completo> <email> <telefono> <whatsapp>"
    echo "Ejemplo: $0 pedro \"Pedro Ramírez\" pedro@autorunai.tech \"+57 300 345 6789\" \"573003456789\""
    exit 1
fi

ASESOR_ID=$1
NOMBRE=$2
EMAIL=$3
TELEFONO=$4
WHATSAPP=$5
SUBDOMINIO="${ASESOR_ID}.autorunai.tech"

echo "================================================"
echo "  Agregando nuevo asesor: $NOMBRE"
echo "================================================"
echo ""
echo "ID: $ASESOR_ID"
echo "Nombre: $NOMBRE"
echo "Email: $EMAIL"
echo "Teléfono: $TELEFONO"
echo "WhatsApp: $WHATSAPP"
echo "Subdominio: $SUBDOMINIO"
echo ""
read -p "¿Continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# 1. Agregar configuración al archivo asesor.ts
echo "[1/3] Agregando configuración..."
CONFIG_ENTRY="  ${ASESOR_ID}: {
    id: '${ASESOR_ID}',
    nombre: '${NOMBRE}',
    email: '${EMAIL}',
    telefono: '${TELEFONO}',
    whatsapp: '${WHATSAPP}',
    urlSubdominio: '${SUBDOMINIO}',
    colorPrimario: '#1a56db',
    colorSecundario: '#0e7490',
  },"

# Buscar la línea "// Agrega más asesores" e insertar antes
sed -i "/\/\/ Agrega más asesores/i\\${CONFIG_ENTRY}" src/config/asesor.ts

echo "✓ Configuración agregada a src/config/asesor.ts"

# 2. Agregar servicio al docker-compose.yml
echo "[2/3] Agregando servicio Docker..."
SERVICE_ENTRY="
  # Instancia para ${NOMBRE}
  auteco-${ASESOR_ID}:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_ASESOR_ID: ${ASESOR_ID}
    container_name: auteco-${ASESOR_ID}
    restart: unless-stopped
    networks:
      - traefik_proxy
    labels:
      - \"traefik.enable=true\"
      - \"traefik.http.routers.auteco-${ASESOR_ID}.rule=Host(\\\`${SUBDOMINIO}\\\`)\"
      - \"traefik.http.routers.auteco-${ASESOR_ID}.entrypoints=websecure\"
      - \"traefik.http.routers.auteco-${ASESOR_ID}.tls=true\"
      - \"traefik.http.routers.auteco-${ASESOR_ID}.tls.certresolver=letsencrypt\"
      - \"traefik.http.services.auteco-${ASESOR_ID}.loadbalancer.server.port=80\"
      # Redirección HTTP a HTTPS
      - \"traefik.http.routers.auteco-${ASESOR_ID}-http.rule=Host(\\\`${SUBDOMINIO}\\\`)\"
      - \"traefik.http.routers.auteco-${ASESOR_ID}-http.entrypoints=web\"
      - \"traefik.http.routers.auteco-${ASESOR_ID}-http.middlewares=redirect-to-https\"
"

# Insertar antes de "networks:"
sed -i "/^networks:/i\\${SERVICE_ENTRY}" docker-compose.yml

echo "✓ Servicio agregado a docker-compose.yml"

echo ""
echo "================================================"
echo "  ✓ Asesor agregado exitosamente"
echo "================================================"
echo ""
echo "Próximos pasos:"
echo "1. Configurar DNS: Crear registro A para ${SUBDOMINIO} → 82.25.84.168"
echo "2. Desplegar: ./deploy.sh"
echo "3. Verificar: https://${SUBDOMINIO}"
echo ""
