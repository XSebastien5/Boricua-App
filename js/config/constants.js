// Constants - Boricua Dance Studio

const APP_CONFIG = {
  name: 'Boricua Dance Studio',
  version: '1.0.0',
  apiUrl: '/api', // Mock API URL
  storagePrefix: 'boricua_'
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// Storage Keys
const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  SETTINGS: 'settings',
  THEME: 'theme',
  LANGUAGE: 'language',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  COURSES: 'courses',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  ATTENDANCE: 'attendance',
  COMMUNICATIONS: 'communications',
  PROMOTIONS: 'promotions',
  EVENTS: 'events',
  SUBSCRIPTIONS: 'subscriptions',
  COURSE_MAPPINGS: 'course_mappings',
  GAMIFICATION: 'gamification',
  USER_BADGES: 'user_badges',
  USER_POINTS: 'user_points',
  NOTIFICATIONS: 'notifications',
  BACKUP_DATA: 'backup_data',
  DEMO_MODE: 'demo_mode'
};

// Course Status
const COURSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Booking Status
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Student Status
const STUDENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Subscription Types
const SUBSCRIPTION_TYPES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMESTRAL: 'semestral',
  ANNUAL: 'annual',
  SINGLE_LESSON: 'single_lesson',
  PACKAGE_10: 'package_10',
  PACKAGE_20: 'package_20'
};

// Gamification Badge Types
const BADGE_TYPES = {
  ATTENDANCE: 'attendance',
  PERFORMANCE: 'performance',
  LOYALTY: 'loyalty',
  ACHIEVEMENT: 'achievement',
  SPECIAL: 'special'
};

// Badge Levels
const BADGE_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

// Points Configuration
const POINTS_CONFIG = {
  ATTENDANCE: 10,
  BOOKING_COMPLETED: 20,
  COURSE_COMPLETED: 100,
  REFERRAL: 50,
  REVIEW: 30,
  MILESTONE_10_CLASSES: 200,
  MILESTONE_50_CLASSES: 500,
  MILESTONE_100_CLASSES: 1000
};

// Notification Types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  REMINDER: 'reminder',
  ANNOUNCEMENT: 'announcement'
};

// Calendar Views
const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  LIST: 'list'
};

// Routes
const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_COMMUNICATIONS: '/admin/communications',
  ADMIN_PROMOTIONS: '/admin/promotions',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_COURSE_MAPPING: '/admin/course-mapping',
  ADMIN_GAMIFICATION: '/admin/gamification',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_REPORTS: '/admin/reports',
  
  // Teacher Routes
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_COURSES: '/teacher/courses',
  TEACHER_BOOKINGS: '/teacher/bookings',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_COURSE_MAPPING: '/teacher/course-mapping',
  TEACHER_CALENDAR: '/teacher/calendar',
  
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES: '/student/courses',
  STUDENT_BOOKINGS: '/student/bookings',
  STUDENT_CALENDAR: '/student/calendar',
  STUDENT_COURSE_MAPPING: '/student/course-mapping',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_PAYMENTS: '/student/payments'
};

// Menu Items by Role
const MENU_ITEMS = {
  [USER_ROLES.ADMIN]: [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: ROUTES.ADMIN_DASHBOARD 
    },
    { 
      icon: 'people', 
      label: 'Allievi', 
      route: ROUTES.ADMIN_STUDENTS 
    },
    { 
      icon: 'school', 
      label: 'Maestri', 
      route: ROUTES.ADMIN_TEACHERS 
    },
    { 
      icon: 'class', 
      label: 'Corsi', 
      route: ROUTES.ADMIN_COURSES 
    },
    { 
      icon: 'calendar_today', 
      label: 'Prenotazioni', 
      route: ROUTES.ADMIN_BOOKINGS 
    },
    { 
      icon: 'payments', 
      label: 'Pagamenti', 
      route: ROUTES.ADMIN_PAYMENTS 
    },
    { 
      type: 'separator' 
    },
    { 
      icon: 'campaign', 
      label: 'Comunicazioni', 
      route: ROUTES.ADMIN_COMMUNICATIONS 
    },
    { 
      icon: 'local_offer', 
      label: 'Promozioni', 
      route: ROUTES.ADMIN_PROMOTIONS 
    },
    { 
      icon: 'event', 
      label: 'Eventi', 
      route: ROUTES.ADMIN_EVENTS 
    },
    { 
      type: 'separator' 
    },
    { 
      icon: 'card_membership', 
      label: 'Abbonamenti', 
      route: ROUTES.ADMIN_SUBSCRIPTIONS 
    },
    { 
      icon: 'map', 
      label: 'Course Mapping', 
      route: ROUTES.ADMIN_COURSE_MAPPING 
    },
    { 
      icon: 'emoji_events', 
      label: 'Gamification', 
      route: ROUTES.ADMIN_GAMIFICATION 
    },
    { 
      icon: 'assessment', 
      label: 'Report', 
      route: ROUTES.ADMIN_REPORTS 
    }
  ],
  
  [USER_ROLES.TEACHER]: [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: ROUTES.TEACHER_DASHBOARD 
    },
    { 
      icon: 'class', 
      label: 'I Miei Corsi', 
      route: ROUTES.TEACHER_COURSES 
    },
    { 
      icon: 'calendar_today', 
      label: 'Calendario', 
      route: ROUTES.TEACHER_CALENDAR 
    },
    { 
      icon: 'event_available', 
      label: 'Lezioni Private', 
      route: ROUTES.TEACHER_BOOKINGS 
    },
    { 
      icon: 'people', 
      label: 'Allievi', 
      route: ROUTES.TEACHER_STUDENTS 
    },
    { 
      icon: 'map', 
      label: 'Course Mapping', 
      route: ROUTES.TEACHER_COURSE_MAPPING 
    }
  ],
  
  [USER_ROLES.STUDENT]: [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: ROUTES.STUDENT_DASHBOARD 
    },
    { 
      icon: 'class', 
      label: 'I Miei Corsi', 
      route: ROUTES.STUDENT_COURSES 
    },
    { 
      icon: 'calendar_today', 
      label: 'Calendario', 
      route: ROUTES.STUDENT_CALENDAR 
    },
    { 
      icon: 'event_available', 
      label: 'Prenota Lezione', 
      route: ROUTES.STUDENT_BOOKINGS 
    },
    { 
      icon: 'map', 
      label: 'Course Mapping', 
      route: ROUTES.STUDENT_COURSE_MAPPING 
    },
    { 
      icon: 'person', 
      label: 'Profilo', 
      route: ROUTES.STUDENT_PROFILE 
    },
    { 
      icon: 'receipt', 
      label: 'Pagamenti', 
      route: ROUTES.STUDENT_PAYMENTS 
    }
  ]
};

// Default Badges Configuration
const DEFAULT_BADGES = [
  {
    id: 'first_class',
    name: 'Prima Lezione',
    description: 'Hai completato la tua prima lezione!',
    icon: '🎯',
    type: BADGE_TYPES.ACHIEVEMENT,
    level: BADGE_LEVELS.BRONZE,
    points: 50
  },
  {
    id: 'perfect_week',
    name: 'Settimana Perfetta',
    description: 'Non hai perso nessuna lezione questa settimana',
    icon: '⭐',
    type: BADGE_TYPES.ATTENDANCE,
    level: BADGE_LEVELS.SILVER,
    points: 100
  },
  {
    id: 'dance_master',
    name: 'Dance Master',
    description: 'Hai completato 100 lezioni!',
    icon: '🏆',
    type: BADGE_TYPES.ACHIEVEMENT,
    level: BADGE_LEVELS.GOLD,
    points: 500
  },
  {
    id: 'loyal_student',
    name: 'Allievo Fedele',
    description: 'Un anno di iscrizione continua',
    icon: '💎',
    type: BADGE_TYPES.LOYALTY,
    level: BADGE_LEVELS.PLATINUM,
    points: 1000
  }
];

// Dance Styles
const DANCE_STYLES = [
  'Salsa',
  'Bachata',
  'Merengue',
  'Reggaeton',
  'Kizomba',
  'Rueda de Casino',
  'Son Cubano',
  'Cha Cha Cha',
  'Rumba',
  'Afro-Cuban'
];

// Validation Patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  FISCAL_CODE: /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i,
  POSTAL_CODE: /^[0-9]{5}$/,
  PASSWORD: /^.{6,}$/
};

// Export all constants
window.APP_CONFIG = APP_CONFIG;
window.USER_ROLES = USER_ROLES;
window.STORAGE_KEYS = STORAGE_KEYS;
window.COURSE_STATUS = COURSE_STATUS;
window.BOOKING_STATUS = BOOKING_STATUS;
window.PAYMENT_STATUS = PAYMENT_STATUS;
window.STUDENT_STATUS = STUDENT_STATUS;
window.SUBSCRIPTION_TYPES = SUBSCRIPTION_TYPES;
window.BADGE_TYPES = BADGE_TYPES;
window.BADGE_LEVELS = BADGE_LEVELS;
window.POINTS_CONFIG = POINTS_CONFIG;
window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
window.CALENDAR_VIEWS = CALENDAR_VIEWS;
window.ROUTES = ROUTES;
window.MENU_ITEMS = MENU_ITEMS;
window.DEFAULT_BADGES = DEFAULT_BADGES;
window.DANCE_STYLES = DANCE_STYLES;
window.VALIDATION_PATTERNS = VALIDATION_PATTERNS;