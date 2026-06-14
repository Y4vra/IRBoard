FROM oryd/oathkeeper:v25.4.0

USER root

RUN apk add --no-cache gettext

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]