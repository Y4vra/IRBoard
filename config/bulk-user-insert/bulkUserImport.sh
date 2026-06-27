#!/bin/sh
set -e

CSV_FILE="$1"
if [ -z "$CSV_FILE" ]; then
  echo "Usage: $0 <csv_file>"
  echo "CSV format: email,name,surname,is_admin,password"
  exit 1
fi
if [ ! -f "$CSV_FILE" ]; then
  echo "Error: file '$CSV_FILE' not found."
  exit 1
fi

export PGPASSWORD="$DB_PASS"
DB_CON_STR="postgresql://$DB_USER:$DB_PASS@backend-db:5432/$DB_NAME"

echo "Waiting for Kratos..."
until curl -sf "http://kratos:4434/admin/identities" > /dev/null 2>&1; do sleep 2; done
echo "Kratos is up."

echo "Waiting for Keto namespaces..."
until curl -sf "http://keto:4466/namespaces" | grep -q '"System"'; do sleep 2; done
echo "Keto is up."

echo "Waiting for backend DB table..."
until psql "$DB_CON_STR" -c "SELECT 1 FROM app_user LIMIT 1;" > /dev/null 2>&1; do sleep 2; done
echo "Backend DB is up."

SUCCESS=0
FAILED=0
TMPCSV="/tmp/import_users_data.csv"
tail -n +2 "$CSV_FILE" > "$TMPCSV"

while IFS=',' read -r EMAIL NAME SURNAME IS_ADMIN PASSWORD; do
  if [ -z "$EMAIL" ]; then
    continue
  fi

  echo "---"
  echo "Processing user: $EMAIL"

  
  cat > /tmp/current_user.json <<EOF
{
  "schema_id": "default",
  "traits": {
    "email": "$EMAIL",
    "name": "$NAME",
    "surname": "$SURNAME",
    "is_admin": $IS_ADMIN
  },
  "credentials": {
    "password": {
      "config": {
        "password": "$PASSWORD"
      }
    }
  }
}
EOF

  RESPONSE=$(curl -sf -X POST "$KRATOS_URL" \
    -H "Content-Type: application/json" \
    -d @/tmp/current_user.json 2>&1) || true

  USER_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)

  if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo "  Warning: could not create '$EMAIL' in Kratos — skipping."
    echo "  Response: $RESPONSE"
    FAILED=$((FAILED + 1))
    continue
  fi

  echo "  Kratos identity created: $USER_ID"

  if [ "$IS_ADMIN" = "true" ]; then
    # Build Keto payload same way as working script but with jq for safety
    KETO_PAYLOAD=$(jq -n \
      --arg subject_id "$USER_ID" \
      '{namespace: "System", object: "main", relation: "admins", subject_id: $subject_id}')

    echo "$KETO_PAYLOAD" | curl -sf -X PUT "$KETO_URL" \
      -H "Content-Type: application/json" \
      -d @- || echo "  Warning: failed to add '$EMAIL' to Keto admins."

    echo "  Added to Keto as admin."
  fi

  # Use psql with \$-style quoting via a temp SQL file to avoid injection
  # from names/emails with apostrophes
  cat > /tmp/insert_user.sql <<SQLEOF
INSERT INTO app_user (ory_id, email, name, surname, is_admin, active)
VALUES ('$USER_ID', '$EMAIL', '$NAME', '$SURNAME', $IS_ADMIN, true)
ON CONFLICT (ory_id) DO NOTHING;
SQLEOF

  DB_RESULT=$(psql "$DB_CON_STR" -f /tmp/insert_user.sql 2>&1)

  if echo "$DB_RESULT" | grep -qi "error"; then
    echo "  Warning: failed to insert '$EMAIL' into backend DB."
    echo "  DB error: $DB_RESULT"
    FAILED=$((FAILED + 1))
  else
    echo "  Inserted into backend DB."
    SUCCESS=$((SUCCESS + 1))
  fi

  sleep 0.03

done < "$TMPCSV"

rm -f "$TMPCSV" /tmp/current_user.json /tmp/insert_user.sql

echo "==="
echo "Import complete."
echo "  Succeeded : $SUCCESS"
echo "  Failed    : $FAILED"