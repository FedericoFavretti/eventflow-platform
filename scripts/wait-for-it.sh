#!/usr/bin/env bash
# Usa este script para esperar que los servicios dependientes estén listos

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until nc -z "$host" "$port"; do
  echo "Esperando que $host:$port esté disponible..."
  sleep 1
done

echo "$host:$port está disponible, ejecutando: $cmd"
exec $cmd