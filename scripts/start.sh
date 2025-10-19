#!/bin/bash
echo "   Iniciando EventFlow Platform..."

# Eliminar contenedores existentes si los hay
docker compose down

# Construir y levantar SOLO los servicios que tenemos
docker compose up -d --build mongo postgres redis user-service reservation-service

echo "   Esperando que los servicios estén listos..."
sleep 5

# Verificar estado de los servicios
echo "   Estado de los servicios:"
docker compose ps

# Esperar adicionalmente para el user-service
echo "   Esperando que User Service esté listo..."
sleep 5

# Verificar health checks
echo "   Verificando salud de los servicios:"
docker compose ps

echo "   Servicios base iniciados correctamente"
echo "   URLs de los servicios:"
echo "   User Service: http://localhost:3001"
echo "   MongoDB: localhost:27017"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"

# Probar el endpoint de salud
echo "   Probando User Service..."
curl -f http://localhost:3001/health || echo "   User Service no responde"
