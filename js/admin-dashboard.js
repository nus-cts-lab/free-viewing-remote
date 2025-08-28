/**
 * Admin Dashboard for Psychology Experiment
 * Handles session data display, filtering, download, and deletion
 */

class AdminDashboard {
    constructor() {
        this.supabase = null;
        this.sessions = [];
        this.filteredSessions = [];
        this.currentFilter = '';
        
        this.init();
    }
    
    async init() {
        // Check authentication
        if (!this.checkAuth()) {
            return;
        }
        
        // Initialize Supabase client
        try {
            this.supabase = createSupabaseClient();
            console.log('Admin dashboard initialized');
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            alert('Failed to connect to database. Please refresh the page.');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadSessions();
    }
    
    checkAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const loginTime = localStorage.getItem('adminLoginTime');
        
        if (!isLoggedIn) {
            window.location.href = 'admin-login.html';
            return false;
        }
        
        // Optional: Check if login expired (24 hours)
        if (loginTime) {
            const now = Date.now();
            const loginAge = now - parseInt(loginTime);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (loginAge > maxAge) {
                this.logout();
                return false;
            }
        }
        
        return true;
    }
    
    setupEventListeners() {
        // Session filter
        const sessionFilter = document.getElementById('session-filter');
        sessionFilter.addEventListener('input', (e) => {
            this.currentFilter = e.target.value.trim();
            this.applyFilter();
        });
        
        // Enter key for filter
        sessionFilter.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilter();
            }
        });
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => this.logout());
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', () => this.loadSessions());
    }
    
    async loadSessions() {
        this.showLoading('Loading session data...');
        
        try {
            const { data, error } = await this.supabase
                .from('experiment_sessions')
                .select('*')
                .order('completed_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            this.sessions = data || [];
            this.filteredSessions = [...this.sessions];
            
            console.log(`Loaded ${this.sessions.length} sessions`);
            
            this.hideLoading();
            this.renderSessions();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading sessions:', error);
            this.hideLoading();
            alert('Failed to load session data. Please try refreshing the page.');
        }
    }
    
    applyFilter() {
        if (!this.currentFilter) {
            this.filteredSessions = [...this.sessions];
        } else {
            this.filteredSessions = this.sessions.filter(session => 
                session.session && session.session.toString().includes(this.currentFilter)
            );
        }
        
        this.renderSessions();
        this.updateStats();
    }
    
    renderSessions() {
        const tbody = document.getElementById('sessions-tbody');
        const emptyState = document.getElementById('empty-state');
        const tableContainer = document.querySelector('.sessions-table-container');
        
        if (this.filteredSessions.length === 0) {
            tbody.innerHTML = '';
            tableContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        tableContainer.style.display = 'block';
        emptyState.style.display = 'none';
        
        tbody.innerHTML = this.filteredSessions.map(session => `
            <tr data-session-id="${session.id}">
                <td>${session.participant_id}</td>
                <td>${session.session}</td>
                <td>
                    <span class="status-badge status-${session.status}">
                        ${session.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button 
                            class="download-button" 
                            onclick="dashboard.downloadSession('${session.id}')"
                            title="Download all data files"
                        >
                            Download
                        </button>
                        <button 
                            class="delete-button" 
                            onclick="dashboard.deleteSession('${session.id}', '${session.participant_id}')"
                            title="Delete this session"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    updateStats() {
        const total = this.sessions.length;
        const filtered = this.filteredSessions.length;
        const completed = this.filteredSessions.filter(s => s.status === 'completed').length;
        const partial = this.filteredSessions.filter(s => s.status === 'partial').length;
        
        const statsHTML = `
            <strong>Total Sessions:</strong> ${total} | 
            <strong>Showing:</strong> ${filtered} | 
            <strong>Completed:</strong> ${completed} | 
            <strong>Partial:</strong> ${partial}
            ${this.currentFilter ? ` | <strong>Filter:</strong> "${this.currentFilter}"` : ''}
        `;
        
        document.getElementById('stats-summary').innerHTML = statsHTML;
    }
    
    async downloadSession(sessionId) {
        this.showLoading('Preparing download...');
        
        try {
            // Get all files for this session
            const sessionFolder = `sessions/${sessionId}`;
            
            const fileNames = [
                'trial_data.csv',
                'mouse_data.csv', 
                'participant_info.csv',
                'heatmaps.zip'
            ];
            
            this.showLoading('Downloading files...');
            
            // Download all files
            const filePromises = fileNames.map(async (fileName) => {
                const { data, error } = await this.supabase.storage
                    .from('experiment-files')
                    .download(`${sessionFolder}/${fileName}`);
                
                if (error) {
                    console.warn(`Failed to download ${fileName}:`, error);
                    return null;
                }
                
                return { name: fileName, data: data };
            });
            
            const files = await Promise.all(filePromises);
            const validFiles = files.filter(f => f !== null);
            
            if (validFiles.length === 0) {
                throw new Error('No files found for this session');
            }
            
            this.showLoading('Creating download package...');
            
            // Create ZIP package
            const zip = new JSZip();
            const zipFolderName = `${sessionId}_data`;
            
            validFiles.forEach(file => {
                zip.file(`${zipFolderName}/${file.name}`, file.data);
            });
            
            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
            
            // Trigger download
            const downloadUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${sessionId}_experiment_data.zip`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            
            this.hideLoading();
            console.log(`Downloaded data for session: ${sessionId}`);
            
        } catch (error) {
            console.error('Download failed:', error);
            this.hideLoading();
            alert(`Download failed: ${error.message}`);
        }
    }
    
    async deleteSession(sessionId, participantId) {
        const confirmMessage = `Are you sure you want to delete session "${sessionId}" for participant ${participantId}?\n\nThis will permanently delete:\n- Database record\n- All data files (CSV + heatmaps)\n\nThis action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        this.showLoading('Deleting session data...');
        
        try {
            // Step 1: Delete storage files
            this.showLoading('Deleting files...');
            const sessionFolder = `sessions/${sessionId}`;
            
            // List all files in the session folder
            const { data: files, error: listError } = await this.supabase.storage
                .from('experiment-files')
                .list(sessionFolder);
            
            if (listError && listError.statusCode !== '404') {
                console.warn('Error listing files for deletion:', listError);
            }
            
            if (files && files.length > 0) {
                // Delete all files in the folder
                const filePaths = files.map(file => `${sessionFolder}/${file.name}`);
                const { error: deleteError } = await this.supabase.storage
                    .from('experiment-files')
                    .remove(filePaths);
                
                if (deleteError) {
                    console.warn('Error deleting some files:', deleteError);
                }
            }
            
            // Step 2: Delete database record
            this.showLoading('Removing database record...');
            const { error: dbError } = await this.supabase
                .from('experiment_sessions')
                .delete()
                .eq('id', sessionId);
            
            if (dbError) {
                throw dbError;
            }
            
            // Step 3: Update UI
            this.sessions = this.sessions.filter(session => session.id !== sessionId);
            this.applyFilter();
            
            this.hideLoading();
            console.log(`Successfully deleted session: ${sessionId}`);
            
        } catch (error) {
            console.error('Delete failed:', error);
            this.hideLoading();
            alert(`Failed to delete session: ${error.message}`);
        }
    }
    
    showLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        overlay.style.display = 'flex';
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = 'none';
    }
    
    logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'index.html';
    }
}

// Initialize dashboard when page loads
let dashboard;

window.addEventListener('load', () => {
    dashboard = new AdminDashboard();
    window.dashboard = dashboard; // Make available for debugging
});