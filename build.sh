#!/bin/bash

# Build script for Vercel deployment
# This script creates the secrets.js file from environment variables

echo "Building secrets.js from environment variables..."

cat > config/secrets.js << EOF
/**
 * Configuration Secrets - Generated from Environment Variables
 */

window.SECRETS = {
    TELEGRAM_BOT_TOKEN: '${TELEGRAM_BOT_TOKEN}',
    SUPABASE_URL: '${SUPABASE_URL}',
    SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}'
};
EOF

echo "Build complete!"
