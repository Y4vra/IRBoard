
- id: "kratos-self-service-pass"
  match:
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    url: "http://${AUTH_DOMAIN}/<.*>"
  authenticators:
    - handler: "noop"
  authorizer:
    handler: "allow"
  mutators:
    - handler: "noop"
  upstream:
    url: "http://kratos:4433" 
    preserve_host: true

- id: "api-backend-activate-public"
  match:
    methods: ["POST", "OPTIONS"]
    url: "http://${API_DOMAIN}/v1/auth/activate"
  authenticators:
    - handler: "noop"
  authorizer:
    handler: "allow"
  mutators:
    - handler: "noop"
  upstream:
    url: "http://backend:8080"
    preserve_host: true

- id: "api-backend-protected"
  match:
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    url: "http://${API_DOMAIN}/v1/<(users|home|projects|whoami|locks|search).*>"
  authenticators:
    - handler: "cookie_session"
  authorizer:
    handler: "allow"
  mutators:
    - handler: "header"
      config:
        headers:
          X-User: "{{ .Subject }}"
  upstream:
    url: "http://backend:8080"
