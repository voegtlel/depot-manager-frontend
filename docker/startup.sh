#!/bin/bash

if [[ -n "$PROXY_API_HOST" ]]; then
  echo "Setting PROXY_API_HOST=$PROXY_API_HOST"
  envsubst '$PROXY_API_HOST' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
  export API_HOST="/api"
  echo "Setting API_HOST=$API_HOST"
  envsubst '$API_HOST' < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/client/env.js
else
  export API_HOST="${API_HOST:-/api}"
  envsubst '$API_HOST' < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/client/env.js
fi

nginx -g "daemon off;"
