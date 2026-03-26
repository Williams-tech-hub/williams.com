// WiFi Data Bundle Storage Application
// Main JavaScript Implementation

class DataBundleStorage {
    constructor() {
        this.db = null;
        this.dbName = 'WiFiDataBundleDB';
        this.storeName = 'dataBundles';
        this.maxStorageBytes = 5 * 1024 * 1024 * 1024; // 5GB in bytes
        this.currentStorageUsed = 0;
        this.isConnected = false;
        this.connectionTimer = null;
        this.connectionStartTime = null;
        this.dataCaptureInterval = null;
        this.capturedDataSize = 0;

        this.init();
    }

    async init() {
        await this.initDatabase();
        await this.loadStorageInfo();
        this.setupEventListeners();
        this.addLog('System initialized successfully.', 'success');
    }

    // Initialize IndexedDB
    initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                this.addLog('Failed to initialize database.', 'error');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.addLog('Database initialized successfully.', 'success');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    // Load storage information
    async loadStorageInfo() {
        try {
            const bundles = await this.getAllBundles();
            this.currentStorageUsed = bundles.reduce((total, bundle) => total + bundle.size, 0);
            this.updateStorageDisplay();
            this.displayBundles(bundles);
        } catch (error) {
            this.addLog('Error loading storage info: ' + error.message, 'error');
        }
    }

    // Get all stored bundles
    getAllBundles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Add a new data bundle
    async addBundle(bundleData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.add(bundleData);

            request.onsuccess = () => {
                this.currentStorageUsed += bundleData.size;
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete a bundle
    async deleteBundle(id, size) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                this.currentStorageUsed -= size;
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Clear all bundles
    async clearAllBundles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                this.currentStorageUsed = 0;
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Connect to WiFi (simulated)
    connectToWiFi() {
        if (this.isConnected) {
            this.addLog('Already connected to WiFi.', 'info');
            return;
        }

        const statusElement = document.getElementById('connectionStatus');
        const connectBtn = document.getElementById('connectBtn');
        const connectionInfo = document.getElementById('connectionInfo');

        // Set connecting state
        statusElement.textContent = 'Connecting...';
        statusElement.className = 'status-badge connecting';
        connectBtn.disabled = true;

        this.addLog('Connecting to WiFi...', 'info');

        // Simulate connection delay
        setTimeout(() => {
            this.isConnected = true;
            this.connectionStartTime = Date.now();
            this.capturedDataSize = 0;

            statusElement.textContent = 'Connected';
            statusElement.className = 'status-badge connected';
            connectBtn.textContent = 'Disconnect from WiFi';
            connectBtn.disabled = false;
            connectionInfo.style.display = 'block';

            this.addLog('Successfully connected to WiFi.', 'success');

            // Start connection timer
            this.startConnectionTimer();

            // Start data capture simulation
            this.startDataCapture();
        }, 2000);
    }

    // Disconnect from WiFi
    disconnectFromWiFi() {
        if (!this.isConnected) return;

        const statusElement = document.getElementById('connectionStatus');
        const connectBtn = document.getElementById('connectBtn');
        const connectionInfo = document.getElementById('connectionInfo');

        this.isConnected = false;

        statusElement.textContent = 'Disconnected';
        statusElement.className = 'status-badge disconnected';
        connectBtn.textContent = 'Connect to WiFi';
        connectionInfo.style.display = 'none';

        // Stop timers
        if (this.connectionTimer) clearInterval(this.connectionTimer);
        if (this.dataCaptureInterval) clearInterval(this.dataCaptureInterval);

        // Save captured data as a bundle if any
        if (this.capturedDataSize > 0) {
            this.saveCapturedData();
        }

        this.addLog('Disconnected from WiFi.', 'info');
    }

    // Start connection timer (30 minutes max)
    startConnectionTimer() {
        const maxConnectionTime = 30 * 60; // 30 minutes in seconds

        this.connectionTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.connectionStartTime) / 1000);
            document.getElementById('connectionTime').textContent = elapsed;

            if (elapsed >= maxConnectionTime) {
                this.addLog('Maximum connection time (30 minutes) reached.', 'info');
                this.disconnectFromWiFi();
            }
        }, 1000);
    }

    // Start data capture simulation
    startDataCapture() {
        // Simulate data capture: approximately 166MB per 30 minutes to reach ~5GB limit
        // This captures data at ~5.5MB per second for demonstration
        this.dataCaptureInterval = setInterval(() => {
            if (!this.isConnected) return;

            // Capture random amount between 1-10 MB per interval
            const captureAmount = (Math.random() * 10 + 1) * 1024 * 1024; // 1-10 MB
            this.capturedDataSize += captureAmount;

            // Check if we have room for more data
            if (this.currentStorageUsed + this.capturedDataSize >= this.maxStorageBytes) {
                this.addLog('Storage limit reached! Stopping data capture.', 'error');
                this.disconnectFromWiFi();
                return;
            }

            // Update display
            const capturedMB = (this.capturedDataSize / (1024 * 1024)).toFixed(2);
            document.getElementById('dataCaptured').textContent = capturedMB;
        }, 1000); // Update every second
    }

    // Save captured data as a bundle
    async saveCapturedData() {
        const sizeMB = (this.capturedDataSize / (1024 * 1024)).toFixed(2);

        const bundle = {
            name: `WiFi Bundle ${new Date().toLocaleString()}`,
            size: this.capturedDataSize,
            timestamp: Date.now(),
            source: 'WiFi Connection',
            data: this.generateDummyData(this.capturedDataSize)
        };

        try {
            await this.addBundle(bundle);
            this.addLog(`Saved ${sizeMB} MB data bundle successfully.`, 'success');
            await this.loadStorageInfo();
        } catch (error) {
            this.addLog(`Error saving bundle: ${error.message}`, 'error');
        }

        this.capturedDataSize = 0;
    }

    // Generate dummy data (for simulation)
    generateDummyData(size) {
        // Generate a smaller representation for storage
        // In a real application, this would be actual cached data
        const chunkSize = Math.min(size, 1024 * 1024); // Store up to 1MB representation
        return new ArrayBuffer(chunkSize);
    }

    // Simulate data collection (button action)
    async simulateDataCollection() {
        const simulatedSize = 100 * 1024 * 1024; // 100 MB

        if (this.currentStorageUsed + simulatedSize > this.maxStorageBytes) {
            this.addLog('Not enough storage space for 100MB bundle.', 'error');
            return;
        }

        const bundle = {
            name: `Simulated Bundle ${new Date().toLocaleString()}`,
            size: simulatedSize,
            timestamp: Date.now(),
            source: 'Simulated Collection',
            data: this.generateDummyData(simulatedSize)
        };

        try {
            await this.addBundle(bundle);
            this.addLog('Created simulated 100MB data bundle.', 'success');
            await this.loadStorageInfo();
        } catch (error) {
            this.addLog(`Error creating bundle: ${error.message}`, 'error');
        }
    }

    // Use stored bundle
    async useStoredBundle() {
        const bundles = await this.getAllBundles();
        if (bundles.length === 0) {
            this.addLog('No bundles available to use.', 'error');
            return;
        }

        const bundle = bundles[bundles.length - 1];
        const sizeMB = (bundle.size / (1024 * 1024)).toFixed(2);

        this.addLog(`Using bundle "${bundle.name}" (${sizeMB} MB) for browsing...`, 'success');

        // Simulate using the bundle
        setTimeout(() => {
            this.addLog(`Bundle data is now active for browsing. ${sizeMB} MB available.`, 'success');
        }, 1000);
    }

    // Update storage display
    updateStorageDisplay() {
        const usedMB = (this.currentStorageUsed / (1024 * 1024)).toFixed(2);
        const totalMB = (this.maxStorageBytes / (1024 * 1024)).toFixed(0);
        const availableMB = ((this.maxStorageBytes - this.currentStorageUsed) / (1024 * 1024)).toFixed(2);
        const percentage = ((this.currentStorageUsed / this.maxStorageBytes) * 100).toFixed(2);

        document.getElementById('usedStorage').textContent = usedMB;
        document.getElementById('availableStorage').textContent = availableMB;
        document.getElementById('storagePercent').textContent = percentage;
        document.getElementById('storageBar').style.width = percentage + '%';

        // Update button states
        const useBundleBtn = document.getElementById('useBundleBtn');
        if (this.currentStorageUsed > 0) {
            useBundleBtn.disabled = false;
        } else {
            useBundleBtn.disabled = true;
        }
    }

    // Display bundles
    displayBundles(bundles) {
        const bundlesList = document.getElementById('bundlesList');

        if (bundles.length === 0) {
            bundlesList.innerHTML = '<p class="empty-state">No data bundles stored yet. Connect to WiFi to start capturing data.</p>';
            return;
        }

        bundlesList.innerHTML = '';

        bundles.forEach(bundle => {
            const bundleElement = document.createElement('div');
            bundleElement.className = 'bundle-item';

            const sizeMB = (bundle.size / (1024 * 1024)).toFixed(2);
            const date = new Date(bundle.timestamp).toLocaleString();

            bundleElement.innerHTML = `
                <div class="bundle-header">
                    <span class="bundle-name">${bundle.name}</span>
                    <span class="bundle-size">${sizeMB} MB</span>
                </div>
                <div class="bundle-details">
                    <p><strong>Source:</strong> ${bundle.source}</p>
                    <p><strong>Created:</strong> ${date}</p>
                </div>
                <div class="bundle-actions">
                    <button class="btn btn-success" onclick="app.useSpecificBundle(${bundle.id})">Use This Bundle</button>
                    <button class="btn btn-danger" onclick="app.deleteBundleById(${bundle.id}, ${bundle.size})">Delete</button>
                </div>
            `;

            bundlesList.appendChild(bundleElement);
        });
    }

    // Use specific bundle
    async useSpecificBundle(id) {
        const bundles = await this.getAllBundles();
        const bundle = bundles.find(b => b.id === id);

        if (!bundle) {
            this.addLog('Bundle not found.', 'error');
            return;
        }

        const sizeMB = (bundle.size / (1024 * 1024)).toFixed(2);
        this.addLog(`Using bundle "${bundle.name}" (${sizeMB} MB) for browsing...`, 'success');
    }

    // Delete specific bundle
    async deleteBundleById(id, size) {
        try {
            await this.deleteBundle(id, size);
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            this.addLog(`Deleted bundle (${sizeMB} MB).`, 'info');
            await this.loadStorageInfo();
        } catch (error) {
            this.addLog(`Error deleting bundle: ${error.message}`, 'error');
        }
    }

    // Clear all data
    async clearAll() {
        if (!confirm('Are you sure you want to delete all stored data bundles?')) {
            return;
        }

        try {
            await this.clearAllBundles();
            this.addLog('All data bundles cleared.', 'info');
            await this.loadStorageInfo();
        } catch (error) {
            this.addLog(`Error clearing data: ${error.message}`, 'error');
        }
    }

    // Add log entry
    addLog(message, type = 'info') {
        const logContainer = document.getElementById('activityLog');
        const logEntry = document.createElement('p');
        logEntry.className = `log-entry ${type}`;

        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;

        logContainer.insertBefore(logEntry, logContainer.firstChild);

        // Keep only last 50 entries
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const connectBtn = document.getElementById('connectBtn');
        const simulateDataBtn = document.getElementById('simulateDataBtn');
        const useBundleBtn = document.getElementById('useBundleBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');

        connectBtn.addEventListener('click', () => {
            if (this.isConnected) {
                this.disconnectFromWiFi();
            } else {
                this.connectToWiFi();
            }
        });

        simulateDataBtn.addEventListener('click', () => {
            this.simulateDataCollection();
        });

        useBundleBtn.addEventListener('click', () => {
            this.useStoredBundle();
        });

        clearAllBtn.addEventListener('click', () => {
            this.clearAll();
        });
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DataBundleStorage();
});
