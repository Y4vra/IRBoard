FROM alpine:3.23.3
RUN apk add --no-cache curl jq postgresql-client
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh
ENTRYPOINT ["/bin/sh", "/bulkUserImport.sh", "/userList.csv"]