/**
 * Production Configuration - Uses Environment Variables
 * This file will be used in production to load secrets from environment variables
 */

window.SECRETS = {
    // These will be replaced by Vercel environment variables
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
};
