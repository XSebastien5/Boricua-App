// Router - Boricua Dance Studio

class Router {
  constructor(services) {
    this.routes = {};
    this.currentRoute = null;
    this.contentContainer = document.getElementById('page-content');
    this.pageTitle = document.getElementById('page-title');
    this.services = services;
    this.pageMap = {
      'LoginPage': 'loginPage',
      'AdminDashboard': 'adminDashboardPage',
      'TeacherDashboard': 'teacherDashboardPage',
      'StudentDashboard': 'studentDashboardPage',
      'AdminStudents': 'adminStudentsPage',
      'AdminCourses': 'adminCoursesPage',
      'StudentBookings': 'studentBookingsPage',
      'AdminTeachers': 'adminTeachersPage',
      'AdminBookings': 'adminBookingsPage',
      'AdminPayments': 'adminPaymentsPage',
      'AdminSettings': 'adminSettingsPage',
    };
    
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
    console.log(`[Router] Loading route: ${path}`);
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
        this.services.toast.show('Non hai i permessi per accedere a questa pagina', 'error');
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
      await this.loadComponent(route.component, this.services);
    } catch (error) {
      console.error('Error loading component:', error);
      this.showError();
    } finally {
      this.showLoading(false);
      console.log(`[Router] Finished loading route: ${path}`);
    }
  }

  async loadComponent(componentName, services) {
    console.log(`[Router] Loading component: ${componentName}`);
    // Clear content
    if (this.contentContainer) {
      this.contentContainer.innerHTML = '';
      
      // Add page transition animation
      this.contentContainer.classList.add('page-transition-enter');
      
      // Load component based on name
      const content = await this.getComponentContent(componentName);
      this.contentContainer.innerHTML = content;
      
      // Initialize component if needed
      this.initializeComponent(componentName, services);
      
      // Remove transition class
      setTimeout(() => {
        this.contentContainer.classList.remove('page-transition-enter');
      }, 10);
    }
    console.log(`[Router] Finished loading component: ${componentName}`);
  }

  getComponentContent(componentName) {
    console.log(`[Router] Getting content for component: ${componentName}`);
    // Check if page class exists
    const pageInstanceName = this.pageMap[componentName];
    const pageInstance = window[pageInstanceName];
    
    if (pageInstance && typeof pageInstance.render === 'function') {
      // Return promise that resolves with HTML
      return pageInstance.render();
    }
    
    // Fallback for components not yet implemented
    return `
      <div class="page-placeholder">
        <h2>${componentName}</h2>
        <p class="text-secondary">Questa pagina è in costruzione...</p>
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

  initializeComponent(componentName, services) {
    const pageInstanceName = this.pageMap[componentName];
    const pageInstance = window[pageInstanceName];
    
    if (pageInstance && typeof pageInstance.init === 'function') {
      pageInstance.init(services);
    }

    // Initialize component-specific functionality
    if (componentName === 'StudentDashboard') {
      this.initializeStudentDashboard();
    }
  }

/*
  This is now handled in the LoginPage class
*/

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

