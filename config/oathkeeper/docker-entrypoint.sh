#!/bin/sh
set -e

echo "Rendering access-rules.yaml from template..."

envsubst '${DOMAIN_NAME} ${AUTH_DOMAIN} ${API_DOMAIN} ${OBJS_DOMAIN} ${DRAWIO_DOMAIN}' \
  < /etc/config/oathkeeper/access-rules.yaml.tpl \
  > /etc/config/oathkeeper/access-rules.yaml

echo "Generated access rules:"
cat /etc/config/oathkeeper/access-rules.yaml

echo "Starting Oathkeeper..."

exec oathkeeper serve proxy \
  -c /etc/config/oathkeeper/oathkeeper.yaml