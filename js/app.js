// Main Application - Boricua Dance Studio

class BoricuaApp {
  constructor() {
    this.currentUser = null;
    this.router = null;
    this.initialized = false;
    
    // Service container
    this.services = {};

    // Bind methods
    this.init = this.init.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async init() {
    try {
      // Show loading
      this.showLoading(true);

      // Initialize services
      this.initializeServices();
      
      // Initialize demo mode if needed
      this.checkDemoMode();
      
      // Check authentication
      const isAuthenticated = await this.checkAuth();
      
      // Initialize router
      this.router = new Router(this.services);
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup automatic backup
      this.setupAutoBackup();
      
      // Initialize notifications
      await this.initializeNotifications();
      
      // Route to appropriate page
      if (!isAuthenticated) {
        this.router.navigate(ROUTES.LOGIN);
      } else {
        this.routeByRole();
      }
      
      this.initialized = true;
      console.log('Boricua Dance Studio PWA initialized successfully');
      
    } catch (error) {
      console.error('Error initializing app:', error);
      this.services.toast.show('Errore nell\'inizializzazione dell\'applicazione: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  initializeServices() {
    // Order is important here
    this.services.toast = new ToastComponent();
    this.services.modal = new ModalComponent();
    this.services.sidebar = new SidebarComponent(this);
    this.services.auth = new AuthService();
    this.services.notification = new NotificationService(this.services);
    this.services.gamification = new GamificationService(this.services);
    this.services.calendar = new CalendarService(this.services);
    this.services.backup = new BackupService(this.services);
    this.services.demo = new DemoService(this.services);
    this.services.qr = new QRService(this.services);
  }

  checkDemoMode() {
    const demoMode = Storage.get(STORAGE_KEYS.DEMO_MODE);
    const hasData = Storage.get(STORAGE_KEYS.STUDENTS)?.length > 0;
    
    // If no data and not in demo mode, ask user
    if (!hasData && !demoMode) {
      // Auto-enable demo mode for first time users
      this.enableDemoMode();
    }
  }

  enableDemoMode() {
    Storage.set(STORAGE_KEYS.DEMO_MODE, true);
    
    // Initialize demo data
    this.services.demo.initializeDemoData();
    
    this.services.toast.show('Modalità demo attivata con dati di esempio', 'info');
  }

  async checkAuth() {
    const user = Storage.get(STORAGE_KEYS.USER);
    const token = Storage.get(STORAGE_KEYS.AUTH_TOKEN);
    
    if (user && token) {
      this.currentUser = user;
      this.updateUIForUser();
      return true;
    }
    
    return false;
  }

  updateUIForUser() {
    // Update settings button visibility
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.style.display = this.currentUser.role === USER_ROLES.ADMIN ? 'flex' : 'none';
    }
    
    // Load menu for user role
    if (this.currentUser) {
      this.services.sidebar.loadMenu(this.currentUser.role);
    }
    
    // Update header with user info
    this.updateHeader();
  }

  updateHeader() {
    // Add user info to header if needed
    const header = document.querySelector('.app-header');
    if (header && this.currentUser) {
      // Could add user avatar or name to header
    }
  }

  routeByRole() {
    if (!this.currentUser) return;
    
    switch (this.currentUser.role) {
      case USER_ROLES.ADMIN:
        this.router.navigate(ROUTES.ADMIN_DASHBOARD);
        break;
      case USER_ROLES.TEACHER:
        this.router.navigate(ROUTES.TEACHER_DASHBOARD);
        break;
      case USER_ROLES.STUDENT:
        this.router.navigate(ROUTES.STUDENT_DASHBOARD);
        break;
      default:
        this.router.navigate(ROUTES.LOGIN);
    }
  }

  setupEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        this.services.sidebar.toggle();
      });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.router.navigate(ROUTES.ADMIN_SETTINGS);
      });
    }
    
    // Notifications button
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
      notificationsBtn.addEventListener('click', () => {
        this.showNotifications();
      });
    }
    
    // Handle back button
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.route) {
        this.router.loadRoute(event.state.route, false);
      }
    });
    
    // Handle storage changes
    window.addEventListener('storageChange', (event) => {
      // Update UI based on storage changes
      if (event.detail.key === STORAGE_KEYS.NOTIFICATIONS) {
        this.updateNotificationBadge();
      }
    });
    
    // Handle online/offline
    window.addEventListener('online', () => {
      this.services.toast.show('Connessione ripristinata', 'success');
      this.syncData();
    });
    
    window.addEventListener('offline', () => {
      this.services.toast.show('Modalità offline - I dati verranno sincronizzati quando tornerai online', 'warning');
    });
  }

  setupAutoBackup() {
    const settings = Storage.get(STORAGE_KEYS.SETTINGS);
    
    if (settings?.autoBackup) {
      // Schedule automatic backup based on frequency
      const frequency = settings.backupFrequency || 'daily';
      let interval;
      
      switch (frequency) {
        case 'hourly':
          interval = 60 * 60 * 1000; // 1 hour
          break;
        case 'daily':
          interval = 24 * 60 * 60 * 1000; // 24 hours
          break;
        case 'weekly':
          interval = 7 * 24 * 60 * 60 * 1000; // 7 days
          break;
        default:
          interval = 24 * 60 * 60 * 1000; // Default to daily
      }
      
      setInterval(() => {
        const backupKey = Storage.createBackup();
        if (backupKey) {
          console.log('Automatic backup created:', backupKey);
        }
      }, interval);
      
      // Also create initial backup
      Storage.createBackup();
    }
  }

  async initializeNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notifiche push abilitate');
        
        // Subscribe to push notifications
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
          });
          
          // Save subscription to server (mock for now)
          console.log('Push subscription:', subscription);
        } catch (error) {
          console.error('Error subscribing to push notifications:', error);
        }
      }
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  showNotifications() {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    
    // Create notifications modal
    const modal = this.services.modal.create({
      title: 'Notifiche',
      content: this.renderNotifications(notifications),
      actions: [
        {
          text: 'Segna tutte come lette',
          class: 'btn-outline',
          onClick: () => {
            this.markAllNotificationsAsRead();
            this.services.modal.close();
          }
        },
        {
          text: 'Chiudi',
          class: 'btn-primary',
          onClick: () => this.services.modal.close()
        }
      ]
    });
  }

  renderNotifications(notifications) {
    if (notifications.length === 0) {
      return '<p class="text-center text-secondary">Nessuna notifica</p>';
    }
    
    return `
      <div class="notifications-list">
        ${notifications.map(notification => `
          <div class="notification-item ${notification.read ? 'read' : 'unread'}">
            <div class="notification-icon">
              <span class="material-icons">${this.getNotificationIcon(notification.type)}</span>
            </div>
            <div class="notification-content">
              <h4 class="notification-title">${notification.title}</h4>
              <p class="notification-message">${notification.message}</p>
              <span class="notification-date">${this.formatDate(notification.date)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getNotificationIcon(type) {
    const icons = {
      [NOTIFICATION_TYPES.INFO]: 'info',
      [NOTIFICATION_TYPES.SUCCESS]: 'check_circle',
      [NOTIFICATION_TYPES.WARNING]: 'warning',
      [NOTIFICATION_TYPES.ERROR]: 'error',
      [NOTIFICATION_TYPES.REMINDER]: 'alarm',
      [NOTIFICATION_TYPES.ANNOUNCEMENT]: 'campaign'
    };
    
    return icons[type] || 'notifications';
  }

  formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minut${minutes === 1 ? 'o' : 'i'} fa`;
    }
    
    // Less than 1 day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} or${hours === 1 ? 'a' : 'e'} fa`;
    }
    
    // Format as date
    return d.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  markAllNotificationsAsRead() {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    notifications.forEach(n => n.read = true);
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    this.updateNotificationBadge();
  }

  updateNotificationBadge() {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.getElementById('notification-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  async handleLogout() {
    const confirmed = await this.services.modal.confirm({
      title: 'Conferma Logout',
      message: 'Sei sicuro di voler uscire?',
      confirmText: 'Esci',
      cancelText: 'Annulla'
    });
    
    if (confirmed) {
      // Clear user data
      Storage.remove(STORAGE_KEYS.USER);
      Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      
      // Reset current user
      this.currentUser = null;
      
      // Navigate to login
      this.router.navigate(ROUTES.LOGIN);
      
      this.services.toast.show('Logout effettuato con successo', 'success');
    }
  }

  syncData() {
    // Mock sync with server
    console.log('Syncing data with server...');
    
    // In a real app, this would sync local changes with the server
    setTimeout(() => {
      this.services.toast.show('Dati sincronizzati', 'success');
    }, 2000);
  }

  showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.toggle('active', show);
    }
  }

  showError(message) {
    this.services.toast.show(message, 'error');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    window.app = new BoricuaApp();
    await window.app.init();
  } catch (error) {
    console.error("Failed to initialize Boricua App:", error);
    // Optionally, display a user-friendly error message on the page
    const body = document.querySelector('body');
    if (body) {
      body.innerHTML = `
        <div style="text-align: center; padding: 50px; font-family: sans-serif;">
          <h1>Oops! Qualcosa è andato storto.</h1>
          <p>Non è stato possibile caricare l'applicazione. Riprova più tardi.</p>
          <p><i>Dettagli errore: ${error.message}</i></p>
        </div>
      `;
    }
  }
});