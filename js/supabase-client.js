/**
 * Supabase Client Configuration
 * Loads credentials from config/secrets.js
 */

// Get Supabase configuration from secrets
function getSupabaseConfig() {
    if (typeof window.SECRETS === 'undefined') {
        console.error('❌ Secrets not loaded! Please create config/secrets.js from config/secrets-template.js');
        throw new Error('Missing configuration: config/secrets.js not found. See OPEN-SETUP.md for instructions.');
    }
    
    const url = window.SECRETS.SUPABASE_URL;
    const key = window.SECRETS.SUPABASE_ANON_KEY;
    
    if (!url || url === 'YOUR_SUPABASE_PROJECT_URL_HERE') {
        console.error('❌ Supabase URL not configured in config/secrets.js');
        throw new Error('Missing Supabase URL in config/secrets.js. See OPEN-SETUP.md for setup instructions.');
    }
    
    if (!key || key === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        console.error('❌ Supabase anon key not configured in config/secrets.js');
        throw new Error('Missing Supabase anon key in config/secrets.js. See OPEN-SETUP.md for setup instructions.');
    }
    
    return { url, key };
}

// Create Supabase client
function createSupabaseClient() {
    if (typeof supabase === 'undefined') {
        throw new Error('Supabase library not loaded. Make sure to include the Supabase script tag.');
    }
    
    const config = getSupabaseConfig();
    return supabase.createClient(config.url, config.key);
}

// Test connection function
async function testSupabaseConnection() {
    try {
        const client = createSupabaseClient();
        
        // Test database connection
        const { data, error } = await client
            .from('experiment_sessions')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
    }
}

// Make functions globally available
window.createSupabaseClient = createSupabaseClient;
window.testSupabaseConnection = testSupabaseConnection;