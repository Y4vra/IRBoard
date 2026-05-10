#!/bin/sh
set -e

export PGPASSWORD="$DB_PASS"
DB_CON_STR="postgresql://$DB_USER:$DB_PASS@backend-db:5432/$DB_NAME"

echo "Waiting for Kratos..."
until curl -sf "http://kratos:4434/admin/identities" > /dev/null 2>&1; do sleep 2; done

cat > /tmp/admin.json <<EOF
{
  "schema_id": "default",
  "traits": {
    "email": "$ADMIN_EMAIL",
    "name": "$ADMIN_NAME",
    "surname": "$ADMIN_SURNAME",
    "is_admin": true
  },
  "credentials": {
    "password": {
      "config": {
        "password": "$ADMIN_PASSWORD"
      }
    }
  }
}
EOF

USER_ID=$(curl -sf -X POST "$KRATOS_URL" -H "Content-Type: application/json" -d @/tmp/admin.json | jq -r '.id')

if [ "$USER_ID" = "null" ] || [ -z "$USER_ID" ]; then
  echo "Error: could not create admin in Kratos."
  exit 1
fi
echo "Admin created in Kratos: $USER_ID"

echo "Waiting for Keto namespaces..."
until curl -sf "http://keto:4466/namespaces" | grep -q '"System"'; do sleep 2; done

curl -sf -X PUT "$KETO_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"namespace\": \"System\",
    \"object\": \"main\",
    \"relation\": \"admins\",
    \"subject_id\": \"$USER_ID\"
  }"
echo "Admin added to Keto."

echo "Waiting for backend DB table..."
until psql "$DB_CON_STR" -c "SELECT 1 FROM app_user LIMIT 1;" > /dev/null 2>&1; do sleep 2; done

psql "$DB_CON_STR" -c "INSERT INTO app_user (ory_id, email, name, surname, is_admin, active) VALUES ('$USER_ID', '$ADMIN_EMAIL', '$ADMIN_NAME', '$ADMIN_SURNAME', true, true) ON CONFLICT (ory_id) DO NOTHING;"
echo "Admin added to backend DB."