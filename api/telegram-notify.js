/**
 * Vercel API Route: Telegram Notifications
 * Handles server-side Telegram bot API calls to keep bot token secure
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed. Use POST.' 
        });
    }

    try {
        const { chatId, message } = req.body;

        // Validate required fields
        if (!chatId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: chatId and message'
            });
        }

        // Get bot token from environment variable (server-side only)
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN environment variable not set');
            return res.status(500).json({
                success: false,
                error: 'Telegram bot not configured'
            });
        }

        // Make request to Telegram Bot API
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                disable_web_page_preview: true
            })
        });

        const result = await response.json();

        if (result.ok) {
            console.log(`✅ Telegram notification sent to ${chatId}`);
            return res.status(200).json({
                success: true,
                message: 'Notification sent successfully'
            });
        } else {
            console.error(`❌ Telegram API error:`, result.description);
            return res.status(400).json({
                success: false,
                error: result.description || 'Telegram API error'
            });
        }

    } catch (error) {
        console.error('❌ Telegram notification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}