1-REQUISITOS
##TENER DOCKER DESKTOP ABIERTO
##ESTAR EN EL DIRECTORIO /eventflow-platform o raiz del proyecto

2-
# Dar permisos de ejecución a los scripts
chmod +x scripts/*.sh

3-
# Iniciar la plataforma completa
./scripts/start.sh

# Ver estado de health checks
docker-compose ps

4-
# Ver logs de un servicio específico
./scripts/logs.sh user-service

5-
# Detener la plataforma
./scripts/stop.sh

//si hay que actualizarlo
# Reconstruir un servicio específico
docker-compose up -d --build user-service



Puerto-Servicio-Propósito
27017-mongo-Almacena datos de usuarios y eventos
5432-postgres-Gestiona transacciones de reservas
6379-redis-Cache para mejor rendimiento
3001-user-service-Gestiona perfiles de usuarios
3002-event-service-Maneja información de eventos
3003-reservation-service-Procesa reservas y pagos



