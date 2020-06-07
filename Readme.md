<a href="https://cloud.docker.com/repository/docker/voegtlel/depot-manager-frontend/builds">
  <img src="https://img.shields.io/docker/cloud/build/voegtlel/depot-manager-frontend.svg" alt="Docker build status" />
</a>
<img src="https://img.shields.io/github/license/voegtlel/depot-manager-frontend.svg" alt="License" />

# Client for ldap admin

This is the frontend for [depot-manager-backend](https://github.com/voegtlel/depot-manager-backend).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Docker

The docker image is located at `voegtlel/depot-manager-frontend`.

## OAuth OIDC

Register this client with the settings (change as needed by your OIDC Provider):

```
clientId: depot
redirectUri: https://depot.example.com/.*
scopes: openid, offline_access, profile, email, phone, groups
endpointAuthMethod: none
responseTypes: (refresh)token, code
grantTypes: authorization code (pkce), refresh token
mappedRoles: admin, manager
```

## Docker compose

```
version: '3'
services:
  frontend:
    image: voegtlel/depot-manager-frontend
    restart: unless-stopped
    environment:
      # Forward backend to /api
      # (will set API_HOST='/api')
      PROXY_API_HOST: backend
      # Set this if you're behind a reverse proxy:
      # REAL_IP_RECURSIVE: on
      # REAL_IP_HEADER: X-Real-Ip  # default: X-Real-Ip
      # OR: Host backend at separate URL:
      # API_HOST: 'api.example.com'

      OICD_ISSUER: 'auth.example.com'
      OICD_CLIENT_ID: 'manager'
    port:
      # Serve at :80, you may for sure also use a reverse proxy, etc.
      - 80:80
    networks:
      - backend

  backend:
    image: voegtlel/depot-manager-backend
    restart: unless-stopped
    environment:
      # Override any config.yaml variable by typing API_CONFIG_<container>_<container...>_<variable>
      # where the names are automagically converted from camelCase to underscore_notation (ignoring casing).

      # Set this if you use different origin
      # API_CONFIG_ALLOW_ORIGINS: "['https://api.depot.example.com']"

      API_CONFIG_FRONTEND_BASE_URL: "https://depot.example.com"

      API_CONFIG_MONGO_URI: "mongodb://depot:<mongopw>@mongo/depot"

      API_CONFIG_OAUTH2_SERVER_METADATA_URL: "https://auth.example.com/.well-known/openid-configuration"
      API_CONFIG_OAUTH2_CLIENT_ID: "depot"

      API_CONFIG_MAIL_HOST: "mailhost"
      API_CONFIG_MAIL_SENDER: "account@example.com"
    networks:
      - backend
      - default

  mongo:
    image: mongo
    volumes:
      - ./db:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: depot
      MONGO_INITDB_ROOT_PASSWORD: <mongopw>
    networks:
      - backend
networks:
  backend:
```
