/**
 * Telegram Notifications for Psychology Experiment
 * Sends notifications when participants complete experiments
 */

class TelegramNotifications {
    constructor() {
        this.supabase = null;
        this.enabled = true;
    }
    
    // Initialize with Supabase client
    init(supabaseClient) {
        this.supabase = supabaseClient;
    }
    
    // Send notification to a single chat ID
    async sendMessageToChat(chatId, message) {
        try {
            const response = await fetch(`${TELEGRAM_CONFIG.API_URL}/sendMessage`, {
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
                return true;
            } else {
                console.error(`❌ Failed to send to ${chatId}:`, result.description);
                return false;
            }
        } catch (error) {
            console.error(`❌ Network error sending to ${chatId}:`, error);
            return false;
        }
    }
    
    // Format notification message
    formatNotificationMessage(participantData) {
        const {
            participant_id,
            email,
            session,
            completion_date,
            completion_time,
            session_id
        } = participantData;
        
        return `🔬 Experiment Completed

👤 Participant: ${participant_id}
📧 Email: ${email}
📋 Session: ${session}
📅 Date: ${completion_date}
⏰ Time: ${completion_time}
🆔 Session ID: ${session_id}
✅ Status: completed

🔗 View Dashboard: https://nus-cts-lab.github.io/free-viewing-remote/admin-login.html`;
    }
    
    // Get all active subscribers from database
    async getActiveSubscribers() {
        try {
            if (!this.supabase) {
                console.error('Supabase client not initialized');
                return [];
            }
            
            const { data, error } = await this.supabase
                .from('telegram_subscribers')
                .select('chat_id, name')
                .eq('active', true);
            
            if (error) {
                console.error('Error fetching subscribers:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('Error getting subscribers:', error);
            return [];
        }
    }
    
    // Main function to send notifications to all subscribers
    async sendExperimentNotification(participantData) {
        if (!this.enabled) {
            console.log('Telegram notifications are disabled');
            return { success: true, message: 'Notifications disabled' };
        }
        
        try {
            // Format the message
            const message = this.formatNotificationMessage(participantData);
            
            // Get all active subscribers
            const subscribers = await this.getActiveSubscribers();
            
            if (subscribers.length === 0) {
                console.log('No active Telegram subscribers found');
                return { success: true, message: 'No subscribers' };
            }
            
            console.log(`Sending notifications to ${subscribers.length} subscribers...`);
            
            // Send to each subscriber
            const results = await Promise.allSettled(
                subscribers.map(subscriber => 
                    this.sendMessageToChat(subscriber.chat_id, message)
                )
            );
            
            // Count successes and failures
            const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
            const failed = results.length - successful;
            
            console.log(`Telegram notifications: ${successful} sent, ${failed} failed`);
            
            return {
                success: true,
                sent: successful,
                failed: failed,
                total: subscribers.length
            };
            
        } catch (error) {
            console.error('Error sending Telegram notifications:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Toggle notifications on/off
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`Telegram notifications ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Test function - send test message to all subscribers
    async sendTestNotification() {
        const testData = {
            participant_id: 'TEST_001',
            email: 'test@example.com',
            session: '001',
            completion_date: new Date().toLocaleDateString(),
            completion_time: new Date().toLocaleTimeString(),
            session_id: 'EXP_TEST_' + Date.now()
        };
        
        return await this.sendExperimentNotification(testData);
    }
}

// Create global instance
const telegramNotifications = new TelegramNotifications();

// Make available globally
window.telegramNotifications = telegramNotifications;