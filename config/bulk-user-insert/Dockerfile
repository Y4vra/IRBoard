FROM alpine:3.23.3
RUN apk add --no-cache curl jq postgresql-client
COPY setup.sh /bulkUserImport.sh
RUN chmod +x /bulkUserImport.sh
ENTRYPOINT ["/bin/sh", "/bulkUserImport.sh", "/userList.csv"]