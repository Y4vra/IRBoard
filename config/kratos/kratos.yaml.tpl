version: v1.1.0
serve:
  public:
    port: 4433
    base_url: ${SERVE_PUBLIC_BASE_URL}
    cors:
      enabled: false
  admin:
    port: 4434
    base_url: ${SERVE_ADMIN_BASE_URL}

selfservice:
  allowed_return_urls:
    - ${SELFSERVICE_ALLOWED_RETURN_URLS}
  default_browser_return_url: ${SELFSERVICE_DEFAULT_BROWSER_RETURN_URL}

  methods:
    link:
      enabled: false
    password:
      enabled: true
      config:
        min_password_length: 15
    code:
      enabled: true
      config:
        lifespan: 24h
        max_submissions: 5

  flows:
    verification:
      enabled: false
    recovery: 
      enabled: true
      ui_url: ${SELFSERVICE_FLOWS_RECOVERY_UI_URL}
      use: code 
    error:
      ui_url: ${SELFSERVICE_FLOWS_ERROR_UI_URL}
    settings:
      ui_url: ${SELFSERVICE_FLOWS_SETTINGS_UI_URL}
      privileged_session_max_age: 15m
    logout:
      after:
        default_browser_return_url: ${SELFSERVICE_FLOWS_LOGOUT_AFTER_DEFAULT_BROWSER_RETURN_URL}
    login:
      ui_url: ${SELFSERVICE_FLOWS_LOGIN_UI_URL}

session:
  lifespan: 24h
  cookie:
    domain: ${DOMAIN_NAME}
    name: irboard_session
    same_site: Lax
    secure: "${SESSIONS_COOKIE_SECURE}"

identity:
  default_schema_id: default
  schemas:
    - id: default
      url: file:///etc/config/kratos/identity.schema.json

hashers:
  argon2:
    parallelism: 1
    memory: 128MB
    iterations: 2
    salt_length: 16
    key_length: 32

courier:
  delivery_strategy: smtp
  smtp:
    connection_uri: smtp://smtp-server:1025/?skip_ssl_verify=true&disable_starttls=true
    from_name: IR-Board System
    from_address: no-reply@ir-board.com
  templates:
    recovery_code:
      valid:
        email:
          subject: file:///etc/config/kratos/templates/recovery/valid/subject.gotmpl
          body:
            html: file:///etc/config/kratos/templates/recovery/valid/body.html.gotmpl
            plaintext: file:///etc/config/kratos/templates/recovery/valid/body.txt.gotmpl