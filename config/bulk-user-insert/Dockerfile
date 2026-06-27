FROM alpine:3.23.3
RUN apk add --no-cache curl jq postgresql-client
COPY bulkUserImport.sh /bulkUserImport.sh
COPY userList.csv /userList.csv
RUN chmod +x /bulkUserImport.sh
ENTRYPOINT ["/bin/sh", "/bulkUserImport.sh", "/userList.csv"]