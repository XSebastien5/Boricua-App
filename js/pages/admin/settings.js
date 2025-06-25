// Admin Settings Page - Boricua Dance Studio

class AdminSettingsPage {
  constructor() {
    this.settings = {};
    this.backups = [];
  }

  async render() {
    this.settings = Storage.get(STORAGE_KEYS.SETTINGS) || {};
    this.backups = Storage.getBackups();
    const storageSize = Storage.getStorageSize();
    
    return `
      <div class="settings-page">
        <h1 class="page-title">Impostazioni</h1>
        
        <div class="settings-sections">
          <!-- General Settings -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="material-icons">settings</span>
              Impostazioni Generali
            </h2>
            
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label>Tema</label>
                  <p class="text-secondary">Scegli il tema dell'applicazione</p>
                </div>
                <select class="form-control" onchange="adminSettingsPage.updateSetting('theme', this.value)">
                  <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Scuro</option>
                  <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''} disabled>Chiaro (prossimamente)</option>
                </select>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Lingua</label>
                  <p class="text-secondary">Lingua dell'interfaccia</p>
                </div>
                <select class="form-control" onchange="adminSettingsPage.updateSetting('language', this.value)">
                  <option value="it" ${this.settings.language === 'it' ? 'selected' : ''}>Italiano</option>
                  <option value="en" ${this.settings.language === 'en' ? 'selected' : ''} disabled>English (coming soon)</option>
                </select>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Notifiche Push</label>
                  <p class="text-secondary">Ricevi notifiche push dal browser</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" 
                         ${this.settings.notifications ? 'checked' : ''}
                         onchange="adminSettingsPage.toggleNotifications(this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- User Management -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="material-icons">manage_accounts</span>
              Gestione Utenti
            </h2>
            
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label>Reset Password Utente</label>
                  <p class="text-secondary">Reimposta la password per un utente specifico</p>
                </div>
                <button class="btn btn-outline" onclick="adminSettingsPage.showResetPassword()">
                  <span class="material-icons">lock_reset</span>
                  Reset Password
                </button>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Sessioni Attive</label>
                  <p class="text-secondary">Visualizza e gestisci le sessioni attive</p>
                </div>
                <button class="btn btn-outline" onclick="adminSettingsPage.showActiveSessions()">
                  <span class="material-icons">devices</span>
                  Gestisci Sessioni
                </button>
              </div>
            </div>
          </div>

          <!-- Backup & Sync -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="material-icons">backup</span>
              Backup e Sincronizzazione
            </h2>
            
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label>Backup Automatico</label>
                  <p class="text-secondary">Esegui backup automatici dei dati</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" 
                         ${this.settings.autoBackup ? 'checked' : ''}
                         onchange="adminSettingsPage.toggleAutoBackup(this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Frequenza Backup</label>
                  <p class="text-secondary">Ogni quanto eseguire il backup automatico</p>
                </div>
                <select class="form-control" 
                        ${!this.settings.autoBackup ? 'disabled' : ''}
                        onchange="adminSettingsPage.updateSetting('backupFrequency', this.value)">
                  <option value="hourly" ${this.settings.backupFrequency === 'hourly' ? 'selected' : ''}>Ogni ora</option>
                  <option value="daily" ${this.settings.backupFrequency === 'daily' ? 'selected' : ''}>Giornaliero</option>
                  <option value="weekly" ${this.settings.backupFrequency === 'weekly' ? 'selected' : ''}>Settimanale</option>
                </select>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Backup Manuale</label>
                  <p class="text-secondary">Crea un backup immediato dei dati</p>
                </div>
                <button class="btn btn-primary" onclick="adminSettingsPage.createBackup()">
                  <span class="material-icons">save</span>
                  Crea Backup
                </button>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Sincronizzazione Cloud</label>
                  <p class="text-secondary">Sincronizza i dati con il cloud</p>
                </div>
                <button class="btn btn-outline" onclick="adminSettingsPage.showCloudSync()">
                  <span class="material-icons">cloud_sync</span>
                  Configura Cloud
                </button>
              </div>
            </div>

            <!-- Backup List -->
            <div class="backups-list mt-3">
              <h3>Backup Disponibili</h3>
              ${this.backups.length > 0 ? `
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Dimensione</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.backups.map(backup => `
                        <tr>
                          <td>${backup.dateFormatted}</td>
                          <td>${backup.sizeFormatted}</td>
                          <td>
                            <button class="icon-btn" onclick="adminSettingsPage.restoreBackup('${backup.key}')" title="Ripristina">
                              <span class="material-icons">restore</span>
                            </button>
                            <button class="icon-btn" onclick="adminSettingsPage.downloadBackup('${backup.key}')" title="Scarica">
                              <span class="material-icons">download</span>
                            </button>
                            <button class="icon-btn text-danger" onclick="adminSettingsPage.deleteBackup('${backup.key}')" title="Elimina">
                              <span class="material-icons">delete</span>
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : '<p class="text-secondary">Nessun backup disponibile</p>'}
            </div>
          </div>

          <!-- Data Management -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="material-icons">storage</span>
              Gestione Dati
            </h2>
            
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label>Spazio Utilizzato</label>
                  <p class="text-secondary">
                    ${storageSize.mb} MB utilizzati
                  </p>
                </div>
                <div class="storage-bar">
                  <div class="storage-used" style="width: ${Math.min(parseFloat(storageSize.mb) * 10, 100)}%"></div>
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Esporta Dati</label>
                  <p class="text-secondary">Esporta tutti i dati in formato JSON o CSV</p>
                </div>
                <div class="button-group">
                  <button class="btn btn-outline" onclick="adminSettingsPage.exportData('json')">
                    <span class="material-icons">code</span>
                    JSON
                  </button>
                  <button class="btn btn-outline" onclick="adminSettingsPage.exportData('csv')">
                    <span class="material-icons">table_chart</span>
                    CSV
                  </button>
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label>Importa Dati</label>
                  <p class="text-secondary">Importa dati da un file di backup</p>
                </div>
                <input type="file" 
                       accept=".json,.csv" 
                       onchange="adminSettingsPage.importData(event)"
                       style="display: none"
                       id="import-file">
                <button class="btn btn-outline" onclick="document.getElementById('import-file').click()">
                  <span class="material-icons">upload</span>
                  Importa
                </button>
              </div>
              
              <div class="setting-item danger-zone">
                <div class="setting-info">
                  <label class="text-danger">Reset Database</label>
                  <p class="text-secondary">Elimina tutti i dati e ripristina i valori predefiniti</p>
                </div>
                <button class="btn btn-danger" onclick="adminSettingsPage.resetDatabase()">
                  <span class="material-icons">warning</span>
                  Reset Database
                </button>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="settings-section">
            <h2 class="section-title">
              <span class="material-icons">info</span>
              Informazioni Sistema
            </h2>
            
            <div class="system-info">
              <div class="info-item">
                <label>Versione App:</label>
                <span>${APP_CONFIG.version}</span>
              </div>
              <div class="info-item">
                <label>Modalità:</label>
                <span>${Storage.get(STORAGE_KEYS.DEMO_MODE) ? 'Demo' : 'Produzione'}</span>
              </div>
              <div class="info-item">
                <label>Browser:</label>
                <span>${navigator.userAgent.substring(0, 50)}...</span>
              </div>
              <div class="info-item">
                <label>PWA Installata:</label>
                <span>${window.matchMedia('(display-mode: standalone)').matches ? 'Sì' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Settings Management

  updateSetting(key, value) {
    this.settings[key] = value;
    Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
    Toast.show('Impostazione aggiornata', 'success');
    
    // Apply theme change immediately
    if (key === 'theme') {
      document.body.className = `theme-${value}`;
    }
  }

  toggleNotifications(enabled) {
    this.updateSetting('notifications', enabled);
    
    if (enabled) {
      NotificationService.requestPermission();
    }
  }

  toggleAutoBackup(enabled) {
    this.updateSetting('autoBackup', enabled);
    
    if (enabled) {
      BackupService.startAutoBackup(this.settings.backupFrequency);
    } else {
      BackupService.stopAutoBackup();
    }
    
    // Re-render to update frequency selector
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  // User Management

  async showResetPassword() {
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    
    const users = [
      ...students.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        type: 'student'
      })),
      ...teachers.map(t => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        type: 'teacher'
      }))
    ];
    
    const userOptions = users.map(u => ({
      value: `${u.type}:${u.id}`,
      label: `${u.name} (${u.email})`
    }));
    
    Modal.form({
      title: 'Reset Password Utente',
      fields: [
        {
          name: 'user',
          label: 'Seleziona Utente',
          type: 'select',
          options: userOptions,
          required: true
        },
        {
          name: 'newPassword',
          label: 'Nuova Password',
          type: 'password',
          required: true,
          placeholder: 'Minimo 6 caratteri'
        },
        {
          name: 'confirmPassword',
          label: 'Conferma Password',
          type: 'password',
          required: true,
          placeholder: 'Ripeti la password'
        }
      ],
      validationRules: {
        newPassword: {
          required: true,
          minLength: 6
        },
        confirmPassword: {
          required: true,
          matches: 'newPassword',
          matchesMessage: 'Le password non corrispondono'
        }
      },
      onSubmit: (formData) => {
        const [type, id] = formData.user.split(':');
        this.resetUserPassword(type, id, formData.newPassword);
      }
    });
  }

  resetUserPassword(type, id, newPassword) {
    if (type === 'student') {
      const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
      const student = students.find(s => s.id === id);
      if (student) {
        student.password = btoa(newPassword);
        Storage.set(STORAGE_KEYS.STUDENTS, students);
        Toast.show('Password reimpostata con successo', 'success');
      }
    } else if (type === 'teacher') {
      const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
      const teacher = teachers.find(t => t.id === id);
      if (teacher) {
        teacher.password = btoa(newPassword);
        Storage.set(STORAGE_KEYS.TEACHERS, teachers);
        Toast.show('Password reimpostata con successo', 'success');
      }
    }
  }

  showActiveSessions() {
    Toast.show('Gestione sessioni in sviluppo', 'info');
  }

  // Backup Management

  async createBackup() {
    const loading = Toast.loading('Creazione backup in corso...');
    
    try {
      const result = await BackupService.createBackup('Backup manuale');
      
      if (result.success) {
        loading.close();
        Toast.show('Backup creato con successo', 'success');
        
        // Refresh backup list
        this.backups = Storage.getBackups();
        this.render().then(html => {
          document.getElementById('page-content').innerHTML = html;
        });
      }
    } catch (error) {
      loading.close();
      Toast.show('Errore nella creazione del backup', 'error');
    }
  }

  async restoreBackup(backupKey) {
    const confirmed = await Modal.confirm({
      title: 'Ripristina Backup',
      message: 'Questa operazione sostituirà tutti i dati attuali. Sei sicuro di voler continuare?',
      confirmText: 'Ripristina',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      await BackupService.restoreBackup(backupKey);
    }
  }

  downloadBackup(backupKey) {
    const backup = localStorage.getItem(APP_CONFIG.storagePrefix + backupKey);
    if (backup) {
      const data = JSON.parse(backup);
      BackupService.downloadJSON(data, `backup-${backupKey}`);
    }
  }

  async deleteBackup(backupKey) {
    const confirmed = await Modal.confirm({
      title: 'Elimina Backup',
      message: 'Sei sicuro di voler eliminare questo backup?',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      BackupService.deleteBackup(backupKey);
      
      // Refresh list
      this.backups = Storage.getBackups();
      this.render().then(html => {
        document.getElementById('page-content').innerHTML = html;
      });
    }
  }

  showCloudSync() {
    Modal.form({
      title: 'Configurazione Cloud',
      fields: [
        {
          name: 'provider',
          label: 'Provider Cloud',
          type: 'select',
          options: [
            { value: 'google', label: 'Google Drive' },
            { value: 'dropbox', label: 'Dropbox' },
            { value: 'onedrive', label: 'OneDrive' }
          ],
          required: true
        }
      ],
      onSubmit: async (formData) => {
        const loading = Toast.loading('Connessione in corso...');
        
        try {
          await BackupService.connectToCloud(formData.provider);
          loading.close();
        } catch (error) {
          loading.close();
          Toast.show(error.message, 'error');
        }
      }
    });
  }

  // Data Management

  exportData(format) {
    if (format === 'json') {
      BackupService.exportBackup('json');
    } else if (format === 'csv') {
      BackupService.exportAllAsCSV('boricua-export');
    }
  }

  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      await BackupService.importBackup(file);
    } catch (error) {
      Toast.show('Errore nell\'importazione: ' + error.message, 'error');
    }
    
    // Reset input
    event.target.value = '';
  }

  async resetDatabase() {
    const confirmed = await Modal.confirm({
      title: 'Reset Database',
      message: 'ATTENZIONE: Questa operazione eliminerà TUTTI i dati. Sei assolutamente sicuro?',
      confirmText: 'Sì, elimina tutto',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      // Double confirmation for safety
      const reallyConfirmed = await Modal.confirm({
        title: 'Ultima Conferma',
        message: 'Questa è l\'ultima possibilità di annullare. Tutti i dati verranno persi definitivamente.',
        confirmText: 'Procedi con il reset',
        confirmClass: 'btn-danger'
      });
      
      if (reallyConfirmed) {
        Storage.clear();
        DemoService.resetToDemo();
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  }
}

// Create global instance
window.adminSettingsPage = new AdminSettingsPage();