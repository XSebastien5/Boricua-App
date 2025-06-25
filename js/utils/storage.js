// Storage Management - Boricua Dance Studio

class StorageManager {
  constructor() {
    this.prefix = APP_CONFIG.storagePrefix;
    this.initializeStorage();
  }

  // Initialize storage with default values if empty
  initializeStorage() {
    // Check if it's first time
    const initialized = this.get('initialized');
    if (!initialized) {
      this.set('initialized', true);
      this.set('version', APP_CONFIG.version);
      
      // Initialize empty arrays for collections
      this.set(STORAGE_KEYS.STUDENTS, []);
      this.set(STORAGE_KEYS.TEACHERS, []);
      this.set(STORAGE_KEYS.COURSES, []);
      this.set(STORAGE_KEYS.BOOKINGS, []);
      this.set(STORAGE_KEYS.PAYMENTS, []);
      this.set(STORAGE_KEYS.ATTENDANCE, []);
      this.set(STORAGE_KEYS.COMMUNICATIONS, []);
      this.set(STORAGE_KEYS.PROMOTIONS, []);
      this.set(STORAGE_KEYS.EVENTS, []);
      this.set(STORAGE_KEYS.SUBSCRIPTIONS, []);
      this.set(STORAGE_KEYS.COURSE_MAPPINGS, []);
      this.set(STORAGE_KEYS.GAMIFICATION, DEFAULT_BADGES);
      this.set(STORAGE_KEYS.USER_BADGES, {});
      this.set(STORAGE_KEYS.USER_POINTS, {});
      this.set(STORAGE_KEYS.NOTIFICATIONS, []);
      
      // Default settings
      this.set(STORAGE_KEYS.SETTINGS, {
        theme: 'dark',
        language: 'it',
        notifications: true,
        autoBackup: true,
        backupFrequency: 'daily'
      });
    }
  }

  // Get item from storage
  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  // Set item in storage
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      this.triggerStorageEvent(key, value);
      return true;
    } catch (error) {
      console.error('Error setting item in storage:', error);
      this.handleStorageQuotaExceeded();
      return false;
    }
  }

  // Remove item from storage
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      this.triggerStorageEvent(key, null);
      return true;
    } catch (error) {
      console.error('Error removing item from storage:', error);
      return false;
    }
  }

  // Clear all storage (except settings)
  clear() {
    const settings = this.get(STORAGE_KEYS.SETTINGS);
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix) && !key.includes('settings')) {
        localStorage.removeItem(key);
      }
    });
    
    // Restore settings
    if (settings) {
      this.set(STORAGE_KEYS.SETTINGS, settings);
    }
    
    // Reinitialize
    this.initializeStorage();
  }

  // Get all data for backup
  getAllData() {
    const data = {};
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const cleanKey = key.replace(this.prefix, '');
        data[cleanKey] = this.get(cleanKey);
      }
    });
    
    return data;
  }

  // Restore data from backup
  restoreData(data) {
    try {
      // Clear existing data first
      this.clear();
      
      // Restore each key
      Object.keys(data).forEach(key => {
        this.set(key, data[key]);
      });
      
      return true;
    } catch (error) {
      console.error('Error restoring data:', error);
      return false;
    }
  }

  // Export data as JSON
  exportJSON() {
    const data = this.getAllData();
    const timestamp = new Date().toISOString();
    
    return {
      app: APP_CONFIG.name,
      version: APP_CONFIG.version,
      exportDate: timestamp,
      data: data
    };
  }

  // Import data from JSON
  importJSON(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Validate data structure
      if (!parsed.app || !parsed.data) {
        throw new Error('Invalid backup file structure');
      }
      
      // Check version compatibility
      if (parsed.app !== APP_CONFIG.name) {
        throw new Error('Backup file is from a different application');
      }
      
      return this.restoreData(parsed.data);
    } catch (error) {
      console.error('Error importing JSON:', error);
      throw error;
    }
  }

  // Export data as CSV (for specific collections)
  exportCSV(collectionKey) {
    const data = this.get(collectionKey);
    
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    // Convert data to CSV rows
    const csvRows = data.map(item => {
      return headers.map(header => {
        const value = item[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Import data from CSV
  importCSV(csvData, collectionKey) {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const item = {};
        
        headers.forEach((header, index) => {
          item[header] = values[index] || '';
        });
        
        data.push(item);
      }
      
      this.set(collectionKey, data);
      return true;
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }

  // Parse CSV line handling quoted values
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  // Calculate storage size
  getStorageSize() {
    let size = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        size += key.length + (value ? value.length : 0);
      }
    });
    
    return {
      bytes: size,
      kb: (size / 1024).toFixed(2),
      mb: (size / 1024 / 1024).toFixed(2)
    };
  }

  // Handle storage quota exceeded
  handleStorageQuotaExceeded() {
    // Try to free up space by removing old data
    const collections = [
      STORAGE_KEYS.ATTENDANCE,
      STORAGE_KEYS.NOTIFICATIONS,
      STORAGE_KEYS.PAYMENTS
    ];
    
    collections.forEach(key => {
      const data = this.get(key);
      if (Array.isArray(data) && data.length > 100) {
        // Keep only the last 100 items
        this.set(key, data.slice(-100));
      }
    });
  }

  // Trigger custom storage event
  triggerStorageEvent(key, value) {
    window.dispatchEvent(new CustomEvent('storageChange', {
      detail: { key, value }
    }));
  }

  // Watch for storage changes
  watch(key, callback) {
    window.addEventListener('storageChange', (event) => {
      if (event.detail.key === key) {
        callback(event.detail.value);
      }
    });
  }

  // Create automatic backup
  createBackup() {
    const backup = this.exportJSON();
    const backupKey = `backup_${new Date().getTime()}`;
    
    try {
      // Store backup with timestamp
      localStorage.setItem(this.prefix + backupKey, JSON.stringify(backup));
      
      // Keep only last 5 backups
      this.cleanOldBackups();
      
      return backupKey;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  // Clean old backups
  cleanOldBackups() {
    const backups = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix + 'backup_')) {
        backups.push(key);
      }
    });
    
    // Sort by timestamp
    backups.sort();
    
    // Remove old backups, keep last 5
    if (backups.length > 5) {
      const toRemove = backups.slice(0, backups.length - 5);
      toRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  // Get list of backups
  getBackups() {
    const backups = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix + 'backup_')) {
        const backup = localStorage.getItem(key);
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            backups.push({
              key: key.replace(this.prefix, ''),
              date: parsed.exportDate,
              size: backup.length
            });
          } catch (error) {
            console.error('Error parsing backup:', error);
          }
        }
      }
    });
    
    return backups.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Restore from specific backup
  restoreFromBackup(backupKey) {
    try {
      const backup = localStorage.getItem(this.prefix + backupKey);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      const parsed = JSON.parse(backup);
      return this.restoreData(parsed.data);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }
}

// Create global instance
window.Storage = new StorageManager();