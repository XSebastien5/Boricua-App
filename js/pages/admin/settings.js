// Admin Settings Page - Boricua Dance Studio

class AdminSettingsPage {
  constructor() {
    this.services = null;
    this.settings = {};
  }

  init(services) {
    this.services = services;
    this.addEventListeners();
  }

  addEventListeners() {
    const pageContent = document.getElementById('page-content');
    pageContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;

      const actionName = action.dataset.action;
      
      switch (actionName) {
        case 'save-settings':
          this.saveSettings();
          break;
        case 'export-data':
          this.exportData();
          break;
        case 'import-data':
          this.importData();
          break;
        case 'clear-data':
          this.clearData();
          break;
        case 'generate-demo-data':
          this.generateDemoData();
          break;
      }
    });
  }

  async render() {
    this.settings = Storage.get(STORAGE_KEYS.SETTINGS) || {
      appName: 'Boricua Dance Studio',
      theme: 'dark',
      notifications: true
    };

    return `
      <div class="settings-page">
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Impostazioni</h1>
          <p class="page-subtitle">Gestisci le impostazioni globali dell'applicazione</p>
        </div>

        <div class="settings-container">
          <!-- General Settings -->
          <div class="card">
            <div class="card-header">
              <h3>Impostazioni Generali</h3>
            </div>
            <div class="card-body">
              <form id="general-settings-form">
                <div class="form-group">
                  <label for="appName">Nome Applicazione</label>
                  <input type="text" id="appName" name="appName" class="form-control" value="${this.settings.appName}">
                </div>
                <div class="form-group">
                  <label for="theme">Tema</label>
                  <select id="theme" name="theme" class="form-control">
                    <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Chiaro</option>
                    <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Scuro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-switch">
                    <input type="checkbox" id="notifications" name="notifications" ${this.settings.notifications ? 'checked' : ''}>
                    <i></i>
                    <span>Abilita Notifiche Push</span>
                  </label>
                </div>
              </form>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary" data-action="save-settings">Salva Impostazioni</button>
            </div>
          </div>

          <!-- Data Management -->
          <div class="card">
            <div class="card-header">
              <h3>Gestione Dati</h3>
            </div>
            <div class="card-body">
              <p>Esporta o importa i dati della tua applicazione. Utile per backup e ripristino.</p>
              <div class="data-actions">
                <button class="btn btn-outline" data-action="export-data">
                  <span class="material-icons">file_download</span> Esporta Dati
                </button>
                <button class="btn btn-outline" data-action="import-data">
                  <span class="material-icons">file_upload</span> Importa Dati
                </button>
              </div>
            </div>
          </div>
          
          <!-- Danger Zone -->
          <div class="card danger-zone">
            <div class="card-header">
              <h3>Area Pericolosa</h3>
            </div>
            <div class="card-body">
              <p>Queste azioni sono irreversibili. Procedi con cautela.</p>
              <div class="danger-actions">
                <button class="btn btn-warning" data-action="generate-demo-data">
                  <span class="material-icons">science</span> Genera Dati Demo
                </button>
                <button class="btn btn-danger" data-action="clear-data">
                  <span class="material-icons">delete_forever</span> Cancella Tutti i Dati
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  saveSettings() {
    const form = document.getElementById('general-settings-form');
    const formData = new FormData(form);
    const newSettings = {
      appName: formData.get('appName'),
      theme: formData.get('theme'),
      notifications: formData.get('notifications') === 'on'
    };

    Storage.set(STORAGE_KEYS.SETTINGS, newSettings);
    this.services.toast.show('Impostazioni salvate con successo.', 'success');
    
    // Apply theme change immediately
    document.body.className = `theme-${newSettings.theme}`;
  }

  exportData() {
    this.services.backup.exportAllData();
  }

  importData() {
    this.services.backup.importData();
  }

  async clearData() {
    const confirmed = await this.services.modal.confirm({
      title: 'Cancella Tutti i Dati',
      message: 'Sei assolutamente sicuro? Questa azione eliminerà studenti, corsi, pagamenti e tutte le altre informazioni. Non potrà essere annullata.',
      confirmText: 'Sì, cancella tutto',
      confirmClass: 'btn-danger'
    });

    if (confirmed) {
      localStorage.clear();
      this.services.toast.show('Tutti i dati sono stati cancellati. Ricarica la pagina.', 'warning');
      // Consider forcing a reload or redirecting to logout
      setTimeout(() => window.location.reload(), 2000);
    }
  }

  async generateDemoData() {
    const confirmed = await this.services.modal.confirm({
      title: 'Genera Dati Demo',
      message: 'Questo popolerà l\'applicazione con dati fittizi (studenti, corsi, etc.), sovrascrivendo quelli esistenti. Vuoi procedere?',
      confirmText: 'Genera Dati',
      confirmClass: 'btn-warning'
    });

    if (confirmed) {
        this.services.demo.generate();
        this.services.toast.show('Dati demo generati con successo. Ricarica la pagina per vedere i cambiamenti.', 'success');
        setTimeout(() => window.location.reload(), 2000);
    }
  }
}

window.adminSettingsPage = new AdminSettingsPage();