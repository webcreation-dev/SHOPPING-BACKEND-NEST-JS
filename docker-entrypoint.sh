#!/bin/bash
set -e

echo "*****"
echo "** Application preparing to start up... Hi!"
echo "** Local time         :$(date -Is)"
echo "** SERVICE_NAME       :${SERVICE_NAME}"
echo "*****"

if [ -d "/app" ]
then
  pushd /app

  if [ "$SEQUELIZE_MIGRATE" = "ENABLE" ]
  then
    echo "+Running sequelize migrations (caches will be cleared) - disable with .env entry SEQUELIZE_MIGRATION=DISABLE"
    npm run migration:run
  else
    echo "+Skipping sequelize migrations - enable with .env entry SEQUELIZE_MIGRATION=ENABLE"
  fi

  if [ "$SEQUELIZE_SEED" = "ENABLE" ]
  then
    echo "+Running sequelize seed - disable with SEQUELIZE_GENERATE .env entry =DISABLE"
    npm run db:seed
  else
    echo "+Skipping sequelize generate - enable with .env entry SEQUELIZE_GENERATE=ENABLE"
  fi

  popd
fi

if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]
then
  set -- node "$@"
fi

exec "$@"
