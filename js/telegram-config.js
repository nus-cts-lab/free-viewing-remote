/**
 * Telegram Bot Configuration
 * Loads credentials from config/secrets.js
 */

// Check if secrets are loaded
function getTelegramConfig() {
    if (typeof window.SECRETS === 'undefined') {
        console.error('❌ Secrets not loaded! Please create config/secrets.js from config/secrets-template.js');
        throw new Error('Missing configuration: config/secrets.js not found. See OPEN-SETUP.md for instructions.');
    }
    
    const botToken = window.SECRETS.TELEGRAM_BOT_TOKEN;
    if (!botToken || botToken === 'YOUR_BOT_TOKEN_HERE') {
        console.error('❌ Telegram bot token not configured in config/secrets.js');
        throw new Error('Missing Telegram bot token in config/secrets.js. See OPEN-SETUP.md for setup instructions.');
    }
    
    return {
        BOT_TOKEN: botToken,
        API_URL: `https://api.telegram.org/bot${botToken}`
    };
}

// Export configuration for use in other modules
let TELEGRAM_CONFIG;
try {
    TELEGRAM_CONFIG = getTelegramConfig();
    window.TELEGRAM_CONFIG = TELEGRAM_CONFIG;
} catch (error) {
    console.error('Telegram configuration failed:', error.message);
    // Create fallback config that will show helpful errors
    window.TELEGRAM_CONFIG = {
        BOT_TOKEN: null,
        API_URL: null,
        ERROR: error.message
    };
}

// Test function to verify bot token is valid
async function testTelegramBot() {
    try {
        if (TELEGRAM_CONFIG.ERROR) {
            console.error('❌ Cannot test bot - configuration error:', TELEGRAM_CONFIG.ERROR);
            return false;
        }
        
        const response = await fetch(`${TELEGRAM_CONFIG.API_URL}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Telegram bot connection successful:', data.result.username);
            return true;
        } else {
            console.error('❌ Telegram bot test failed:', data.description);
            return false;
        }
    } catch (error) {
        console.error('❌ Telegram bot connection failed:', error);
        return false;
    }
}

// Make function globally available
window.testTelegramBot = testTelegramBot;