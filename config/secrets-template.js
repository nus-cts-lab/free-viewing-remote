/**
 * Secrets Template - Configuration for Private Credentials
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to: config/secrets.js
 * 2. Fill in your actual credentials below
 * 3. Never commit secrets.js to version control
 * 
 * This template is safe to commit - it contains no real credentials
 */

// Copy this entire file to config/secrets.js and update with your values:

window.SECRETS = {
    // Telegram Bot Configuration
    // Get this from @BotFather on Telegram after creating your bot
    TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    
    // Supabase Configuration  
    // Get these from your Supabase dashboard: Settings > API
    SUPABASE_URL: 'YOUR_SUPABASE_PROJECT_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
};

/* 
EXAMPLE (DO NOT USE THESE VALUES):
window.SECRETS = {
    TELEGRAM_BOT_TOKEN: '1234567890:AABBCCDDEEFFGGHHIIJJKKLLmmnnoopp',
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
*/