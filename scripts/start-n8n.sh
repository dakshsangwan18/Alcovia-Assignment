#!/bin/bash
# Start n8n with TLS for local development
# Requires mkcert: brew install mkcert nss && mkcert -install

cd "$(dirname "$0")"

if [ ! -f n8n/localhost+2-key.pem ]; then
  echo "Generating TLS certs with mkcert..."
  mkcert -key-file n8n/localhost+2-key.pem -cert-file n8n/localhost+2.pem localhost 127.0.0.1 ::1
  echo "Done."
fi

N8N_PROTOCOL=https \
N8N_HOST=localhost \
N8N_PORT=5678 \
N8N_SSL_KEY=n8n/localhost+2-key.pem \
N8N_SSL_CERT=n8n/localhost+2.pem \
npx n8n start
