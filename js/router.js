// Router - Boricua Dance Studio

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.contentContainer = document.getElementById('page-content');
    this.pageTitle = document.getElementById('page-title');
    
    // Initialize routes
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Auth routes
    this.register(ROUTES.LOGIN, {
      title: 'Login',
      component: 'LoginPage',
      requiresAuth: false
    });
    
    this.register(ROUTES.REGISTER, {
      title: 'Registrazione',
      component: 'RegisterPage',
      requiresAuth: false
    });
    
    this.register(ROUTES.FORGOT_PASSWORD, {
      title: 'Recupera Password',
      component: 'ForgotPasswordPage',
      requiresAuth: false
    });
    
    // Admin routes
    this.register(ROUTES.ADMIN_DASHBOARD, {
      title: 'Dashboard Admin',
      component: 'AdminDashboard',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_STUDENTS, {
      title: 'Gestione Allievi',
      component: 'AdminStudents',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_TEACHERS, {
      title: 'Gestione Maestri',
      component: 'AdminTeachers',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_COURSES, {
      title: 'Gestione Corsi',
      component: 'AdminCourses',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_BOOKINGS, {
      title: 'Gestione Prenotazioni',
      component: 'AdminBookings',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_PAYMENTS, {
      title: 'Gestione Pagamenti',
      component: 'AdminPayments',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_COMMUNICATIONS, {
      title: 'Comunicazioni',
      component: 'AdminCommunications',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_PROMOTIONS, {
      title: 'Promozioni',
      component: 'AdminPromotions',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_EVENTS, {
      title: 'Eventi',
      component: 'AdminEvents',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_SUBSCRIPTIONS, {
      title: 'Abbonamenti',
      component: 'AdminSubscriptions',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_COURSE_MAPPING, {
      title: 'Course Mapping',
      component: 'AdminCourseMapping',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_GAMIFICATION, {
      title: 'Gamification',
      component: 'AdminGamification',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_SETTINGS, {
      title: 'Impostazioni',
      component: 'AdminSettings',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    this.register(ROUTES.ADMIN_REPORTS, {
      title: 'Report',
      component: 'AdminReports',
      requiresAuth: true,
      requiredRole: USER_ROLES.ADMIN
    });
    
    // Teacher routes
    this.register(ROUTES.TEACHER_DASHBOARD, {
      title: 'Dashboard Maestro',
      component: 'TeacherDashboard',
      requiresAuth: true,
      requiredRole: USER_ROLES.TEACHER
    });
    
    this.register(ROUTES.TEACHER_COURSES, {
      title: 'I Miei Corsi',
      component: 'TeacherCourses',
      requiresAuth: true,
      requiredRole: USER_ROLES.TEACHER
    });
    
    this.register(ROUTES.TEACHER_BOOKINGS, {
      title: 'Lezioni Private',
      component: 'TeacherBookings',
      requiresAuth: true,
      requiredRole: USER_ROLES.TEACHER
    });
    
    this.register(ROUTES.TEACHER_STUDENTS, {
      title: 'I Miei Allievi',
      component: 'TeacherStudents',
      requiresAuth: true,
      requiredRole: USER_ROLES.TEACHER
    });
    
    this.register(ROUTES.TEACHER_COURSE_MAPPING, {
      title: 'Course Mapping',
      component: 'TeacherCourseMapping',
      requiresAuth: true,
      requiredRole: USER_ROLES.TEACHER
    });
    
    this.register(ROUTES.TEACHER_CALENDAR, {
      title: 'Calendario',
      component: 'TeacherCalendar',
      requiresAuth: true,
      requiredRole: USER_ROLES.TEACHER
    });
    
    // Student routes
    this.register(ROUTES.STUDENT_DASHBOARD, {
      title: 'Dashboard',
      component: 'StudentDashboard',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
    
    this.register(ROUTES.STUDENT_COURSES, {
      title: 'I Miei Corsi',
      component: 'StudentCourses',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
    
    this.register(ROUTES.STUDENT_BOOKINGS, {
      title: 'Prenota Lezione',
      component: 'StudentBookings',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
    
    this.register(ROUTES.STUDENT_CALENDAR, {
      title: 'Calendario',
      component: 'StudentCalendar',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
    
    this.register(ROUTES.STUDENT_COURSE_MAPPING, {
      title: 'Course Mapping',
      component: 'StudentCourseMapping',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
    
    this.register(ROUTES.STUDENT_PROFILE, {
      title: 'Il Mio Profilo',
      component: 'StudentProfile',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
    
    this.register(ROUTES.STUDENT_PAYMENTS, {
      title: 'I Miei Pagamenti',
      component: 'StudentPayments',
      requiresAuth: true,
      requiredRole: USER_ROLES.STUDENT
    });
  }

  register(path, config) {
    this.routes[path] = config;
  }

  navigate(path, pushState = true) {
    // Check if route exists
    if (!this.routes[path]) {
      console.error('Route not found:', path);
      return;
    }
    
    // Load the route
    this.loadRoute(path, pushState);
  }

  async loadRoute(path, pushState = true) {
    const route = this.routes[path];
    
    if (!route) {
      this.show404();
      return;
    }
    
    // Check authentication
    if (route.requiresAuth) {
      const user = Storage.get(STORAGE_KEYS.USER);
      
      if (!user) {
        this.navigate(ROUTES.LOGIN);
        return;
      }
      
      // Check role permissions
      if (route.requiredRole && user.role !== route.requiredRole) {
        Toast.show('Non hai i permessi per accedere a questa pagina', 'error');
        this.navigateToRoleDashboard(user.role);
        return;
      }
    }
    
    // Update current route
    this.currentRoute = path;
    
    // Update browser history
    if (pushState) {
      window.history.pushState({ route: path }, route.title, path);
    }
    
    // Update page title
    if (this.pageTitle) {
      this.pageTitle.textContent = route.title;
    }
    document.title = `${route.title} - ${APP_CONFIG.name}`;
    
    // Update active menu item
    this.updateActiveMenuItem(path);
    
    // Show loading
    this.showLoading(true);
    
    try {
      // Load component
      await this.loadComponent(route.component);
    } catch (error) {
      console.error('Error loading component:', error);
      this.showError();
    } finally {
      this.showLoading(false);
    }
  }

  async loadComponent(componentName) {
    // Simulate loading component (in real app, would dynamically import)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clear content
    if (this.contentContainer) {
      this.contentContainer.innerHTML = '';
      
      // Add page transition animation
      this.contentContainer.classList.add('page-transition-enter');
      
      // Load component based on name
      const content = await this.getComponentContent(componentName);
      this.contentContainer.innerHTML = content;
      
      // Initialize component if needed
      this.initializeComponent(componentName);
      
      // Remove transition class
      setTimeout(() => {
        this.contentContainer.classList.remove('page-transition-enter');
      }, 10);
    }
  }

  getComponentContent(componentName) {
    // Check if page class exists
    const pageMap = {
      'LoginPage': 'loginPage',
      'AdminDashboard': 'adminDashboardPage',
      'TeacherDashboard': 'teacherDashboardPage', 
      'StudentDashboard': 'studentDashboardPage',
      'AdminStudents': 'adminStudentsPage',
      'AdminCourses': 'adminCoursesPage',
      'StudentBookings': 'studentBookingsPage'
    };
    
    const pageInstance = window[pageMap[componentName]];
    
    if (pageInstance && typeof pageInstance.render === 'function') {
      // Return promise that resolves with HTML
      return pageInstance.render();
    }
    
    // Fallback for components not yet implemented
    switch (componentName) {
      case 'LoginPage':
        return this.getLoginPageContent();
      
      case 'AdminDashboard':
        return this.getAdminDashboardContent();
      
      case 'TeacherDashboard':
        return this.getTeacherDashboardContent();
      
      case 'StudentDashboard':
        return this.getStudentDashboardContent();
      
      default:
        return `
          <div class="page-placeholder">
            <h2>${componentName}</h2>
            <p class="text-secondary">Questa pagina è in costruzione...</p>
          </div>
        `;
    }
  }

  getLoginPageContent() {
    return `
      <div class="login-page">
        <div class="login-container">
          <div class="login-card card">
            <div class="login-header">
              <img src="assets/logo.png" alt="Boricua Dance Studio" class="login-logo">
              <h1 class="login-title">Boricua Dance Studio</h1>
              <p class="login-subtitle">Accedi al tuo account</p>
            </div>
            
            <form id="login-form" class="login-form">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" class="form-control" 
                       placeholder="nome@esempio.com" required>
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" class="form-control" 
                       placeholder="••••••••" required>
              </div>
              
              <div class="form-group">
                <label class="checkbox">
                  <input type="checkbox" id="remember-me">
                  <span>Ricordami</span>
                </label>
              </div>
              
              <button type="submit" class="btn btn-primary btn-block">
                Accedi
              </button>
              
              <div class="login-links">
                <a href="#" id="forgot-password-link">Password dimenticata?</a>
                <a href="#" id="register-link">Registrati</a>
              </div>
            </form>
            
            <div class="demo-users">
              <p class="text-center text-secondary mb-2">Utenti Demo:</p>
              <div class="demo-buttons">
                <button class="btn btn-outline btn-sm" onclick="app.router.loginAsDemo('admin')">
                  Admin
                </button>
                <button class="btn btn-outline btn-sm" onclick="app.router.loginAsDemo('teacher')">
                  Maestro
                </button>
                <button class="btn btn-outline btn-sm" onclick="app.router.loginAsDemo('student')">
                  Allievo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getAdminDashboardContent() {
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    
    return `
      <div class="dashboard-page">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">people</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Allievi Totali</div>
              <div class="stat-value">${students.length}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">school</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Maestri</div>
              <div class="stat-value">${teachers.length}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">class</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Corsi Attivi</div>
              <div class="stat-value">${courses.filter(c => c.status === COURSE_STATUS.ACTIVE).length}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">event</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Prenotazioni Oggi</div>
              <div class="stat-value">${this.getTodayBookings(bookings)}</div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 mt-3">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Attività Recenti</h3>
            </div>
            <div class="card-body">
              <p class="text-secondary">Nessuna attività recente</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Prossimi Eventi</h3>
            </div>
            <div class="card-body">
              <p class="text-secondary">Nessun evento programmato</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getTeacherDashboardContent() {
    return `
      <div class="dashboard-page">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">class</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">I Miei Corsi</div>
              <div class="stat-value">3</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">people</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Allievi Totali</div>
              <div class="stat-value">45</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">event</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Lezioni Oggi</div>
              <div class="stat-value">2</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">schedule</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Prossima Lezione</div>
              <div class="stat-value">16:00</div>
            </div>
          </div>
        </div>
        
        <div class="card mt-3">
          <div class="card-header">
            <h3 class="card-title">Il Mio Calendario</h3>
          </div>
          <div class="card-body">
            <p class="text-secondary">Calendario in costruzione...</p>
          </div>
        </div>
      </div>
    `;
  }

  getStudentDashboardContent() {
    const user = Storage.get(STORAGE_KEYS.USER);
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES)?.[user?.id] || [];
    const userPoints = Storage.get(STORAGE_KEYS.USER_POINTS)?.[user?.id] || 0;
    
    return `
      <div class="dashboard-page">
        <!-- QR Code Section -->
        <div class="card mb-3">
          <div class="card-body text-center">
            <h3 class="mb-2">Il Mio QR Code</h3>
            <div class="qr-code-container" id="student-qr-code">
              <canvas id="qr-canvas"></canvas>
            </div>
            <p class="text-secondary mt-2">Mostra questo codice per registrare la tua presenza</p>
          </div>
        </div>
        
        <!-- Gamification Section -->
        <div class="card mb-3">
          <div class="card-header">
            <h3 class="card-title">I Miei Progressi</h3>
          </div>
          <div class="card-body">
            <div class="points-display mb-3">
              <span class="text-secondary">Punti Totali:</span>
              <span class="points-value">${userPoints}</span>
            </div>
            
            <div class="badges-grid">
              ${userBadges.length > 0 ? userBadges.map(badge => `
                <div class="gamification-badge ${badge.level}" title="${badge.description}">
                  <span>${badge.icon}</span>
                </div>
              `).join('') : '<p class="text-secondary">Nessun badge ancora guadagnato</p>'}
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-3">
          <div class="card hover-lift" onclick="app.router.navigate('${ROUTES.STUDENT_COURSES}')">
            <div class="card-body text-center">
              <span class="material-icons" style="font-size: 48px; color: var(--color-primary);">
                class
              </span>
              <h4 class="mt-2">I Miei Corsi</h4>
            </div>
          </div>
          
          <div class="card hover-lift" onclick="app.router.navigate('${ROUTES.STUDENT_BOOKINGS}')">
            <div class="card-body text-center">
              <span class="material-icons" style="font-size: 48px; color: var(--color-secondary);">
                event_available
              </span>
              <h4 class="mt-2">Prenota Lezione</h4>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getTodayBookings(bookings) {
    const today = new Date().toDateString();
    return bookings.filter(b => 
      new Date(b.date).toDateString() === today && 
      b.status === BOOKING_STATUS.CONFIRMED
    ).length;
  }

  initializeComponent(componentName) {
    // Initialize component-specific functionality
    switch (componentName) {
      case 'LoginPage':
        this.initializeLoginPage();
        break;
      
      case 'StudentDashboard':
        this.initializeStudentDashboard();
        break;
      
      // Add other component initializations as needed
    }
  }

  initializeLoginPage() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Mock authentication
        const authService = new AuthService();
        const result = await authService.login(email, password);
        
        if (result.success) {
          Toast.show('Login effettuato con successo!', 'success');
          window.app.currentUser = result.user;
          window.app.updateUIForUser();
          window.app.routeByRole();
        } else {
          Toast.show(result.message || 'Credenziali non valide', 'error');
        }
      });
    }
    
    // Register link
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(ROUTES.REGISTER);
      });
    }
    
    // Forgot password link
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(ROUTES.FORGOT_PASSWORD);
      });
    }
  }

  initializeStudentDashboard() {
    // Generate QR code
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const user = Storage.get(STORAGE_KEYS.USER);
      if (user) {
        // In real app, use a QR library
        // For now, just show a placeholder
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Student ID: ${user.id}`, 100, 100);
      }
    }
  }

  loginAsDemo(role) {
    const demoUsers = {
      admin: {
        id: 'admin_1',
        email: 'admin@boricua.com',
        name: 'Admin Demo',
        role: USER_ROLES.ADMIN
      },
      teacher: {
        id: 'teacher_1',
        email: 'maestro@boricua.com',
        name: 'Maestro Demo',
        role: USER_ROLES.TEACHER
      },
      student: {
        id: 'student_1',
        email: 'allievo@boricua.com',
        name: 'Allievo Demo',
        role: USER_ROLES.STUDENT
      }
    };
    
    const user = demoUsers[role];
    if (user) {
      Storage.set(STORAGE_KEYS.USER, user);
      Storage.set(STORAGE_KEYS.AUTH_TOKEN, 'demo_token_' + role);
      
      window.app.currentUser = user;
      window.app.updateUIForUser();
      window.app.routeByRole();
      
      Toast.show(`Accesso come ${user.name}`, 'success');
    }
  }

  updateActiveMenuItem(path) {
    // Remove all active classes
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current route
    const activeItem = document.querySelector(`.nav-item[href="${path}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  navigateToRoleDashboard(role) {
    switch (role) {
      case USER_ROLES.ADMIN:
        this.navigate(ROUTES.ADMIN_DASHBOARD);
        break;
      case USER_ROLES.TEACHER:
        this.navigate(ROUTES.TEACHER_DASHBOARD);
        break;
      case USER_ROLES.STUDENT:
        this.navigate(ROUTES.STUDENT_DASHBOARD);
        break;
      default:
        this.navigate(ROUTES.LOGIN);
    }
  }

  showLoading(show) {
    // Can implement page-specific loading if needed
  }

  showError() {
    if (this.contentContainer) {
      this.contentContainer.innerHTML = `
        <div class="error-page text-center">
          <span class="material-icons" style="font-size: 64px; color: var(--text-danger);">
            error_outline
          </span>
          <h2 class="mt-3">Errore nel caricamento della pagina</h2>
          <p class="text-secondary">Si è verificato un errore. Riprova più tardi.</p>
          <button class="btn btn-primary mt-3" onclick="location.reload()">
            Ricarica
          </button>
        </div>
      `;
    }
  }

  show404() {
    if (this.contentContainer) {
      this.contentContainer.innerHTML = `
        <div class="error-page text-center">
          <h1 style="font-size: 96px; color: var(--text-secondary);">404</h1>
          <h2>Pagina non trovata</h2>
          <p class="text-secondary">La pagina che stai cercando non esiste.</p>
          <button class="btn btn-primary mt-3" onclick="window.history.back()">
            Torna indietro
          </button>
        </div>
      `;
    }
  }
}

// Make Router available globally
window.Router = Router;