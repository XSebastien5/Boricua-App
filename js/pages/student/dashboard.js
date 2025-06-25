// Student Dashboard Page - Boricua Dance Studio

class StudentDashboardPage {
  constructor() {
    this.student = null;
    this.courses = [];
    this.upcomingClasses = [];
    this.achievements = null;
  }

  async render() {
    const user = Storage.get(STORAGE_KEYS.USER);
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    this.student = students.find(s => s.id === user?.studentId);
    
    if (!this.student) {
      return '<div class="error-page">Errore: Studente non trovato</div>';
    }
    
    // Load data
    this.courses = this.getStudentCourses();
    this.upcomingClasses = CalendarService.getUpcomingEvents(5);
    this.achievements = GamificationService.getStudentAchievements(this.student.id);
    
    return `
      <div class="student-dashboard">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <h1 class="page-title">Ciao ${this.student.firstName}! 👋</h1>
          <p class="page-subtitle">Ecco il riepilogo delle tue attività</p>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">class</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Corsi Attivi</div>
              <div class="stat-value">${this.courses.length}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">check_circle</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Lezioni Frequentate</div>
              <div class="stat-value">${this.achievements.totalClasses}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">stars</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Punti Totali</div>
              <div class="stat-value">${this.achievements.points}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">emoji_events</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Badge Guadagnati</div>
              <div class="stat-value">${this.achievements.badges.length}</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Left Column -->
          <div class="dashboard-column">
            <!-- QR Code Section -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Il Mio QR Code</h3>
                <button class="icon-btn" onclick="studentDashboardPage.downloadQR()">
                  <span class="material-icons">download</span>
                </button>
              </div>
              <div class="card-body text-center">
                <div class="qr-code-wrapper">
                  <canvas id="student-qr-code"></canvas>
                  <p class="text-secondary mt-2">
                    Mostra questo codice per registrare la tua presenza
                  </p>
                </div>
              </div>
            </div>

            <!-- Gamification Progress -->
            <div class="card mt-3">
              <div class="card-header">
                <h3 class="card-title">I Miei Progressi</h3>
                <span class="level-badge">Livello ${this.achievements.level.level}</span>
              </div>
              <div class="card-body">
                <div class="level-info">
                  <h4 class="level-name">${this.achievements.level.name}</h4>
                  <div class="points-display">
                    <span class="points-value">${this.achievements.points}</span>
                    <span class="points-label">punti totali</span>
                  </div>
                </div>
                
                <div class="progress-section">
                  <div class="progress-header">
                    <span>Prossimo livello</span>
                    <span>${this.achievements.nextLevelProgress.pointsNeeded} punti rimanenti</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" 
                         style="width: ${this.achievements.nextLevelProgress.percentage}%"></div>
                  </div>
                </div>
                
                <div class="recent-badges mt-3">
                  <h5>Badge Recenti</h5>
                  ${this.achievements.badges.length > 0 ? `
                    <div class="badges-grid">
                      ${this.achievements.badges.slice(-4).reverse().map(badge => `
                        <div class="gamification-badge badge-${badge.level}" 
                             title="${badge.description}">
                          <span>${badge.icon}</span>
                        </div>
                      `).join('')}
                    </div>
                    <button class="btn btn-ghost btn-sm btn-block mt-2" 
                            onclick="studentDashboardPage.showAllBadges()">
                      Vedi tutti i badge
                    </button>
                  ` : '<p class="text-secondary">Nessun badge ancora guadagnato</p>'}
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="dashboard-column">
            <!-- Upcoming Classes -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Prossime Lezioni</h3>
                <a href="#" onclick="app.router.navigate('${ROUTES.STUDENT_CALENDAR}')" class="text-primary">
                  Vedi calendario
                </a>
              </div>
              <div class="card-body">
                ${this.upcomingClasses.length > 0 ? `
                  <div class="upcoming-classes">
                    ${this.upcomingClasses.map(event => this.renderUpcomingClass(event)).join('')}
                  </div>
                ` : '<p class="text-secondary">Nessuna lezione programmata</p>'}
              </div>
            </div>

            <!-- My Courses -->
            <div class="card mt-3">
              <div class="card-header">
                <h3 class="card-title">I Miei Corsi</h3>
                <a href="#" onclick="app.router.navigate('${ROUTES.STUDENT_COURSES}')" class="text-primary">
                  Vedi tutti
                </a>
              </div>
              <div class="card-body">
                ${this.courses.length > 0 ? `
                  <div class="courses-list">
                    ${this.courses.map(course => this.renderCourseItem(course)).join('')}
                  </div>
                ` : `
                  <p class="text-secondary">Non sei iscritto a nessun corso</p>
                  <button class="btn btn-primary btn-sm mt-2" 
                          onclick="studentDashboardPage.browseCourses()">
                    Scopri i Corsi
                  </button>
                `}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mt-3">
              <div class="card-header">
                <h3 class="card-title">Azioni Rapide</h3>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                  <button class="action-btn" onclick="app.router.navigate('${ROUTES.STUDENT_BOOKINGS}')">
                    <span class="material-icons">event_available</span>
                    <span>Prenota Lezione Privata</span>
                  </button>
                  <button class="action-btn" onclick="app.router.navigate('${ROUTES.STUDENT_PAYMENTS}')">
                    <span class="material-icons">payment</span>
                    <span>I Miei Pagamenti</span>
                  </button>
                  <button class="action-btn" onclick="app.router.navigate('${ROUTES.STUDENT_PROFILE}')">
                    <span class="material-icons">person</span>
                    <span>Il Mio Profilo</span>
                  </button>
                  <button class="action-btn" onclick="studentDashboardPage.showNotifications()">
                    <span class="material-icons">notifications</span>
                    <span>Notifiche</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card mt-3">
          <div class="card-header">
            <h3 class="card-title">Attività Recente</h3>
          </div>
          <div class="card-body">
            ${this.renderRecentActivity()}
          </div>
        </div>

        <!-- Subscription Status -->
        ${this.renderSubscriptionStatus()}
      </div>
    `;
  }

  renderUpcomingClass(event) {
    const isToday = DateHelpers.isToday(event.start);
    const timeUntil = this.getTimeUntilClass(event.start);
    
    return `
      <div class="upcoming-class-item ${isToday ? 'today' : ''}">
        <div class="class-date">
          <div class="date-day">${event.start.getDate()}</div>
          <div class="date-month">${DateHelpers.getMonthName(event.start).substring(0, 3)}</div>
        </div>
        <div class="class-info">
          <h5 class="class-title">${event.title}</h5>
          <p class="class-time">
            <span class="material-icons">schedule</span>
            ${DateHelpers.formatDate(event.start, 'time')} - ${DateHelpers.formatDate(event.end, 'time')}
          </p>
          ${event.location ? `
            <p class="class-location">
              <span class="material-icons">location_on</span>
              ${event.location}
            </p>
          ` : ''}
        </div>
        <div class="class-countdown">
          <span class="countdown-label">${timeUntil}</span>
        </div>
      </div>
    `;
  }

  renderCourseItem(course) {
    const teacher = this.getTeacher(course.teacherId);
    const nextClass = this.getNextClassForCourse(course);
    
    return `
      <div class="course-item" onclick="studentDashboardPage.viewCourse('${course.id}')">
        <div class="course-color" style="background-color: ${CalendarService.getCourseColor(course.style)}"></div>
        <div class="course-details">
          <h5 class="course-name">${course.name}</h5>
          <p class="course-teacher">
            <span class="material-icons">person</span>
            ${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}
          </p>
          <p class="course-schedule">
            <span class="material-icons">schedule</span>
            ${StringHelpers.capitalize(course.schedule.dayOfWeek)} ${course.schedule.time}
          </p>
        </div>
        ${nextClass ? `
          <div class="next-class">
            <span class="next-label">Prossima:</span>
            <span class="next-date">${DateHelpers.formatDate(nextClass, 'short')}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderRecentActivity() {
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const recentAttendance = attendance
      .filter(a => a.studentId === this.student.id)
      .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
      .slice(0, 5);
    
    if (recentAttendance.length === 0) {
      return '<p class="text-secondary">Nessuna attività recente</p>';
    }
    
    return `
      <div class="activity-timeline">
        ${recentAttendance.map(att => {
          const course = this.getCourse(att.courseId);
          return `
            <div class="activity-item">
              <div class="activity-icon">
                <span class="material-icons">check_circle</span>
              </div>
              <div class="activity-content">
                <p class="activity-title">Presenza registrata</p>
                <p class="activity-details">${course ? course.name : 'Corso'}</p>
                <p class="activity-time">${DateHelpers.formatDate(att.checkedInAt, 'relative')}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderSubscriptionStatus() {
    const subscriptions = Storage.get(STORAGE_KEYS.SUBSCRIPTIONS) || [];
    const activeSubscription = subscriptions.find(s => 
      s.studentId === this.student.id && 
      s.status === 'active' &&
      new Date(s.endDate) > new Date()
    );
    
    if (!activeSubscription) {
      return `
        <div class="card mt-3 subscription-alert">
          <div class="card-body">
            <div class="alert alert-warning">
              <span class="material-icons">info</span>
              <div>
                <strong>Nessun abbonamento attivo</strong>
                <p>Attiva un abbonamento per accedere a tutti i corsi</p>
                <button class="btn btn-primary btn-sm mt-2" 
                        onclick="studentDashboardPage.viewSubscriptions()">
                  Vedi Abbonamenti
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    const daysRemaining = Math.ceil((new Date(activeSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 7;
    
    return `
      <div class="card mt-3 subscription-status ${isExpiringSoon ? 'expiring' : ''}">
        <div class="card-body">
          <div class="subscription-info">
            <div class="subscription-details">
              <h4>Abbonamento Attivo: ${activeSubscription.name}</h4>
              <p>Valido fino al ${DateHelpers.formatDate(activeSubscription.endDate, 'long')}</p>
              ${isExpiringSoon ? `
                <div class="alert alert-warning mt-2">
                  <span class="material-icons">warning</span>
                  <span>Il tuo abbonamento scade tra ${daysRemaining} giorni</span>
                </div>
              ` : ''}
            </div>
            <div class="subscription-actions">
              ${activeSubscription.autoRenew ? `
                <span class="auto-renew-badge">
                  <span class="material-icons">autorenew</span>
                  Rinnovo automatico
                </span>
              ` : `
                <button class="btn btn-primary" onclick="studentDashboardPage.renewSubscription('${activeSubscription.id}')">
                  Rinnova
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Utility methods

  getStudentCourses() {
    const allCourses = Storage.get(STORAGE_KEYS.COURSES) || [];
    return allCourses.filter(c => 
      c.enrolledStudents.includes(this.student.id) && 
      c.status === COURSE_STATUS.ACTIVE
    );
  }

  getTeacher(teacherId) {
    const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    return teachers.find(t => t.id === teacherId);
  }

  getCourse(courseId) {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    return courses.find(c => c.id === courseId);
  }

  getNextClassForCourse(course) {
    const today = new Date();
    const dayMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const courseDayOfWeek = dayMap[course.schedule.dayOfWeek.toLowerCase()];
    let nextClass = new Date(today);
    
    // Find next occurrence
    while (nextClass.getDay() !== courseDayOfWeek || nextClass.toDateString() === today.toDateString()) {
      nextClass.setDate(nextClass.getDate() + 1);
    }
    
    // Set time
    const [hours, minutes] = course.schedule.time.split(':').map(Number);
    nextClass.setHours(hours, minutes, 0, 0);
    
    // Check if class is still within course period
    if (nextClass > new Date(course.endDate)) {
      return null;
    }
    
    return nextClass;
  }

  getTimeUntilClass(classDate) {
    const now = new Date();
    const diff = classDate - now;
    
    if (diff < 0) return 'Passata';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `tra ${days} giorn${days === 1 ? 'o' : 'i'}`;
    } else if (hours > 0) {
      return `tra ${hours} or${hours === 1 ? 'a' : 'e'}`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `tra ${minutes} minut${minutes === 1 ? 'o' : 'i'}`;
    }
  }

  // Actions

  init() {
    // Generate QR code after render
    setTimeout(() => {
      const canvas = document.getElementById('student-qr-code');
      if (canvas && this.student) {
        const qrCanvas = QRService.generateStudentQR(this.student.id);
        // Copy generated QR to our canvas
        const ctx = canvas.getContext('2d');
        canvas.width = qrCanvas.width;
        canvas.height = qrCanvas.height;
        ctx.drawImage(qrCanvas, 0, 0);
      }
    }, 100);
  }

  downloadQR() {
    const canvas = document.getElementById('student-qr-code');
    if (canvas) {
      QRService.exportQRAsImage(canvas, `qr-${this.student.firstName}-${this.student.lastName}.png`);
    }
  }

  showAllBadges() {
    const content = `
      <div class="all-badges-modal">
        <div class="badges-stats">
          <div class="stat">
            <span class="stat-value">${this.achievements.badges.length}</span>
            <span class="stat-label">Badge Totali</span>
          </div>
          <div class="stat">
            <span class="stat-value">${this.achievements.points}</span>
            <span class="stat-label">Punti Totali</span>
          </div>
          <div class="stat">
            <span class="stat-value">#${this.achievements.rank || 'N/A'}</span>
            <span class="stat-label">Classifica</span>
          </div>
        </div>
        
        <div class="badges-collection">
          ${this.achievements.badges.map(badge => `
            <div class="badge-item">
              <div class="gamification-badge badge-${badge.level}">
                <span>${badge.icon}</span>
              </div>
              <h4>${badge.name}</h4>
              <p>${badge.description}</p>
              <span class="badge-date">Guadagnato il ${DateHelpers.formatDate(badge.earnedAt)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    Modal.create({
      title: 'I Miei Badge',
      content: content,
      size: 'large',
      actions: [{
        text: 'Chiudi',
        class: 'btn-primary',
        onClick: () => true
      }]
    });
  }

  viewCourse(courseId) {
    window.app.router.navigate(`${ROUTES.STUDENT_COURSES}?id=${courseId}`);
  }

  browseCourses() {
    window.app.router.navigate(ROUTES.STUDENT_COURSES);
  }

  viewSubscriptions() {
    window.app.router.navigate(ROUTES.STUDENT_PAYMENTS);
  }

  renewSubscription(subscriptionId) {
    Toast.show('Rinnovo abbonamento in sviluppo', 'info');
  }

  showNotifications() {
    window.app.showNotifications();
  }
}

// Create global instance
window.studentDashboardPage = new StudentDashboardPage();