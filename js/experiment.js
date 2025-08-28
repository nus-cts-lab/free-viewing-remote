/**
 * ExperimentController - Main controller for the Images Free Viewing experiment
 * Single-round experiment with randomized trial order from stimuli-config.json
 */

class ExperimentController {
    constructor() {
        this.currentState = 'welcome';
        
        // Single-Round System State
        this.totalTrials = 20; // Will be set from config
        this.currentTrial = 0;
        
        // Timing
        this.experimentStartTime = null;
        
        // Initialize components
        this.mouseView = null;
        this.imageManager = null;
        this.dataManager = null;
        
        // Experiment settings (will be loaded from config)
        this.settings = {
            imageViewingTime: 10000, // Will be set from config
            enableMouseTracking: true,
            enablePractice: false,  // No practice rounds
            showTimer: false, // Hide timer during main trials
            apertureSize: '20%' // Aperture size for mouse spotlight
        };
        
        // State tracking
        this.experimentStarted = false;
        this.isExperimentRunning = false;
        this.currentTrialData = null;
        this.currentMouseData = [];
        
        console.log('ExperimentController initialized for single-round experiment');
    }
    
    async init() {
        try {
            // Initialize components
            this.initializeComponents();
            
            // Set up event listeners
            this.bindEvents();
            
            // Initialize first screen - Start with participant details
            this.showScreen('participant');
            
            console.log('Experiment controller ready');
        } catch (error) {
            console.error('Failed to initialize experiment:', error);
            this.showError('Failed to initialize experiment. Please refresh the page.');
        }
    }
    
    initializeComponents() {
        // Initialize managers (removed practice manager)
        console.log('🔄 Creating ImageManager instance...');
        this.imageManager = new ImageManager();
        console.log('✅ ImageManager created:', this.imageManager);
        
        this.dataManager = new DataManager();
        
        // Initialize dynamic positioning system
        console.log('🚀 Calling initializeDynamicPositioning...');
        this.imageManager.initializeDynamicPositioning();
        
        // Expose imageManager globally for testing
        window.imageManager = this.imageManager;
        
        console.log('All components initialized - MouseView.js will be activated during trials');
        console.log('Single-Round System: Practice disabled, direct to experiment');
        console.log('Dynamic positioning system activated for responsive image layout');
    }
    
    bindEvents() {
        // Welcome screen events
        const startBtn = document.getElementById('start-experiment');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.handleStartExperiment());
        }
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Participant form events
        const participantForm = document.getElementById('participant-form');
        if (participantForm) {
            participantForm.addEventListener('submit', (e) => this.handleParticipantForm(e));
        }
        
        
        // Continue trial button
        const continueTrialBtn = document.getElementById('continue-trial');
        if (continueTrialBtn) {
            continueTrialBtn.addEventListener('click', () => this.continueToNextTrial());
        }
        
        // Download buttons
        const downloadTrialBtn = document.getElementById('download-trial-data');
        const downloadMouseBtn = document.getElementById('download-mouse-data');
        const downloadParticipantBtn = document.getElementById('download-participant-info');
        const downloadTrialHeatmapsBtn = document.getElementById('download-trial-heatmaps');
        if (downloadTrialBtn) {
            downloadTrialBtn.addEventListener('click', () => this.dataManager.exportTrialData());
        }
        if (downloadMouseBtn) {
            downloadMouseBtn.addEventListener('click', () => this.dataManager.exportMouseData());
        }
        if (downloadParticipantBtn) {
            downloadParticipantBtn.addEventListener('click', () => this.dataManager.exportParticipantInfo());
        }
        if (downloadTrialHeatmapsBtn) {
            downloadTrialHeatmapsBtn.addEventListener('click', () => this.generateTrialHeatmaps());
        }
        
        
        console.log('Event listeners bound');
    }
    
    async handleStartExperiment() {
        // Start loading images after participant has seen instructions
        await this.loadImages();
    }
    
    async handleParticipantForm(event) {
        event.preventDefault();
        
        const participantId = document.getElementById('participant-id').value;
        const participantEmail = document.getElementById('participant-email').value;
        const session = document.getElementById('session').value;
        
        if (!participantId.trim()) {
            alert('Please enter a participant ID');
            return;
        }
        
        if (!participantEmail.trim()) {
            alert('Please enter an email address');
            return;
        }
        
        // Set participant data
        this.dataManager.setParticipantInfo(participantId, session, participantEmail);
        
        // Show welcome screen after collecting participant info
        this.showScreen('welcome');
    }
    
    async loadImages() {
        this.showScreen('loading');
        this.updateLoadingMessage('Loading experiment configuration...');
        
        try {
            // Load configuration from stimuli-config.json
            const configLoaded = await this.imageManager.loadConfigFromStimuli();
            if (!configLoaded) {
                throw new Error('Failed to load experiment configuration');
            }
            
            // Update settings from config
            if (this.imageManager.config) {
                this.settings.imageViewingTime = this.imageManager.config.imageViewingTime || 10000;
                this.totalTrials = this.imageManager.getTotalTrials();
            }
            
            console.log('Single-round experiment settings:');
            console.log('- Image viewing time:', this.settings.imageViewingTime, 'ms');
            console.log('- Total trials:', this.totalTrials);
            
            // Preload images
            this.updateLoadingMessage('Loading images...');
            const imagesLoaded = await this.imageManager.preloadAllImages(
                (loaded, total, imagePath) => {
                    this.updateLoadingMessage(`Loading images... ${loaded}/${total}`);
                }
            );
            
            if (!imagesLoaded) {
                throw new Error('Failed to load all images');
            }
            
            // Wait for loading screen to fully disappear before starting
            this.updateLoadingMessage('Ready!');
            await this.delay(500); // Give loading screen time to show "Ready!" 
            
            // Start single-round experiment
            console.log('Config loaded, starting experiment...');
            await this.startExperiment();
            
        } catch (error) {
            console.error('Error during loading:', error);
            this.showError('Failed to load experiment data. Please check the image files and try again.');
        }
    }
    
    updateLoadingMessage(message) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }
    
    
    
    async showMainStartButton() {
        const mainStartButton = document.getElementById('main-start-button');
        const imageContainer = document.getElementById('image-container');
        
        // Hide images
        this.imageManager.hideImages(imageContainer);
        
        // Disable MouseView during button display
        try {
            if (typeof mouseview !== 'undefined' && mouseview.removeAll) {
                mouseview.removeAll();
            }
        } catch (error) {
            console.log('MouseView removeAll skipped during main start button');
        }
        
        // Show main start button and wait for click
        if (mainStartButton) {
            mainStartButton.style.display = 'block';
            
            return new Promise((resolve) => {
                const startButton = mainStartButton.querySelector('.start-button');
                
                const handleClick = () => {
                    mainStartButton.style.display = 'none';
                    startButton.removeEventListener('click', handleClick);
                    resolve();
                };
                
                startButton.addEventListener('click', handleClick);
            });
        }
    }

    async showNextTrialButton() {
        const nextTrialButton = document.getElementById('next-trial-button');
        const imageContainer = document.getElementById('image-container');
        
        // Hide images
        this.imageManager.hideImages(imageContainer);
        
        // Disable MouseView during button display
        try {
            if (typeof mouseview !== 'undefined' && mouseview.removeAll) {
                mouseview.removeAll();
            }
        } catch (error) {
            console.log('MouseView removeAll skipped during next trial button');
        }
        
        // Show next trial button and wait for click
        if (nextTrialButton) {
            nextTrialButton.style.display = 'block';
            
            return new Promise((resolve) => {
                const nextButton = nextTrialButton.querySelector('.next-button');
                
                const handleClick = () => {
                    nextTrialButton.style.display = 'none';
                    nextButton.removeEventListener('click', handleClick);
                    resolve();
                };
                
                nextButton.addEventListener('click', handleClick);
            });
        }
    }

    
    
    async waitForUserProgression() {
        const continueBtn = document.getElementById('continue-trial');
        
        return new Promise((resolve) => {
            // Show continue button
            continueBtn.style.display = 'block';
            
            const handleContinue = () => {
                continueBtn.style.display = 'none';
                continueBtn.removeEventListener('click', handleContinue);
                resolve();
            };
            
            const handleKeyPress = (e) => {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    continueBtn.style.display = 'none';
                    document.removeEventListener('keydown', handleKeyPress);
                    resolve();
                }
            };
            
            continueBtn.addEventListener('click', handleContinue);
            document.addEventListener('keydown', handleKeyPress);
        });
    }
    
    continueToNextTrial() {
        const continueBtn = document.getElementById('continue-trial');
        continueBtn.style.display = 'none';
        
        // This will be handled by the promise in waitForUserProgression
    }
    
    
    async finishExperiment() {
        console.log('=== Experiment Complete ===');
        
        this.isExperimentRunning = false;
        
        // Clean up any running timers
        this.hideTrialCountdown();
        
        // Deactivate mouse tracking
        try {
            if (typeof mouseview !== 'undefined' && mouseview.removeAll) {
                mouseview.removeAll();
            }
        } catch (error) {
            console.log('MouseView cleanup completed with minor error:', error.message);
        }
        
        // Calculate total experiment time
        const totalTime = this.currentTrial > 0 ? 
            (performance.now() - this.dataManager.experimentStartTime) / 1000 : 0;
        
        console.log('Single-round experiment completed successfully!');
        console.log('Final stats:');
        console.log(`- Total trials: ${this.currentTrial + 1}`);
        console.log(`- Total time: ${this.formatTime(totalTime)}`);
        console.log(`- Data summary:`, this.dataManager.getSummaryStats?.() || 'N/A');
        
        // Upload data to Supabase
        await this.uploadExperimentData();
    }

    async uploadExperimentData() {
        // Show upload screen
        this.showScreen('upload');
        this.updateUploadStatus('Preparing your experiment data...');
        
        try {
            // Test Supabase connection first
            const supabase = createSupabaseClient();
            
            // 1. Create session record in database
            this.updateUploadStatus('Creating session record...');
            this.updateUploadProgress(1, 4);
            
            // Determine if this is a partial or complete session
            const totalTrialsExpected = this.totalTrials || 20;
            const trialsCompleted = this.currentTrial + 1;
            const isPartialSession = trialsCompleted < totalTrialsExpected;
            
            // Generate custom session ID: EXP_YYYYMMDD_p123_s001
            const today = new Date();
            const dateStr = today.getFullYear().toString() + 
                          (today.getMonth() + 1).toString().padStart(2, '0') + 
                          today.getDate().toString().padStart(2, '0');
            const customSessionId = `EXP_${dateStr}_p${this.dataManager.participantData.participant_id}_s${this.dataManager.participantData.session}`;
            
            const sessionData = {
                id: customSessionId, // Use custom ID instead of auto-generated UUID
                participant_id: this.dataManager.participantData.participant_id,
                participant_email: this.dataManager.participantData.email,
                session: this.dataManager.participantData.session,
                completed_at: new Date().toISOString(),
                experiment_metadata: {
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    user_agent: navigator.userAgent,
                    total_trials: trialsCompleted,
                    expected_trials: totalTrialsExpected,
                    experiment_duration_seconds: Math.round((performance.now() - this.dataManager.experimentStartTime) / 1000),
                    screen_resolution: this.dataManager.participantData.screen_resolution,
                    device_pixel_ratio: this.dataManager.participantData.device_pixel_ratio,
                    is_partial: isPartialSession
                },
                status: isPartialSession ? 'partial' : 'completed'
            };
            
            const { data: session, error: sessionError } = await supabase
                .from('experiment_sessions')
                .insert(sessionData)
                .select()
                .single();
            
            if (sessionError) {
                throw new Error(`Failed to create session: ${sessionError.message}`);
            }
            
            console.log('Session created:', session.id);
            
            // 2. Generate CSV files
            this.updateUploadStatus('Generating data files...');
            this.updateUploadProgress(2, 4);
            
            const trialCSVBlob = this.dataManager.generateTrialCSVBlob();
            const mouseCSVBlob = this.dataManager.generateMouseCSVBlob();
            const participantCSVBlob = this.dataManager.generateParticipantCSVBlob();
            
            // 3. Generate heatmap ZIP
            this.updateUploadStatus('Generating heatmaps...');
            const heatmapBlob = await this.dataManager.generateAllTrialHeatmapsAsBlob(
                (current, total, message) => {
                    this.updateUploadStatus(`Generating heatmaps... (${current}/${total})`);
                }
            );
            
            // 4. Upload all files to Supabase Storage
            this.updateUploadStatus('Uploading files to secure storage...');
            this.updateUploadProgress(3, 4);
            
            const sessionFolder = `sessions/${session.id}`;
            
            // Upload all files in parallel
            const uploadPromises = [
                supabase.storage
                    .from('experiment-files')
                    .upload(`${sessionFolder}/trial_data.csv`, trialCSVBlob, {
                        contentType: 'text/csv'
                    }),
                supabase.storage
                    .from('experiment-files')
                    .upload(`${sessionFolder}/mouse_data.csv`, mouseCSVBlob, {
                        contentType: 'text/csv'
                    }),
                supabase.storage
                    .from('experiment-files')
                    .upload(`${sessionFolder}/participant_info.csv`, participantCSVBlob, {
                        contentType: 'text/csv'
                    }),
                supabase.storage
                    .from('experiment-files')
                    .upload(`${sessionFolder}/heatmaps.zip`, heatmapBlob, {
                        contentType: 'application/zip'
                    })
            ];
            
            const uploadResults = await Promise.all(uploadPromises);
            
            // Check for upload errors
            const uploadErrors = uploadResults.filter(result => result.error);
            if (uploadErrors.length > 0) {
                throw new Error(`File upload failed: ${uploadErrors.map(e => e.error.message).join(', ')}`);
            }
            
            // 5. Send Telegram notifications
            this.updateUploadStatus('Sending notifications...');
            await this.sendTelegramNotification(customSessionId, sessionData);
            
            // 6. Complete upload
            this.updateUploadStatus('✅ Upload complete!');
            this.updateUploadProgress(4, 4);
            
            console.log('All files uploaded successfully to:', sessionFolder);
            
            // Show success screen after a brief delay
            setTimeout(() => {
                this.showScreen('upload-success');
            }, 1500);
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.updateUploadStatus(`❌ Upload failed: ${error.message}`);
            
            // Show fallback to manual download after error
            setTimeout(() => {
                alert('Automatic upload failed. You will be redirected to manual download options.');
                this.showScreen('end');
            }, 3000);
        }
    }

    async sendTelegramNotification(sessionId, sessionData) {
        try {
            // Check if Telegram notifications are available
            if (typeof telegramNotifications === 'undefined') {
                console.log('Telegram notifications not available');
                return;
            }
            
            // Initialize Telegram notifications with Supabase client
            const supabase = createSupabaseClient();
            telegramNotifications.init(supabase);
            
            // Prepare notification data
            const notificationData = {
                participant_id: sessionData.participant_id,
                email: sessionData.participant_email,
                session: sessionData.session,
                completion_date: new Date().toLocaleDateString(),
                completion_time: new Date().toLocaleTimeString(),
                session_id: sessionId
            };
            
            // Send notification
            const result = await telegramNotifications.sendExperimentNotification(notificationData);
            
            if (result.success) {
                console.log('Telegram notification sent successfully:', result);
            } else {
                console.warn('Telegram notification failed:', result.error);
            }
            
        } catch (error) {
            console.error('Error sending Telegram notification:', error);
            // Don't throw - notifications failing shouldn't break the experiment
        }
    }

    updateUploadStatus(message) {
        const statusElement = document.getElementById('upload-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Upload status:', message);
    }

    updateUploadProgress(current, total) {
        const progressBar = document.getElementById('upload-progress-bar');
        const progressText = document.getElementById('upload-progress-text');
        
        if (progressBar) {
            const percentage = (current / total) * 100;
            progressBar.style.width = percentage + '%';
        }
        
        if (progressText) {
            progressText.textContent = `${current}/${total} files`;
        }
    }
    
    
    handleKeyPress(event) {
        switch (event.code) {
            case 'Space':
                if (this.currentState === 'welcome') {
                    event.preventDefault();
                    this.handleStartExperiment();
                } else if (this.currentState === 'experiment') {
                    // Handle space bar for trial progression
                    const continueBtn = document.getElementById('continue-trial');
                    if (continueBtn.style.display === 'block') {
                        event.preventDefault();
                        this.continueToNextTrial();
                    }
                }
                break;
                
            case 'Escape':
                if (this.isExperimentRunning) {
                    if (confirm('Are you sure you want to exit the experiment?')) {
                        this.emergencyExit();
                    }
                }
                break;
                
        }
    }
    
    async emergencyExit() {
        this.isExperimentRunning = false;
        try {
            if (typeof mouseview !== 'undefined' && mouseview.removeAll) {
                mouseview.removeAll();
            }
        } catch (error) {
            console.log('MouseView removeAll skipped during emergency exit (error):', error.message);
        }
        
        // Clean up any running timers
        this.hideTrialCountdown();
        
        // Try to upload partial data if we have any trials
        if (this.dataManager.getTrialData().length > 0) {
            console.log('Emergency exit - attempting to upload partial data...');
            try {
                await this.uploadExperimentData();
                console.log('Emergency exit - partial data uploaded successfully');
                return; // uploadExperimentData() handles the screen transition
            } catch (error) {
                console.error('Emergency exit upload failed:', error);
                // Fallback to manual downloads
                this.dataManager.exportAllData();
            }
        }
        
        this.showScreen('end');
        console.log('Emergency exit - showing manual download options');
    }
    
    
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Deactivate MouseView for all screens except during actual trials
        // MouseView should only be active during 'experiment' screen trials
        if (screenName !== 'experiment') {
            try {
                if (typeof mouseview !== 'undefined' && mouseview.removeAll) {
                    mouseview.removeAll();
                }
            } catch (error) {
                // Ignore errors when nothing to remove during initialization
                console.log('MouseView removeAll skipped (nothing to remove)');
            }
        }
        
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentState = screenName;
        }
        
        console.log(`Showing screen: ${screenName}`);
    }
    
    showError(message) {
        alert(message); // Simple error display - could be enhanced with a modal
        console.error('Experiment error:', message);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showTrialCountdown() {
        // Create countdown element for main trials
        let countdown = document.getElementById('trial-countdown');
        if (!countdown) {
            countdown = document.createElement('div');
            countdown.id = 'trial-countdown';
            countdown.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 1.2em;
                z-index: 200;
                font-weight: bold;
                opacity: 1;
                pointer-events: none;
            `;
            document.getElementById('experiment-screen').appendChild(countdown);
        }
        
        // Start countdown
        let timeLeft = this.settings.imageViewingTime / 1000;
        countdown.textContent = `Time: ${timeLeft}s`;
        countdown.style.display = 'block';
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            countdown.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Store interval ID for cleanup
        this.countdownInterval = countdownInterval;
    }
    
    hideTrialCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        const countdown = document.getElementById('trial-countdown');
        if (countdown) {
            countdown.style.display = 'none';
        }
    }
    
    // Public API methods for external control
    
    getCurrentState() {
        return this.currentState;
    }
    
    getCurrentTrial() {
        return this.currentTrial;
    }
    
    isRunning() {
        return this.isExperimentRunning;
    }
    
    getDataManager() {
        return this.dataManager;
    }
    
    getMouseView() {
        return this.mouseView;
    }
    
    getImageManager() {
        return this.imageManager;
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        console.log('Settings updated:', this.settings);
    }

    // Configure MouseView ONLY for image viewing trials
    async configureMouseView() {
        console.log('=== MAIN CONFIGURE MOUSEVIEW CALLED ===');
        try {
            console.log('MouseView available?', typeof mouseview !== 'undefined');
            if (typeof mouseview !== 'undefined') {
                console.log('MouseView object before config:', mouseview);
                console.log('Current params before config:', mouseview.params);
                
                console.log(`Setting aperture to ${this.settings.apertureSize}...`);
                mouseview.params.apertureSize = this.settings.apertureSize; // Configurable spotlight size
                mouseview.params.overlayAlpha = 0.85; // Consistent opacity for all trials
                mouseview.params.overlayColour = 'black'; // Consistent color for all trials
                mouseview.params.apertureGauss = 15; // Consistent edge smoothing for all trials
                
                console.log('Params after setting:', mouseview.params);
                console.log('Calling mouseview.init()...');
                mouseview.init();
                console.log('Params after init():', mouseview.params);
                
                // Wait for MouseView overlay to be ready before continuing
                await this.waitForMouseViewReady();
                
                console.log('MouseView configured and ready for trial');
                
                console.log('=== MAIN TRIAL MOUSEVIEW DEBUG ===');
                console.log('Main trial aperture size:', mouseview.params.apertureSize);
                console.log('Main trial overlay alpha:', mouseview.params.overlayAlpha);
                console.log('=== END MAIN TRIAL DEBUG ===');
            } else {
                console.error('MouseView is undefined in main trial!');
            }
        } catch (error) {
            console.error('Error configuring MouseView:', error);
            console.error('Error stack:', error.stack);
        }
        console.log('=== END MAIN CONFIGURE MOUSEVIEW ===');
    }

    // Wait for MouseView overlay to be ready and visible
    async waitForMouseViewReady() {
        return new Promise((resolve) => {
            const checkOverlay = () => {
                const overlay = document.querySelector('#mouseview-overlay') || 
                               document.querySelector('.mouseview-overlay');
                
                console.log('Checking MouseView overlay readiness...');
                
                if (overlay) {
                    console.log('Overlay found:', overlay);
                    console.log('Overlay style:', overlay.style.cssText);
                    console.log('Overlay opacity:', overlay.style.opacity);
                    
                    // Consider overlay ready if it exists and has been initialized
                    resolve();
                } else {
                    console.log('Overlay not ready, checking again in 50ms...');
                    setTimeout(checkOverlay, 50);
                }
            };
            checkOverlay();
        });
    }


    async generateTrialHeatmaps() {
        console.log('Starting trial heatmap generation...');
        
        // Debug: Check total trials before generation
        const totalDataTrials = this.dataManager.getTrialData().length;
        console.log(`=== HEATMAP GENERATION DEBUG ===`);
        console.log('Total trials in data manager:', totalDataTrials);
        console.log('Current trial reached:', this.currentTrial + 1);
        console.log('Expected total (should be 20):', this.totalTrials);
        console.log('=== END HEATMAP GENERATION DEBUG ===');
        
        // Show progress UI
        const progressDiv = document.getElementById('heatmap-progress');
        const progressText = document.getElementById('heatmap-progress-text');
        const progressBar = document.getElementById('heatmap-progress-bar');
        const downloadBtn = document.getElementById('download-trial-heatmaps');
        
        if (progressDiv && downloadBtn) {
            progressDiv.style.display = 'block';
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Generating...';
        }
        
        try {
            const result = await this.dataManager.generateAllTrialHeatmaps(
                (current, total, message) => {
                    // Update progress
                    const percent = Math.round((current / total) * 100);
                    if (progressText) {
                        progressText.textContent = message || `Generating heatmap ${current} of ${total}...`;
                    }
                    if (progressBar) {
                        progressBar.style.width = `${percent}%`;
                    }
                }
            );
            
            // Show completion message
            if (progressText) {
                progressText.textContent = `✓ Generated ${result.success} heatmaps successfully!`;
            }
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            
            console.log('Trial heatmap generation completed:', result);
            
            // Hide progress after delay
            setTimeout(() => {
                if (progressDiv) {
                    progressDiv.style.display = 'none';
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error generating trial heatmaps:', error);
            
            if (progressText) {
                progressText.textContent = '✗ Error generating heatmaps. Check console for details.';
            }
            
            // Hide progress after delay
            setTimeout(() => {
                if (progressDiv) {
                    progressDiv.style.display = 'none';
                }
            }, 5000);
        } finally {
            // Re-enable button
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.textContent = 'Download Trial Heatmaps (ZIP)';
            }
        }
    }

    // ====== SINGLE-ROUND SYSTEM METHODS ======

    async startExperiment() {
        console.log(`=== Starting Single-Round Experiment ===`);
        
        this.currentTrial = 0;
        this.experimentStartTime = performance.now();
        
        // Initialize experiment data collection
        this.experimentStarted = true;
        this.isExperimentRunning = true;
        this.dataManager.startExperiment();
        
        // Show experiment screen
        this.showScreen('experiment');
        
        // Configure MouseView for trials
        await this.configureMouseView();
        
        console.log(`Experiment setup complete, starting ${this.totalTrials} trials...`);
        await this.runAllTrials();
    }

    logTrialProgress() {
        console.log(`Trial ${this.currentTrial + 1}/${this.totalTrials}`);
    }

    async runAllTrials() {
        console.log(`Running ${this.totalTrials} trials...`);
        
        // Run all trials in sequence
        for (let i = 0; i < this.totalTrials; i++) {
            if (!this.isExperimentRunning) {
                console.log('Experiment stopped, breaking trial loop');
                break;
            }
            
            this.currentTrial = i;
            
            const trialType = this.imageManager.getTrialType(i);
            console.log(`Trial ${i + 1}/${this.totalTrials}: ${trialType}`);
            
            try {
                await this.runSingleTrial(i, trialType);
            } catch (error) {
                console.error(`Error in Trial ${i + 1}:`, error);
                // Continue with next trial
            }
            
            // Log progress
            this.logTrialProgress();
            
            // Brief inter-trial interval
            await this.delay(250);
        }
        
        console.log(`All ${this.totalTrials} trials completed`);
        await this.finishExperiment();
    }

    async runSingleTrial(trialIndex, trialType) {
        console.log(`=== Single Trial: ${trialType} (Trial ${trialIndex + 1}/${this.totalTrials}) ===`);
        
        // Show start/next button
        if (trialIndex === 0) {
            await this.showMainStartButton();
        } else {
            await this.showNextTrialButton();
        }
        
        // Start trial data collection
        const trialInfo = this.dataManager.startTrial(trialIndex, trialType);
        
        // Log trial start event
        try {
            if (typeof mouseview !== 'undefined') {
                mouseview.logEvent(`trial_start_T${trialIndex + 1}_${trialType}`);
            }
        } catch (error) {
            console.log('Event logging not available:', error);
        }
        
        // Get images for this trial from predefined config
        let imageData;
        try {
            imageData = this.imageManager.getTrialData(trialIndex);
            console.log(`Got trial data for ${trialType} trial:`, imageData);
        } catch (error) {
            console.error('Error getting trial data:', error);
            throw error; // Don't continue trial if trial data fails
        }
        
        // Configure MouseView and start tracking
        try {
            this.configureMouseView();
            if (typeof mouseview !== 'undefined') {
                mouseview.startTracking();
            }
        } catch (error) {
            console.error('Error starting mouse tracking:', error);
        }
        
        // Display images
        const imageContainer = document.getElementById('image-container');
        try {
            this.imageManager.displayImages(imageData, imageContainer);
            
            // Log images displayed event with image categories
            if (typeof mouseview !== 'undefined') {
                const imageList = trialType === 'image' 
                    ? `${imageData.dysphoric},${imageData.threat},${imageData.positive},${imageData.neutral}`
                    : `${imageData.filler1},${imageData.filler2},${imageData.filler3},${imageData.filler4}`;
                mouseview.logEvent(`images_displayed_${imageList}`);
            }
        } catch (error) {
            console.error('Error displaying images:', error);
        }
        
        // Show countdown and wait for viewing time
        if (this.settings.imageViewingTime > 0) {
            if (this.settings.showTimer) {
                this.showTrialCountdown();
            }
            await this.delay(this.settings.imageViewingTime);
            this.hideTrialCountdown();
        }
        
        // Log trial end event before stopping tracking
        try {
            if (typeof mouseview !== 'undefined') {
                mouseview.logEvent(`trial_end_T${trialIndex + 1}`);
            }
        } catch (error) {
            console.log('Event logging not available:', error);
        }
        
        // Stop tracking and collect current session mouse data
        let mouseData = [];
        try {
            if (typeof mouseview !== 'undefined') {
                mouseview.stopTracking();
                // Access current session data directly (not stored localStorage data)
                mouseData = mouseview.datalogger?.data || [];
                if (mouseview.datalogger) {
                    mouseview.datalogger.data = []; // Clear for next trial
                }
            }
        } catch (error) {
            console.error('Error collecting mouse data:', error);
        }
        
        // Record trial data BEFORE hiding images (so image bounds are still available)
        this.dataManager.recordTrialData(trialInfo, imageData, mouseData);
        this.dataManager.recordMouseData(mouseData, trialIndex, trialType);
        
        // Hide images AFTER recording data
        this.imageManager.hideImages(imageContainer);
        
        console.log(`Trial ${trialIndex + 1} completed`);
    }

    // This method is now part of finishExperiment()

    // Round-related methods removed - single round experiment

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getExperimentElapsedTime() {
        if (!this.experimentStartTime) return 0;
        return (performance.now() - this.experimentStartTime) / 1000;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperimentController;
} else if (typeof window !== 'undefined') {
    window.ExperimentController = ExperimentController;
}