// Authentication Service - Boricua Dance Studio

class AuthService {
  constructor() {
    this.currentUser = null;
  }
  
  // Login
  async login(email, password) {
    try {
      // Simulate API call
      await this.simulateApiCall();
      
      // Check demo users
      const demoUsers = this.getDemoUsers();
      const user = demoUsers.find(u => u.email === email);
      
      if (user && this.checkPassword(password, user.password)) {
        // Success
        this.currentUser = user;
        Storage.set(STORAGE_KEYS.USER, user);
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, this.generateToken());
        
        return {
          success: true,
          user: user
        };
      }
      
      // Check registered students
      const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
      const student = students.find(s => s.email === email && s.status === STUDENT_STATUS.ACTIVE);
      
      if (student && this.checkPassword(password, student.password)) {
        const studentUser = {
          id: student.id,
          email: student.email,
          name: `${student.firstName} ${student.lastName}`,
          role: USER_ROLES.STUDENT,
          studentId: student.id
        };
        
        this.currentUser = studentUser;
        Storage.set(STORAGE_KEYS.USER, studentUser);
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, this.generateToken());
        
        return {
          success: true,
          user: studentUser
        };
      }
      
      // Check teachers
      const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
      const teacher = teachers.find(t => t.email === email);
      
      if (teacher && this.checkPassword(password, teacher.password)) {
        const teacherUser = {
          id: teacher.id,
          email: teacher.email,
          name: `${teacher.firstName} ${teacher.lastName}`,
          role: USER_ROLES.TEACHER,
          teacherId: teacher.id
        };
        
        this.currentUser = teacherUser;
        Storage.set(STORAGE_KEYS.USER, teacherUser);
        Storage.set(STORAGE_KEYS.AUTH_TOKEN, this.generateToken());
        
        return {
          success: true,
          user: teacherUser
        };
      }
      
      return {
        success: false,
        message: 'Email o password non validi'
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Errore durante il login'
      };
    }
  }
  
  // Register new student
  async register(studentData) {
    try {
      await this.simulateApiCall();
      
      // Validate data
      const validation = Validators.validateForm(studentData, Validators.getStudentValidationRules());
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      // Check if email already exists
      const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
      const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
      
      if (students.some(s => s.email === studentData.email) || 
          teachers.some(t => t.email === studentData.email)) {
        return {
          success: false,
          message: 'Email già registrata'
        };
      }
      
      // Create new student
      const newStudent = {
        id: StringHelpers.generateId('student'),
        ...studentData,
        password: this.hashPassword(studentData.password),
        status: STUDENT_STATUS.PENDING,
        registrationDate: new Date().toISOString(),
        courses: [],
        subscriptions: [],
        points: 0,
        badges: []
      };
      
      // Remove confirmPassword field
      delete newStudent.confirmPassword;
      
      // Add to storage
      students.push(newStudent);
      Storage.set(STORAGE_KEYS.STUDENTS, students);
      
      // Create notification for admin
      this.createRegistrationNotification(newStudent);
      
      return {
        success: true,
        message: 'Registrazione completata! In attesa di approvazione.',
        student: newStudent
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Errore durante la registrazione'
      };
    }
  }
  
  // Logout
  logout() {
    this.currentUser = null;
    Storage.remove(STORAGE_KEYS.USER);
    Storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    
    // Clear sensitive data
    this.clearSessionData();
  }
  
  // Get current user
  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = Storage.get(STORAGE_KEYS.USER);
    }
    return this.currentUser;
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    const user = this.getCurrentUser();
    const token = Storage.get(STORAGE_KEYS.AUTH_TOKEN);
    return !!(user && token);
  }
  
  // Check if user has role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }
  
  // Check if user has permission
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Define permissions by role
    const permissions = {
      [USER_ROLES.ADMIN]: [
        'manage_students',
        'manage_teachers',
        'manage_courses',
        'manage_bookings',
        'manage_payments',
        'manage_communications',
        'manage_promotions',
        'manage_events',
        'manage_subscriptions',
        'manage_gamification',
        'view_reports',
        'export_data',
        'manage_settings'
      ],
      [USER_ROLES.TEACHER]: [
        'view_own_courses',
        'manage_own_course_mapping',
        'view_own_students',
        'manage_own_bookings',
        'scan_qr',
        'view_communications',
        'view_events',
        'view_promotions'
      ],
      [USER_ROLES.STUDENT]: [
        'view_own_courses',
        'book_lessons',
        'view_own_bookings',
        'manage_own_attendance',
        'view_course_mapping',
        'view_communications',
        'view_events',
        'view_promotions',
        'view_own_payments',
        'manage_own_profile'
      ]
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission);
  }
  
  // Reset password (mock)
  async resetPassword(email) {
    try {
      await this.simulateApiCall();
      
      // Check if email exists
      const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
      const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
      
      const exists = students.some(s => s.email === email) || 
                    teachers.some(t => t.email === email);
      
      if (exists) {
        // In real app, would send email
        return {
          success: true,
          message: 'Email di reset password inviata'
        };
      }
      
      return {
        success: false,
        message: 'Email non trovata'
      };
      
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Errore durante il reset password'
      };
    }
  }
  
  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        return {
          success: false,
          message: 'Utente non autenticato'
        };
      }
      
      await this.simulateApiCall();
      
      // Get user data
      let userData;
      let collection;
      let key;
      
      if (user.role === USER_ROLES.STUDENT) {
        collection = Storage.get(STORAGE_KEYS.STUDENTS) || [];
        userData = collection.find(s => s.id === user.studentId);
        key = STORAGE_KEYS.STUDENTS;
      } else if (user.role === USER_ROLES.TEACHER) {
        collection = Storage.get(STORAGE_KEYS.TEACHERS) || [];
        userData = collection.find(t => t.id === user.teacherId);
        key = STORAGE_KEYS.TEACHERS;
      }
      
      if (!userData || !this.checkPassword(currentPassword, userData.password)) {
        return {
          success: false,
          message: 'Password corrente non valida'
        };
      }
      
      // Update password
      userData.password = this.hashPassword(newPassword);
      Storage.set(key, collection);
      
      return {
        success: true,
        message: 'Password cambiata con successo'
      };
      
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Errore durante il cambio password'
      };
    }
  }
  
  // Private methods
  
  getDemoUsers() {
    return [
      {
        id: 'admin_1',
        email: 'admin@boricua.com',
        name: 'Admin Demo',
        role: USER_ROLES.ADMIN,
        password: this.hashPassword('admin123')
      },
      {
        id: 'teacher_1',
        email: 'maestro@boricua.com',
        name: 'Maestro Demo',
        role: USER_ROLES.TEACHER,
        password: this.hashPassword('maestro123'),
        teacherId: 'teacher_1'
      },
      {
        id: 'student_1',
        email: 'allievo@boricua.com',
        name: 'Allievo Demo',
        role: USER_ROLES.STUDENT,
        password: this.hashPassword('allievo123'),
        studentId: 'student_1'
      }
    ];
  }
  
  hashPassword(password) {
    // Simple hash for demo (in production, use proper hashing)
    return btoa(password);
  }
  
  checkPassword(input, hashed) {
    return btoa(input) === hashed;
  }
  
  generateToken() {
    return btoa(Date.now() + Math.random());
  }
  
  async simulateApiCall(delay = 500) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  createRegistrationNotification(student) {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    
    notifications.push({
      id: StringHelpers.generateId('notif'),
      type: NOTIFICATION_TYPES.INFO,
      title: 'Nuova richiesta di iscrizione',
      message: `${student.firstName} ${student.lastName} ha richiesto l'iscrizione`,
      date: new Date().toISOString(),
      read: false,
      targetRole: USER_ROLES.ADMIN,
      data: {
        studentId: student.id
      }
    });
    
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  
  clearSessionData() {
    // Clear any session-specific data
    // In a real app, might clear cached data, etc.
  }
}

// Create global instance
window.AuthService = AuthService;