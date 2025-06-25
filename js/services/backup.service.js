// Backup Service - Boricua Dance Studio

class BackupService {
  constructor() {
    this.cloudProvider = null;
    this.autoBackupInterval = null;
    this.init();
  }
  
  init() {
    // Initialize auto backup if enabled
    const settings = Storage.get(STORAGE_KEYS.SETTINGS);
    if (settings?.autoBackup) {
      this.startAutoBackup(settings.backupFrequency);
    }
  }
  
  // Create manual backup
  async createBackup(description = '') {
    try {
      const backupData = Storage.getAllData();
      const timestamp = new Date().toISOString();
      
      const backup = {
        id: StringHelpers.generateId('backup'),
        app: APP_CONFIG.name,
        version: APP_CONFIG.version,
        timestamp: timestamp,
        description: description,
        data: backupData,
        size: JSON.stringify(backupData).length,
        user: Storage.get(STORAGE_KEYS.USER)?.name || 'Unknown'
      };
      
      // Store locally
      const backupKey = Storage.createBackup();
      
      // Try cloud backup if available
      if (this.cloudProvider) {
        await this.uploadToCloud(backup);
      }
      
      Toast.show('Backup creato con successo', 'success');
      
      return {
        success: true,
        backupId: backup.id,
        localKey: backupKey
      };
      
    } catch (error) {
      console.error('Error creating backup:', error);
      Toast.show('Errore nella creazione del backup', 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Export backup to file
  exportBackup(format = 'json') {
    try {
      const exportData = Storage.exportJSON();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `boricua-backup-${timestamp}`;
      
      switch (format) {
        case 'json':
          this.downloadJSON(exportData, filename);
          break;
        
        case 'csv':
          this.exportAllAsCSV(filename);
          break;
        
        default:
          throw new Error('Formato non supportato');
      }
      
      Toast.show('Backup esportato con successo', 'success');
      
    } catch (error) {
      console.error('Error exporting backup:', error);
      Toast.show('Errore nell\'esportazione del backup', 'error');
    }
  }
  
  // Import backup from file
  async importBackup(file) {
    try {
      const content = await this.readFile(file);
      
      if (file.type === 'application/json') {
        const success = Storage.importJSON(content);
        
        if (success) {
          Toast.show('Backup importato con successo', 'success');
          
          // Reload app
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error('Errore nell\'importazione');
        }
      } else {
        throw new Error('Formato file non supportato');
      }
      
    } catch (error) {
      console.error('Error importing backup:', error);
      Toast.show('Errore nell\'importazione del backup: ' + error.message, 'error');
    }
  }
  
  // Restore from backup
  async restoreBackup(backupId) {
    try {
      const confirmed = await Modal.confirm({
        title: 'Conferma Ripristino',
        message: 'Questa operazione sostituirà tutti i dati attuali. Vuoi continuare?',
        confirmText: 'Ripristina',
        cancelText: 'Annulla',
        confirmClass: 'btn-danger'
      });
      
      if (!confirmed) return;
      
      const success = Storage.restoreFromBackup(backupId);
      
      if (success) {
        Toast.show('Backup ripristinato con successo', 'success');
        
        // Reload app
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Backup non trovato');
      }
      
    } catch (error) {
      console.error('Error restoring backup:', error);
      Toast.show('Errore nel ripristino del backup', 'error');
    }
  }
  
  // Get list of available backups
  getBackupList() {
    const localBackups = Storage.getBackups();
    
    // Format for display
    return localBackups.map(backup => ({
      ...backup,
      sizeFormatted: this.formatSize(backup.size),
      dateFormatted: DateHelpers.formatDate(backup.date, 'datetime')
    }));
  }
  
  // Delete backup
  deleteBackup(backupKey) {
    try {
      localStorage.removeItem(APP_CONFIG.storagePrefix + backupKey);
      Toast.show('Backup eliminato', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      Toast.show('Errore nell\'eliminazione del backup', 'error');
      return false;
    }
  }
  
  // Start auto backup
  startAutoBackup(frequency = 'daily') {
    // Clear existing interval
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }
    
    let interval;
    switch (frequency) {
      case 'hourly':
        interval = 60 * 60 * 1000;
        break;
      case 'daily':
        interval = 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        interval = 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        interval = 24 * 60 * 60 * 1000;
    }
    
    // Create initial backup
    this.createBackup('Backup automatico');
    
    // Schedule recurring backups
    this.autoBackupInterval = setInterval(() => {
      this.createBackup('Backup automatico');
    }, interval);
  }
  
  // Stop auto backup
  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }
  
  // Cloud backup methods (mock implementation)
  
  async connectToCloud(provider) {
    // Mock cloud connection
    // In real app, would implement OAuth flow
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (provider === 'google' || provider === 'dropbox') {
          this.cloudProvider = provider;
          Toast.show(`Connesso a ${provider}`, 'success');
          resolve(true);
        } else {
          reject(new Error('Provider non supportato'));
        }
      }, 1000);
    });
  }
  
  async uploadToCloud(backup) {
    if (!this.cloudProvider) {
      throw new Error('Nessun provider cloud configurato');
    }
    
    // Mock upload
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Backup uploaded to cloud:', this.cloudProvider);
        resolve(true);
      }, 1500);
    });
  }
  
  async downloadFromCloud(backupId) {
    if (!this.cloudProvider) {
      throw new Error('Nessun provider cloud configurato');
    }
    
    // Mock download
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Backup downloaded from cloud:', backupId);
        resolve({
          // Mock backup data
          data: Storage.getAllData()
        });
      }, 1500);
    });
  }
  
  // Export specific collection as CSV
  exportCollectionAsCSV(collectionKey, filename) {
    try {
      const csv = Storage.exportCSV(collectionKey);
      
      if (!csv) {
        Toast.show('Nessun dato da esportare', 'warning');
        return;
      }
      
      this.downloadFile(csv, `${filename}.csv`, 'text/csv');
      Toast.show('CSV esportato con successo', 'success');
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Toast.show('Errore nell\'esportazione CSV', 'error');
    }
  }
  
  // Export all collections as separate CSV files
  exportAllAsCSV(baseFilename) {
    const collections = [
      { key: STORAGE_KEYS.STUDENTS, name: 'allievi' },
      { key: STORAGE_KEYS.TEACHERS, name: 'maestri' },
      { key: STORAGE_KEYS.COURSES, name: 'corsi' },
      { key: STORAGE_KEYS.BOOKINGS, name: 'prenotazioni' },
      { key: STORAGE_KEYS.PAYMENTS, name: 'pagamenti' },
      { key: STORAGE_KEYS.ATTENDANCE, name: 'presenze' },
      { key: STORAGE_KEYS.SUBSCRIPTIONS, name: 'abbonamenti' }
    ];
    
    collections.forEach(({ key, name }) => {
      const data = Storage.get(key);
      if (Array.isArray(data) && data.length > 0) {
        this.exportCollectionAsCSV(key, `${baseFilename}-${name}`);
      }
    });
  }
  
  // Import CSV to collection
  async importCSV(file, collectionKey) {
    try {
      const content = await this.readFile(file);
      const success = Storage.importCSV(content, collectionKey);
      
      if (success) {
        Toast.show('CSV importato con successo', 'success');
        
        // Reload current page
        if (window.app?.router) {
          window.app.router.loadRoute(window.app.router.currentRoute);
        }
      }
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      Toast.show('Errore nell\'importazione CSV: ' + error.message, 'error');
    }
  }
  
  // Utility methods
  
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
  
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }
  
  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, `${filename}.json`, 'application/json');
  }
  
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }
  
  // Export PDF report
  async exportPDF(options = {}) {
    // This would require a PDF library like jsPDF
    // Mock implementation for now
    Toast.show('Funzionalità PDF in sviluppo', 'info');
  }
  
  // Data validation before backup
  validateBackupData(data) {
    const requiredKeys = [
      'version',
      'initialized',
      STORAGE_KEYS.SETTINGS
    ];
    
    for (const key of requiredKeys) {
      if (!data[key]) {
        return {
          valid: false,
          error: `Chiave mancante: ${key}`
        };
      }
    }
    
    // Check version compatibility
    if (data.version !== APP_CONFIG.version) {
      console.warn('Version mismatch in backup data');
    }
    
    return { valid: true };
  }
  
  // Clean old automatic backups
  cleanOldBackups(keepCount = 5) {
    const backups = Storage.getBackups();
    
    if (backups.length > keepCount) {
      // Sort by date (newest first) and remove old ones
      backups
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(keepCount)
        .forEach(backup => {
          this.deleteBackup(backup.key);
        });
      
      console.log(`Cleaned ${backups.length - keepCount} old backups`);
    }
  }
}

// Create global instance
window.BackupService = new BackupService();