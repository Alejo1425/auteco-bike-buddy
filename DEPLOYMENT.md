# 🚀 Guía de Despliegue - Servidor 82.25.84.168

Esta guía detalla el proceso completo de despliegue del proyecto Auteco Bike Buddy en tu servidor con Traefik.

## 📋 Pre-requisitos en el Servidor

Antes de desplegar, verifica que tu servidor tenga:

```bash
# Conectarse al servidor
ssh root@82.25.84.168

# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version

# Verificar red de Traefik
docker network ls | grep traefik_proxy
```

## 🔧 Configuración DNS

Antes de desplegar, configura los registros DNS:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | juan.autorunai.tech | 82.25.84.168 | 3600 |
| A | maria.autorunai.tech | 82.25.84.168 | 3600 |
| A | autorunai.tech | 82.25.84.168 | 3600 |
| A | www.autorunai.tech | 82.25.84.168 | 3600 |

Espera 5-10 minutos para la propagación DNS.

## 📦 Método 1: Despliegue Automático (Recomendado)

### Desde tu máquina local:

```bash
# 1. Navegar al proyecto
cd auteco-bike-buddy-main

# 2. Hacer ejecutable el script
chmod +x deploy.sh

# 3. Ejecutar despliegue
./deploy.sh
```

El script automáticamente:
- Verifica la conexión al servidor
- Copia los archivos al servidor
- Construye las imágenes Docker
- Levanta los contenedores con Traefik
- Muestra el estado final

## 🔨 Método 2: Despliegue Manual

### Paso 1: Subir el proyecto a GitHub

```bash
# En tu máquina local
cd auteco-bike-buddy-main

# Inicializar repositorio (si no existe)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: Auteco Bike Buddy Multi-tenant"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/auteco-bike-buddy.git

# Subir código
git push -u origin main
```

### Paso 2: Clonar en el servidor

```bash
# Conectarse al servidor
ssh root@82.25.84.168

# Navegar a /opt
cd /opt

# Clonar repositorio
git clone https://github.com/TU_USUARIO/auteco-bike-buddy.git

# Entrar al directorio
cd auteco-bike-buddy
```

### Paso 3: Verificar red de Traefik

```bash
# Verificar si existe
docker network ls | grep traefik_proxy

# Si no existe, crearla
docker network create traefik_proxy
```

### Paso 4: Construir y desplegar

```bash
# Construir imágenes
docker-compose build

# Levantar contenedores
docker-compose up -d

# Verificar estado
docker-compose ps
```

### Paso 5: Verificar logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f auteco-juan
```

## 🔍 Verificación del Despliegue

### Verificar contenedores activos

```bash
docker-compose ps

# Deberías ver:
# auteco-juan      Up      80/tcp
# auteco-maria     Up      80/tcp
# auteco-default   Up      80/tcp
```

### Verificar certificados SSL

```bash
# Esperar 1-2 minutos para que Traefik genere certificados
# Luego visitar:
# https://juan.autorunai.tech
# https://maria.autorunai.tech
# https://autorunai.tech
```

### Verificar logs de Traefik

```bash
# Ver logs de Traefik
docker logs traefik

# Buscar errores de certificados
docker logs traefik | grep -i error
```

## 🔄 Actualización del Proyecto

Para actualizar el proyecto después de hacer cambios:

```bash
# Método 1: Usar el script de despliegue
./deploy.sh

# Método 2: Manual en el servidor
ssh root@82.25.84.168
cd /opt/auteco-bike-buddy
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

## 👥 Agregar Nuevo Asesor

### Opción 1: Desde local y desplegar

```bash
# En tu máquina local
./add-asesor.sh pedro "Pedro Ramírez" pedro@autorunai.tech "+57 300 345 6789" "573003456789"

# Commit y push
git add .
git commit -m "Add asesor: Pedro"
git push

# Desplegar
./deploy.sh
```

### Opción 2: Directamente en servidor

```bash
ssh root@82.25.84.168
cd /opt/auteco-bike-buddy

# Editar manualmente los archivos
nano src/config/asesor.ts
nano docker-compose.yml

# Reconstruir
docker-compose down
docker-compose build
docker-compose up -d
```

## 🚨 Troubleshooting

### Los contenedores no inician

```bash
# Ver logs
docker-compose logs

# Ver errores específicos
docker-compose logs auteco-juan

# Verificar recursos del servidor
docker stats
free -h
df -h
```

### Traefik no genera certificados

```bash
# Verificar labels de Traefik
docker inspect auteco-juan | grep traefik

# Verificar configuración de Traefik
docker exec traefik cat /etc/traefik/traefik.yml

# Ver logs de ACME
docker logs traefik | grep -i acme
```

### DNS no resuelve

```bash
# Verificar DNS desde el servidor
nslookup juan.autorunai.tech
dig juan.autorunai.tech

# Verificar desde tu máquina
ping juan.autorunai.tech
```

### Puerto 80/443 ocupado

```bash
# Ver qué usa el puerto
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Detener servicio conflictivo (ejemplo nginx)
systemctl stop nginx
systemctl disable nginx
```

## 📊 Monitoreo

### Ver recursos usados

```bash
# CPU y RAM por contenedor
docker stats

# Espacio en disco
docker system df

# Limpiar recursos no usados
docker system prune -a
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f auteco-juan

# Últimas 100 líneas
docker-compose logs --tail=100 auteco-juan
```

## 🔐 Seguridad

### Firewall

```bash
# Asegurar que solo Traefik exponga puertos
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### Backups

```bash
# Backup de configuración
cd /opt
tar -czf auteco-backup-$(date +%Y%m%d).tar.gz auteco-bike-buddy/

# Copiar a otro servidor (opcional)
scp auteco-backup-*.tar.gz user@backup-server:/backups/
```

## 📞 Comandos Rápidos

```bash
# Reiniciar todo
docker-compose restart

# Detener todo
docker-compose down

# Reconstruir sin cache
docker-compose build --no-cache

# Ver configuración final
docker-compose config

# Eliminar todo y empezar de nuevo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## ✅ Checklist de Despliegue

- [ ] DNS configurado para todos los subdominios
- [ ] Servidor accesible vía SSH
- [ ] Docker y Docker Compose instalados
- [ ] Red traefik_proxy creada
- [ ] Código subido a GitHub (opcional)
- [ ] Variables de entorno configuradas
- [ ] Contenedores construidos y corriendo
- [ ] HTTPS funcionando (certificados SSL)
- [ ] Todas las URLs accesibles
- [ ] Logs sin errores críticos

---

**Servidor**: 82.25.84.168
**Usuario**: root
**Path**: /opt/auteco-bike-buddy
**Red Docker**: traefik_proxy
