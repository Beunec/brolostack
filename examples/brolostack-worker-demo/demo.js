/**
 * Brolostack Worker Demo - Interactive Enterprise Demo
 * Showcases all worker capabilities with real-time updates
 */

class BrolostackWorkerDemo {
    constructor() {
        this.worker = null;
        this.selectedTemplate = null;
        this.metrics = {
            operationsPerSec: 0,
            avgLatency: 0,
            cacheHitRate: 0,
            errorRate: 0,
            throughput: 0
        };
        this.logs = [];
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadApplicationTemplates();
        this.startMetricsUpdater();
        this.log('INFO', 'Demo interface initialized. Select a template and initialize worker to begin.');
    }

    setupEventListeners() {
        // Worker Management
        document.getElementById('initWorker').addEventListener('click', () => this.initializeWorker());
        document.getElementById('shutdownWorker').addEventListener('click', () => this.shutdownWorker());
        document.getElementById('workerStatus').addEventListener('click', () => this.checkWorkerStatus());

        // AI Operations
        document.getElementById('testAI').addEventListener('click', () => this.testAIProviders());
        document.getElementById('generateText').addEventListener('click', () => this.generateText());
        document.getElementById('analyzeImage').addEventListener('click', () => this.analyzeImage());

        // Database Operations
        document.getElementById('createData').addEventListener('click', () => this.createData());
        document.getElementById('readData').addEventListener('click', () => this.readData());
        document.getElementById('updateData').addEventListener('click', () => this.updateData());
        document.getElementById('deleteData').addEventListener('click', () => this.deleteData());

        // Security Features
        document.getElementById('encryptData').addEventListener('click', () => this.encryptData());
        document.getElementById('decryptData').addEventListener('click', () => this.decryptData());
        document.getElementById('createBlock').addEventListener('click', () => this.createSecurityBlock());
        document.getElementById('verifyChain').addEventListener('click', () => this.verifyBlockchain());

        // Real-time Sync
        document.getElementById('startSync').addEventListener('click', () => this.startSync());
        document.getElementById('stopSync').addEventListener('click', () => this.stopSync());
        document.getElementById('forceSync').addEventListener('click', () => this.forceSync());

        // Performance Metrics
        document.getElementById('getMetrics').addEventListener('click', () => this.getMetrics());
        document.getElementById('resetMetrics').addEventListener('click', () => this.resetMetrics());

        // Log Management
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
        document.getElementById('exportLog').addEventListener('click', () => this.exportLog());
    }

    loadApplicationTemplates() {
        const templates = [
            {
                id: 'ecommerce',
                name: 'E-commerce Platform',
                description: 'Complete online shopping platform with inventory, orders, and payments',
                complexity: 'advanced'
            },
            {
                id: 'social-media',
                name: 'Social Media Platform',
                description: 'Real-time social networking with posts, messaging, and content sharing',
                complexity: 'expert'
            },
            {
                id: 'ai-coding-assistant',
                name: 'AI Coding Assistant',
                description: 'Intelligent code completion, review, and generation platform',
                complexity: 'expert'
            },
            {
                id: 'multi-agent-system',
                name: 'Multi-Agent AI System',
                description: 'Complex AI system with multiple agents and workflows',
                complexity: 'expert'
            },
            {
                id: 'enterprise-management',
                name: 'Enterprise Management',
                description: 'Comprehensive business management with HR, finance, and projects',
                complexity: 'expert'
            },
            {
                id: 'delivery-service',
                name: 'Delivery Service',
                description: 'On-demand delivery platform with real-time tracking',
                complexity: 'advanced'
            },
            {
                id: 'collaboration-messaging',
                name: 'Collaboration Platform',
                description: 'Real-time team collaboration and messaging system',
                complexity: 'intermediate'
            },
            {
                id: 'file-storage',
                name: 'File Storage Platform',
                description: 'Secure file storage, sharing, and management system',
                complexity: 'advanced'
            },
            {
                id: 'learning-portal',
                name: 'Learning Portal',
                description: 'Online education platform with courses and assessments',
                complexity: 'intermediate'
            },
            {
                id: 'ai-writing-tool',
                name: 'AI Writing Tool',
                description: 'Intelligent writing assistant with multiple AI models',
                complexity: 'advanced'
            },
            {
                id: 'ai-chat-platform',
                name: 'AI Chat Platform',
                description: 'Multi-model AI chat platform with context awareness',
                complexity: 'advanced'
            },
            {
                id: 'ai-search',
                name: 'AI Search Engine',
                description: 'Context-aware search with semantic understanding',
                complexity: 'expert'
            }
        ];

        const templateGrid = document.getElementById('templateGrid');
        templateGrid.innerHTML = '';

        templates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.dataset.templateId = template.id;
            
            templateCard.innerHTML = `
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
                <div class="template-complexity complexity-${template.complexity}">${template.complexity}</div>
            `;

            templateCard.addEventListener('click', () => this.selectTemplate(template.id, templateCard));
            templateGrid.appendChild(templateCard);
        });
    }

    selectTemplate(templateId, cardElement) {
        // Remove previous selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new template
        cardElement.classList.add('selected');
        this.selectedTemplate = templateId;
        
        this.log('INFO', `Selected template: ${templateId}`);
    }

    async initializeWorker() {
        if (!this.selectedTemplate) {
            this.log('WARN', 'Please select an application template first');
            return;
        }

        try {
            this.log('INFO', 'Initializing Brolostack Worker...');
            this.updateButton('initWorker', 'Initializing...', true);

            // Simulate worker initialization with template configuration
            await this.simulateAsyncOperation(2000);

            // Create mock worker configuration based on selected template
            const workerConfig = this.getTemplateConfig(this.selectedTemplate);
            
            this.worker = {
                config: workerConfig,
                isRunning: true,
                providers: {
                    ai: workerConfig.aiProviders || [],
                    database: workerConfig.databaseProviders || [],
                    cloud: workerConfig.cloudProviders || []
                },
                metrics: {
                    operationsPerSecond: 0,
                    averageLatency: 50,
                    cacheHitRate: 85,
                    errorRate: 2,
                    throughput: 150
                },
                security: {
                    encryptionEnabled: true,
                    blockchainEnabled: workerConfig.blockchain?.enabled || false,
                    keyCount: 3,
                    blockCount: workerConfig.blockchain?.enabled ? 1 : 0,
                    auditLogCount: 0
                }
            };

            this.isInitialized = true;
            this.updateWorkerStatus();
            this.enableButtons();

            this.log('INFO', `Worker initialized successfully with ${this.selectedTemplate} template`);
            this.log('INFO', `AI Providers: ${this.worker.providers.ai.length}`);
            this.log('INFO', `Database Providers: ${this.worker.providers.database.length}`);
            this.log('INFO', `Security: Encryption=${this.worker.security.encryptionEnabled}, Blockchain=${this.worker.security.blockchainEnabled}`);

        } catch (error) {
            this.log('ERROR', `Worker initialization failed: ${error.message}`);
        } finally {
            this.updateButton('initWorker', 'Initialize Worker', false);
        }
    }

    async shutdownWorker() {
        if (!this.worker) {
            this.log('WARN', 'Worker is not running');
            return;
        }

        try {
            this.log('INFO', 'Shutting down Brolostack Worker...');
            this.updateButton('shutdownWorker', 'Shutting down...', true);

            await this.simulateAsyncOperation(1500);

            this.worker = null;
            this.isInitialized = false;
            this.updateWorkerStatus();
            this.disableButtons();

            this.log('INFO', 'Worker shut down successfully');

        } catch (error) {
            this.log('ERROR', `Worker shutdown failed: ${error.message}`);
        } finally {
            this.updateButton('shutdownWorker', 'Shutdown Worker', true);
        }
    }

    checkWorkerStatus() {
        if (!this.worker) {
            this.log('INFO', 'Worker Status: Not initialized');
            return;
        }

        const status = {
            running: this.worker.isRunning,
            template: this.selectedTemplate,
            providers: {
                ai: this.worker.providers.ai.length,
                database: this.worker.providers.database.length,
                cloud: this.worker.providers.cloud.length
            },
            security: this.worker.security,
            uptime: '5m 23s' // Mock uptime
        };

        this.log('INFO', `Worker Status: ${JSON.stringify(status, null, 2)}`);
    }

    async testAIProviders() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Testing AI providers...');
            this.updateButton('testAI', 'Testing...', true);

            // Simulate AI provider testing
            const providers = ['OpenAI', 'Anthropic', 'Google AI', 'Azure AI'];
            
            for (const provider of providers) {
                this.log('INFO', `Testing ${provider}...`);
                await this.simulateAsyncOperation(800);
                
                const success = Math.random() > 0.1; // 90% success rate
                if (success) {
                    this.log('INFO', `✅ ${provider}: Connected (latency: ${Math.floor(Math.random() * 200 + 50)}ms)`);
                } else {
                    this.log('WARN', `❌ ${provider}: Connection failed`);
                }
            }

            this.updateMetric('aiProviderCount', providers.length);
            this.updateMetric('aiRequestCount', parseInt(document.getElementById('aiRequestCount').textContent) + providers.length);

        } catch (error) {
            this.log('ERROR', `AI provider test failed: ${error.message}`);
        } finally {
            this.updateButton('testAI', 'Test AI Providers', false);
        }
    }

    async generateText() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Generating text with AI...');
            this.updateButton('generateText', 'Generating...', true);

            await this.simulateAsyncOperation(2000);

            const generatedText = "This is a sample AI-generated text demonstrating the multi-provider capabilities of Brolostack Worker. The system automatically selected the optimal provider based on cost, latency, and availability.";
            
            this.log('INFO', `Generated text: "${generatedText}"`);
            this.updateMetric('aiRequestCount', parseInt(document.getElementById('aiRequestCount').textContent) + 1);

        } catch (error) {
            this.log('ERROR', `Text generation failed: ${error.message}`);
        } finally {
            this.updateButton('generateText', 'Generate Text', false);
        }
    }

    async analyzeImage() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Analyzing image with AI...');
            this.updateButton('analyzeImage', 'Analyzing...', true);

            await this.simulateAsyncOperation(1500);

            const analysis = {
                objects: ['laptop', 'desk', 'coffee cup'],
                confidence: 0.94,
                colors: ['blue', 'white', 'brown'],
                text: 'Brolostack Demo'
            };
            
            this.log('INFO', `Image analysis: ${JSON.stringify(analysis)}`);
            this.updateMetric('aiRequestCount', parseInt(document.getElementById('aiRequestCount').textContent) + 1);

        } catch (error) {
            this.log('ERROR', `Image analysis failed: ${error.message}`);
        } finally {
            this.updateButton('analyzeImage', 'Analyze Image', false);
        }
    }

    async createData() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Creating data across providers...');
            this.updateButton('createData', 'Creating...', true);

            const sampleData = {
                id: `item_${Date.now()}`,
                name: 'Sample Product',
                price: 99.99,
                category: 'Electronics',
                timestamp: new Date().toISOString()
            };

            await this.simulateAsyncOperation(1000);

            this.log('INFO', `Data created: ${JSON.stringify(sampleData)}`);
            this.updateOperationMetrics();

        } catch (error) {
            this.log('ERROR', `Data creation failed: ${error.message}`);
        } finally {
            this.updateButton('createData', 'Create Data', false);
        }
    }

    async readData() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Reading data from providers...');
            this.updateButton('readData', 'Reading...', true);

            await this.simulateAsyncOperation(500);

            const mockData = [
                { id: 1, name: 'Product A', price: 29.99 },
                { id: 2, name: 'Product B', price: 49.99 },
                { id: 3, name: 'Product C', price: 79.99 }
            ];

            this.log('INFO', `Data retrieved: ${mockData.length} items`);
            this.updateOperationMetrics();

            // Simulate cache hit
            const cacheHit = Math.random() > 0.3;
            if (cacheHit) {
                this.log('INFO', '💾 Cache hit - data served from cache');
                this.updateMetric('cacheHitRate', '92%');
            }

        } catch (error) {
            this.log('ERROR', `Data read failed: ${error.message}`);
        } finally {
            this.updateButton('readData', 'Read Data', false);
        }
    }

    async updateData() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Updating data with conflict resolution...');
            this.updateButton('updateData', 'Updating...', true);

            await this.simulateAsyncOperation(800);

            // Simulate conflict detection
            const conflictDetected = Math.random() > 0.8;
            if (conflictDetected) {
                this.log('WARN', '⚠️ Conflict detected - applying resolution strategy');
                this.updateMetric('conflictsResolved', parseInt(document.getElementById('conflictsResolved').textContent) + 1);
                await this.simulateAsyncOperation(500);
            }

            this.log('INFO', 'Data updated successfully across all providers');
            this.updateOperationMetrics();

        } catch (error) {
            this.log('ERROR', `Data update failed: ${error.message}`);
        } finally {
            this.updateButton('updateData', 'Update Data', false);
        }
    }

    async deleteData() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Deleting data with security verification...');
            this.updateButton('deleteData', 'Deleting...', true);

            await this.simulateAsyncOperation(600);

            this.log('INFO', 'Data deleted successfully with audit trail');
            this.updateOperationMetrics();
            
            // Update audit log count
            this.worker.security.auditLogCount++;
            this.updateMetric('auditLogCount', this.worker.security.auditLogCount);

        } catch (error) {
            this.log('ERROR', `Data deletion failed: ${error.message}`);
        } finally {
            this.updateButton('deleteData', 'Delete Data', false);
        }
    }

    async encryptData() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Encrypting data with AES-GCM...');
            this.updateButton('encryptData', 'Encrypting...', true);

            const sampleData = { sensitive: 'This is confidential data', timestamp: Date.now() };
            
            await this.simulateAsyncOperation(300);

            const encrypted = {
                encryptedData: 'a1b2c3d4e5f6...',
                keyId: 'key_001',
                algorithm: 'AES-GCM',
                iv: '1a2b3c4d...'
            };

            this.log('INFO', `Data encrypted: keyId=${encrypted.keyId}, algorithm=${encrypted.algorithm}`);

        } catch (error) {
            this.log('ERROR', `Data encryption failed: ${error.message}`);
        } finally {
            this.updateButton('encryptData', 'Encrypt Data', false);
        }
    }

    async decryptData() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Decrypting data...');
            this.updateButton('decryptData', 'Decrypting...', true);

            await this.simulateAsyncOperation(250);

            const decrypted = { sensitive: 'This is confidential data', timestamp: Date.now() };
            
            this.log('INFO', 'Data decrypted successfully');

        } catch (error) {
            this.log('ERROR', `Data decryption failed: ${error.message}`);
        } finally {
            this.updateButton('decryptData', 'Decrypt Data', false);
        }
    }

    async createSecurityBlock() {
        if (!this.isInitialized || !this.worker.security.blockchainEnabled) {
            this.log('WARN', 'Blockchain not enabled for this template');
            return;
        }

        try {
            this.log('INFO', 'Creating security block...');
            this.updateButton('createBlock', 'Creating...', true);

            await this.simulateAsyncOperation(1500);

            const block = {
                index: this.worker.security.blockCount + 1,
                timestamp: Date.now(),
                transactions: 3,
                hash: '0x' + Math.random().toString(16).substr(2, 64),
                previousHash: '0x' + Math.random().toString(16).substr(2, 64)
            };

            this.worker.security.blockCount++;
            this.updateMetric('blockCount', this.worker.security.blockCount);
            
            this.log('INFO', `Security block created: ${JSON.stringify(block)}`);

        } catch (error) {
            this.log('ERROR', `Security block creation failed: ${error.message}`);
        } finally {
            this.updateButton('createBlock', 'Create Security Block', false);
        }
    }

    async verifyBlockchain() {
        if (!this.isInitialized || !this.worker.security.blockchainEnabled) {
            this.log('WARN', 'Blockchain not enabled for this template');
            return;
        }

        try {
            this.log('INFO', 'Verifying blockchain integrity...');
            this.updateButton('verifyChain', 'Verifying...', true);

            await this.simulateAsyncOperation(1000);

            const isValid = Math.random() > 0.05; // 95% success rate
            
            if (isValid) {
                this.log('INFO', `✅ Blockchain verified: ${this.worker.security.blockCount} blocks, integrity intact`);
            } else {
                this.log('ERROR', '❌ Blockchain integrity violation detected!');
            }

        } catch (error) {
            this.log('ERROR', `Blockchain verification failed: ${error.message}`);
        } finally {
            this.updateButton('verifyChain', 'Verify Blockchain', false);
        }
    }

    async startSync() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Starting real-time sync...');
            this.updateButton('startSync', 'Starting...', true);

            await this.simulateAsyncOperation(800);

            this.updateMetric('activeSyncs', parseInt(document.getElementById('activeSyncs').textContent) + 1);
            this.updateMetric('lastSync', new Date().toLocaleTimeString());
            
            this.log('INFO', 'Real-time sync started for all configured stores');
            
            document.getElementById('stopSync').disabled = false;

        } catch (error) {
            this.log('ERROR', `Sync start failed: ${error.message}`);
        } finally {
            this.updateButton('startSync', 'Start Sync', false);
        }
    }

    async stopSync() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Stopping real-time sync...');
            this.updateButton('stopSync', 'Stopping...', true);

            await this.simulateAsyncOperation(500);

            const currentSyncs = parseInt(document.getElementById('activeSyncs').textContent);
            this.updateMetric('activeSyncs', Math.max(0, currentSyncs - 1));
            
            this.log('INFO', 'Real-time sync stopped');

        } catch (error) {
            this.log('ERROR', `Sync stop failed: ${error.message}`);
        } finally {
            this.updateButton('stopSync', 'Stop Sync', true);
        }
    }

    async forceSync() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Forcing immediate sync across all providers...');
            this.updateButton('forceSync', 'Syncing...', true);

            await this.simulateAsyncOperation(1200);

            this.updateMetric('lastSync', new Date().toLocaleTimeString());
            
            // Simulate sync conflicts
            const conflicts = Math.floor(Math.random() * 3);
            if (conflicts > 0) {
                this.updateMetric('syncConflicts', parseInt(document.getElementById('syncConflicts').textContent) + conflicts);
                this.log('WARN', `${conflicts} sync conflicts resolved automatically`);
            }
            
            this.log('INFO', 'Force sync completed successfully');

        } catch (error) {
            this.log('ERROR', `Force sync failed: ${error.message}`);
        } finally {
            this.updateButton('forceSync', 'Force Sync', false);
        }
    }

    async getMetrics() {
        if (!this.isInitialized) return;

        try {
            this.log('INFO', 'Retrieving performance metrics...');
            
            const metrics = {
                operationsPerSecond: Math.floor(Math.random() * 100 + 50),
                averageLatency: Math.floor(Math.random() * 100 + 25),
                cacheHitRate: Math.floor(Math.random() * 20 + 80),
                errorRate: Math.floor(Math.random() * 5),
                throughput: Math.floor(Math.random() * 200 + 100),
                memoryUsage: Math.floor(Math.random() * 30 + 40),
                cpuUsage: Math.floor(Math.random() * 40 + 20)
            };

            this.updateAllMetrics(metrics);
            this.log('INFO', `Metrics updated: ${JSON.stringify(metrics)}`);

        } catch (error) {
            this.log('ERROR', `Metrics retrieval failed: ${error.message}`);
        }
    }

    resetMetrics() {
        if (!this.isInitialized) return;

        const resetMetrics = {
            operationsPerSecond: 0,
            averageLatency: 0,
            cacheHitRate: 0,
            errorRate: 0,
            throughput: 0
        };

        this.updateAllMetrics(resetMetrics);
        this.log('INFO', 'Performance metrics reset');
    }

    clearLog() {
        this.logs = [];
        document.getElementById('logPanel').innerHTML = '';
        this.log('INFO', 'Log cleared');
    }

    exportLog() {
        const logData = this.logs.map(log => `[${log.timestamp}] [${log.level}] ${log.message}`).join('\n');
        const blob = new Blob([logData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `brolostack-worker-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('INFO', 'Log exported successfully');
    }

    // Utility Methods
    getTemplateConfig(templateId) {
        const configs = {
            'ecommerce': {
                aiProviders: ['openai', 'anthropic'],
                databaseProviders: ['postgresql', 'redis', 'elasticsearch'],
                cloudProviders: ['aws', 'stripe'],
                blockchain: { enabled: true }
            },
            'social-media': {
                aiProviders: ['openai', 'stability-ai', 'clarifai'],
                databaseProviders: ['mongodb', 'redis', 'postgresql'],
                cloudProviders: ['aws', 'cloudflare'],
                blockchain: { enabled: false }
            },
            'ai-coding-assistant': {
                aiProviders: ['openai', 'anthropic', 'google-cloud-ai', 'huggingface'],
                databaseProviders: ['mongodb', 'redis', 'elasticsearch'],
                cloudProviders: ['aws', 'azure'],
                blockchain: { enabled: false }
            },
            'multi-agent-system': {
                aiProviders: ['openai', 'anthropic', 'google-cloud-ai', 'azure-ai'],
                databaseProviders: ['postgresql', 'mongodb', 'redis', 'elasticsearch'],
                cloudProviders: ['aws', 'azure', 'gcp'],
                blockchain: { enabled: true }
            },
            'enterprise-management': {
                aiProviders: ['openai', 'anthropic', 'ibm-watson'],
                databaseProviders: ['postgresql', 'mongodb', 'redis'],
                cloudProviders: ['aws', 'azure', 'oracle-cloud'],
                blockchain: { enabled: true }
            }
        };

        return configs[templateId] || {
            aiProviders: ['openai'],
            databaseProviders: ['postgresql'],
            cloudProviders: ['aws'],
            blockchain: { enabled: false }
        };
    }

    updateWorkerStatus() {
        const statusElement = document.getElementById('workerStatusValue');
        const securityElement = document.getElementById('securityStatus');
        const providerElement = document.getElementById('providerCount');

        if (this.worker) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'status-value status-connected';
            
            securityElement.textContent = 'Active';
            securityElement.className = 'status-value status-connected';
            
            const totalProviders = this.worker.providers.ai.length + 
                                 this.worker.providers.database.length + 
                                 this.worker.providers.cloud.length;
            providerElement.textContent = totalProviders;
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'status-value status-disconnected';
            
            securityElement.textContent = 'Inactive';
            securityElement.className = 'status-value status-disconnected';
            
            providerElement.textContent = '0';
        }
    }

    enableButtons() {
        const buttons = [
            'shutdownWorker', 'testAI', 'generateText', 'analyzeImage',
            'createData', 'readData', 'updateData', 'deleteData',
            'encryptData', 'decryptData', 'createBlock', 'verifyChain',
            'startSync', 'forceSync', 'getMetrics', 'resetMetrics'
        ];

        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = false;
        });
    }

    disableButtons() {
        const buttons = [
            'shutdownWorker', 'testAI', 'generateText', 'analyzeImage',
            'createData', 'readData', 'updateData', 'deleteData',
            'encryptData', 'decryptData', 'createBlock', 'verifyChain',
            'startSync', 'stopSync', 'forceSync', 'getMetrics', 'resetMetrics'
        ];

        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = true;
        });
    }

    updateButton(id, text, disabled) {
        const button = document.getElementById(id);
        if (button) {
            button.textContent = text;
            button.disabled = disabled;
        }
    }

    updateMetric(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateAllMetrics(metrics) {
        document.getElementById('avgLatency').textContent = `${metrics.averageLatency}ms`;
        document.getElementById('throughput').textContent = metrics.throughput;
        document.getElementById('errorRate').textContent = `${metrics.errorRate}%`;
        document.getElementById('operationsPerSec').textContent = metrics.operationsPerSecond;
        document.getElementById('cacheHitRate').textContent = `${metrics.cacheHitRate}%`;

        // Update progress bars
        document.getElementById('latencyProgress').style.width = `${Math.min(metrics.averageLatency, 100)}%`;
        document.getElementById('throughputProgress').style.width = `${Math.min(metrics.throughput / 3, 100)}%`;
        document.getElementById('errorProgress').style.width = `${metrics.errorRate * 10}%`;
    }

    updateOperationMetrics() {
        const current = parseInt(document.getElementById('operationsPerSec').textContent);
        this.updateMetric('operationsPerSec', current + 1);
    }

    log(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, level, message };
        this.logs.push(logEntry);

        const logPanel = document.getElementById('logPanel');
        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        
        logElement.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-level-${level.toLowerCase()}">[${level}]</span>
            ${message}
        `;

        logPanel.appendChild(logElement);
        logPanel.scrollTop = logPanel.scrollHeight;

        // Keep only last 100 log entries
        while (logPanel.children.length > 100) {
            logPanel.removeChild(logPanel.firstChild);
        }
    }

    async simulateAsyncOperation(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    startMetricsUpdater() {
        setInterval(() => {
            if (this.isInitialized && this.worker) {
                // Simulate real-time metrics updates
                const metrics = {
                    operationsPerSecond: Math.floor(Math.random() * 20 + 40),
                    averageLatency: Math.floor(Math.random() * 30 + 45),
                    cacheHitRate: Math.floor(Math.random() * 10 + 85),
                    errorRate: Math.floor(Math.random() * 3),
                    throughput: Math.floor(Math.random() * 50 + 120)
                };

                this.updateAllMetrics(metrics);
            }
        }, 5000); // Update every 5 seconds
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BrolostackWorkerDemo();
});
