#!/bin/bash

# Build script for Vercel deployment
# This script creates the secrets.js file from environment variables

echo "Building secrets.js from environment variables..."

cat > config/secrets.js << EOF
/**
 * Configuration Secrets - Generated from Environment Variables
 * Note: TELEGRAM_BOT_TOKEN moved to server-side API route for security
 */

window.SECRETS = {
    SUPABASE_URL: "${SUPABASE_URL}",
    SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
};
EOF

echo "Build complete!"
