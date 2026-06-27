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

echo "Waiting for Keto namespaces..."
until curl -sf "http://keto:4466/namespaces" | grep -q '"System"'; do sleep 2; done

echo "Waiting for backend DB table..."
until psql "$DB_CON_STR" -c "SELECT 1 FROM app_user LIMIT 1;" > /dev/null 2>&1; do sleep 2; done

SUCCESS=0
FAILED=0
SKIPPED=0

# Skip header row with tail -n +2
tail -n +2 "$CSV_FILE" | while IFS=',' read -r EMAIL NAME SURNAME IS_ADMIN PASSWORD; do

  # Skip blank lines
  if [ -z "$EMAIL" ]; then
    continue
  fi

  echo "---"
  echo "Processing user: $EMAIL"

  # Build Kratos payload
  cat > /tmp/user.json <<EOF
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

  # Create identity in Kratos
  RESPONSE=$(curl -sf -X POST "$KRATOS_URL" \
    -H "Content-Type: application/json" \
    -d @/tmp/user.json 2>&1) || true

  USER_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)

  if [ "$USER_ID" = "null" ] || [ -z "$USER_ID" ]; then
    echo "  Warning: could not create '$EMAIL' in Kratos — skipping."
    FAILED=$((FAILED + 1))
    continue
  fi

  echo "  Kratos identity created: $USER_ID"

  # Add to Keto only if is_admin is true
  if [ "$IS_ADMIN" = "true" ]; then
    curl -sf -X PUT "$KETO_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"namespace\": \"System\",
        \"object\": \"main\",
        \"relation\": \"admins\",
        \"subject_id\": \"$USER_ID\"
      }" || echo "  Warning: failed to add '$EMAIL' to Keto admins."
    echo "  Added to Keto as admin."
  fi

  # Insert into backend DB
  psql "$DB_CON_STR" -c "
    INSERT INTO app_user (ory_id, email, name, surname, is_admin, active)
    VALUES ('$USER_ID', '$EMAIL', '$NAME', '$SURNAME', $IS_ADMIN, true)
    ON CONFLICT (ory_id) DO NOTHING;
  " && echo "  Inserted into backend DB." \
    || echo "  Warning: failed to insert '$EMAIL' into backend DB."

  SUCCESS=$((SUCCESS + 1))

done

echo "==="
echo "Import complete."
echo "  Succeeded : $SUCCESS"
echo "  Failed    : $FAILED"