// Admin Dashboard Page - Boricua Dance Studio

class AdminDashboardPage {
  constructor() {
    this.stats = {};
    this.recentActivities = [];
    this.upcomingEvents = [];
  }

  async render() {
    // Load all data for statistics
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    const events = Storage.get(STORAGE_KEYS.EVENTS) || [];
    const subscriptions = Storage.get(STORAGE_KEYS.SUBSCRIPTIONS) || [];
    
    // Calculate statistics
    this.stats = this.calculateStats(students, teachers, courses, bookings, payments, subscriptions);
    this.recentActivities = this.getRecentActivities();
    this.upcomingEvents = events.filter(e => new Date(e.date) > new Date()).slice(0, 5);
    
    return `
      <div class="admin-dashboard">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Dashboard Amministratore</h1>
            <p class="page-subtitle">Benvenuto nel pannello di controllo</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-outline" onclick="adminDashboardPage.generateReport()">
              <span class="material-icons">assessment</span>
              Genera Report
            </button>
            <button class="btn btn-primary" onclick="adminDashboardPage.quickActions()">
              <span class="material-icons">flash_on</span>
              Azioni Rapide
            </button>
          </div>
        </div>

        <!-- Main Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">people</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Studenti Totali</div>
              <div class="stat-value">${this.stats.totalStudents}</div>
              <div class="stat-change positive">
                +${this.stats.newStudentsThisMonth} questo mese
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">euro</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Entrate Mensili</div>
              <div class="stat-value">${NumberHelpers.formatCurrency(this.stats.monthlyRevenue)}</div>
              <div class="stat-change ${this.stats.revenueChange >= 0 ? 'positive' : 'negative'}">
                ${this.stats.revenueChange >= 0 ? '+' : ''}${this.stats.revenueChange.toFixed(1)}% vs mese scorso
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">school</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Corsi Attivi</div>
              <div class="stat-value">${this.stats.activeCourses}</div>
              <div class="stat-details">
                ${this.stats.totalEnrollments} iscrizioni totali
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">card_membership</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Abbonamenti Attivi</div>
              <div class="stat-value">${this.stats.activeSubscriptions}</div>
              <div class="stat-details">
                ${this.stats.expiringSubscriptions} in scadenza
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="dashboard-row">
          <div class="card flex-2">
            <div class="card-header">
              <h3 class="card-title">Andamento Entrate</h3>
              <div class="chart-controls">
                <button class="chart-btn active" onclick="adminDashboardPage.updateChart('month')">Mese</button>
                <button class="chart-btn" onclick="adminDashboardPage.updateChart('year')">Anno</button>
              </div>
            </div>
            <div class="card-body">
              <canvas id="revenue-chart" height="300"></canvas>
            </div>
          </div>
          
          <div class="card flex-1">
            <div class="card-header">
              <h3 class="card-title">Ripartizione Entrate</h3>
            </div>
            <div class="card-body">
              <div class="revenue-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Abbonamenti</span>
                  <span class="breakdown-value">${NumberHelpers.formatCurrency(this.stats.subscriptionRevenue)}</span>
                  <div class="breakdown-bar">
                    <div class="bar-fill" style="width: ${this.stats.subscriptionPercentage}%; background: var(--color-primary)"></div>
                  </div>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Lezioni Private</span>
                  <span class="breakdown-value">${NumberHelpers.formatCurrency(this.stats.bookingRevenue)}</span>
                  <div class="breakdown-bar">
                    <div class="bar-fill" style="width: ${this.stats.bookingPercentage}%; background: var(--color-secondary)"></div>
                  </div>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Altri</span>
                  <span class="breakdown-value">${NumberHelpers.formatCurrency(this.stats.otherRevenue)}</span>
                  <div class="breakdown-bar">
                    <div class="bar-fill" style="width: ${this.stats.otherPercentage}%; background: var(--status-pending)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Row -->
        <div class="quick-stats-row">
          <div class="quick-stat-card">
            <span class="material-icons">groups</span>
            <div class="quick-stat-content">
              <div class="quick-stat-value">${this.stats.avgStudentsPerCourse.toFixed(1)}</div>
              <div class="quick-stat-label">Media Studenti/Corso</div>
            </div>
          </div>
          
          <div class="quick-stat-card">
            <span class="material-icons">trending_up</span>
            <div class="quick-stat-content">
              <div class="quick-stat-value">${this.stats.attendanceRate}%</div>
              <div class="quick-stat-label">Tasso Presenza</div>
            </div>
          </div>
          
          <div class="quick-stat-card">
            <span class="material-icons">star</span>
            <div class="quick-stat-content">
              <div class="quick-stat-value">${this.stats.avgTeacherRating.toFixed(1)}</div>
              <div class="quick-stat-label">Valutazione Media</div>
            </div>
          </div>
          
          <div class="quick-stat-card">
            <span class="material-icons">schedule</span>
            <div class="quick-stat-content">
              <div class="quick-stat-value">${this.stats.bookingsThisWeek}</div>
              <div class="quick-stat-label">Prenotazioni Settimana</div>
            </div>
          </div>
        </div>

        <!-- Activity and Events -->
        <div class="dashboard-row">
          <!-- Recent Activity -->
          <div class="card flex-1">
            <div class="card-header">
              <h3 class="card-title">Attività Recenti</h3>
              <a href="#" class="text-primary">Vedi tutte</a>
            </div>
            <div class="card-body">
              ${this.renderRecentActivities()}
            </div>
          </div>
          
          <!-- Upcoming Events -->
          <div class="card flex-1">
            <div class="card-header">
              <h3 class="card-title">Prossimi Eventi</h3>
              <a href="#" onclick="app.router.navigate('${ROUTES.ADMIN_EVENTS}')" class="text-primary">
                Gestisci
              </a>
            </div>
            <div class="card-body">
              ${this.renderUpcomingEvents()}
            </div>
          </div>
        </div>

        <!-- Alerts -->
        ${this.renderAlerts()}

        <!-- Teacher Performance -->
        <div class="card mt-3">
          <div class="card-header">
            <h3 class="card-title">Performance Maestri</h3>
          </div>
          <div class="card-body">
            ${this.renderTeacherPerformance()}
          </div>
        </div>
      </div>
    `;
  }

  calculateStats(students, teachers, courses, bookings, payments, subscriptions) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Students stats
    const activeStudents = students.filter(s => s.status === STUDENT_STATUS.ACTIVE);
    const newStudentsThisMonth = students.filter(s => 
      new Date(s.registrationDate) >= startOfMonth
    ).length;
    
    // Revenue stats
    const monthPayments = payments.filter(p => 
      p.status === PAYMENT_STATUS.COMPLETED &&
      new Date(p.date) >= startOfMonth
    );
    const lastMonthPayments = payments.filter(p => 
      p.status === PAYMENT_STATUS.COMPLETED &&
      new Date(p.date) >= startOfLastMonth &&
      new Date(p.date) <= endOfLastMonth
    );
    
    const monthlyRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const revenueChange = lastMonthRevenue > 0 ? 
      ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    // Revenue breakdown
    const subscriptionRevenue = monthPayments
      .filter(p => p.type === 'subscription')
      .reduce((sum, p) => sum + p.amount, 0);
    const bookingRevenue = monthPayments
      .filter(p => p.type === 'booking')
      .reduce((sum, p) => sum + p.amount, 0);
    const otherRevenue = monthlyRevenue - subscriptionRevenue - bookingRevenue;
    
    const total = monthlyRevenue || 1;
    
    // Course stats
    const activeCourses = courses.filter(c => c.status === COURSE_STATUS.ACTIVE);
    const totalEnrollments = activeCourses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
    const avgStudentsPerCourse = activeCourses.length > 0 ? 
      totalEnrollments / activeCourses.length : 0;
    
    // Attendance stats
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const monthAttendance = attendance.filter(a => 
      new Date(a.date) >= startOfMonth
    );
    const attendanceRate = monthAttendance.length > 0 ?
      Math.round((monthAttendance.filter(a => a.present).length / monthAttendance.length) * 100) : 0;
    
    // Bookings stats
    const bookingsThisWeek = bookings.filter(b => 
      new Date(b.date) >= startOfWeek &&
      b.status === BOOKING_STATUS.CONFIRMED
    ).length;
    
    // Subscriptions stats
    const activeSubscriptions = subscriptions.filter(s => 
      s.status === 'active' &&
      new Date(s.endDate) > now
    ).length;
    
    const expiringSubscriptions = subscriptions.filter(s => {
      const endDate = new Date(s.endDate);
      const daysUntilExpiry = (endDate - now) / (1000 * 60 * 60 * 24);
      return s.status === 'active' && daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    }).length;
    
    // Teacher stats
    const avgTeacherRating = teachers.reduce((sum, t) => sum + (t.rating || 0), 0) / 
      (teachers.length || 1);
    
    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      newStudentsThisMonth,
      monthlyRevenue,
      revenueChange,
      subscriptionRevenue,
      bookingRevenue,
      otherRevenue,
      subscriptionPercentage: (subscriptionRevenue / total) * 100,
      bookingPercentage: (bookingRevenue / total) * 100,
      otherPercentage: (otherRevenue / total) * 100,
      activeCourses: activeCourses.length,
      totalEnrollments,
      avgStudentsPerCourse,
      attendanceRate,
      bookingsThisWeek,
      activeSubscriptions,
      expiringSubscriptions,
      avgTeacherRating
    };
  }

  renderRecentActivities() {
    const activities = this.getRecentActivities();
    
    if (activities.length === 0) {
      return '<p class="text-secondary">Nessuna attività recente</p>';
    }
    
    return `
      <div class="activity-list">
        ${activities.map(activity => `
          <div class="activity-item">
            <div class="activity-icon ${activity.type}">
              <span class="material-icons">${activity.icon}</span>
            </div>
            <div class="activity-content">
              <p class="activity-title">${activity.title}</p>
              <p class="activity-time">${DateHelpers.formatDate(activity.date, 'relative')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderUpcomingEvents() {
    if (this.upcomingEvents.length === 0) {
      return '<p class="text-secondary">Nessun evento programmato</p>';
    }
    
    return `
      <div class="events-list">
        ${this.upcomingEvents.map(event => `
          <div class="event-item">
            <div class="event-date">
              <div class="date-day">${new Date(event.date).getDate()}</div>
              <div class="date-month">${DateHelpers.getMonthName(new Date(event.date)).substring(0, 3)}</div>
            </div>
            <div class="event-info">
              <h5 class="event-name">${event.name}</h5>
              <p class="event-time">
                <span class="material-icons">schedule</span>
                ${event.time}
              </p>
              <p class="event-participants">
                ${event.registeredParticipants.length}/${event.maxParticipants} partecipanti
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAlerts() {
    const alerts = [];
    
    // Pending students
    const pendingStudents = (Storage.get(STORAGE_KEYS.STUDENTS) || [])
      .filter(s => s.status === STUDENT_STATUS.PENDING);
    
    if (pendingStudents.length > 0) {
      alerts.push({
        type: 'warning',
        icon: 'person_add',
        message: `${pendingStudents.length} richieste di iscrizione in attesa`,
        action: () => app.router.navigate(ROUTES.ADMIN_STUDENTS)
      });
    }
    
    // Expiring subscriptions
    if (this.stats.expiringSubscriptions > 0) {
      alerts.push({
        type: 'info',
        icon: 'card_membership',
        message: `${this.stats.expiringSubscriptions} abbonamenti in scadenza questa settimana`,
        action: () => app.router.navigate(ROUTES.ADMIN_SUBSCRIPTIONS)
      });
    }
    
    // Low attendance courses
    const lowAttendanceCourses = this.getCoursesWithLowAttendance();
    if (lowAttendanceCourses.length > 0) {
      alerts.push({
        type: 'warning',
        icon: 'warning',
        message: `${lowAttendanceCourses.length} corsi con bassa frequenza`,
        action: () => app.router.navigate(ROUTES.ADMIN_COURSES)
      });
    }
    
    if (alerts.length === 0) return '';
    
    return `
      <div class="alerts-section">
        ${alerts.map(alert => `
          <div class="alert alert-${alert.type}" onclick="(${alert.action})()">
            <span class="material-icons">${alert.icon}</span>
            <span>${alert.message}</span>
            <span class="material-icons">arrow_forward</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderTeacherPerformance() {
    const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    
    const teacherStats = teachers.map(teacher => {
      const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
      const totalStudents = teacherCourses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
      const teacherBookings = bookings.filter(b => 
        b.teacherId === teacher.id &&
        b.status === BOOKING_STATUS.COMPLETED
      );
      
      return {
        ...teacher,
        coursesCount: teacherCourses.length,
        studentsCount: totalStudents,
        bookingsCount: teacherBookings.length,
        revenue: this.calculateTeacherRevenue(teacher.id)
      };
    }).sort((a, b) => b.revenue - a.revenue);
    
    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Maestro</th>
              <th>Corsi</th>
              <th>Studenti</th>
              <th>Lezioni Private</th>
              <th>Valutazione</th>
              <th>Entrate Generate</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${teacherStats.map(teacher => `
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="avatar avatar-sm">
                      ${StringHelpers.getInitials(teacher.firstName + ' ' + teacher.lastName)}
                    </div>
                    <span>${teacher.firstName} ${teacher.lastName}</span>
                  </div>
                </td>
                <td>${teacher.coursesCount}</td>
                <td>${teacher.studentsCount}</td>
                <td>${teacher.bookingsCount}</td>
                <td>
                  <div class="rating-cell">
                    <span class="material-icons star">star</span>
                    ${teacher.rating ? teacher.rating.toFixed(1) : 'N/A'}
                  </div>
                </td>
                <td class="font-medium">${NumberHelpers.formatCurrency(teacher.revenue)}</td>
                <td>
                  <button class="icon-btn" onclick="adminDashboardPage.viewTeacherDetails('${teacher.id}')">
                    <span class="material-icons">visibility</span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  getRecentActivities() {
    const activities = [];
    const now = new Date();
    
    // Recent registrations
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    students
      .filter(s => (now - new Date(s.registrationDate)) < 7 * 24 * 60 * 60 * 1000)
      .forEach(student => {
        activities.push({
          type: 'success',
          icon: 'person_add',
          title: `Nuova iscrizione: ${student.firstName} ${student.lastName}`,
          date: student.registrationDate
        });
      });
    
    // Recent payments
    const payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    payments
      .filter(p => (now - new Date(p.date)) < 7 * 24 * 60 * 60 * 1000)
      .slice(0, 5)
      .forEach(payment => {
        activities.push({
          type: 'info',
          icon: 'euro',
          title: `Pagamento ricevuto: ${NumberHelpers.formatCurrency(payment.amount)}`,
          date: payment.date
        });
      });
    
    // Recent bookings
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    bookings
      .filter(b => (now - new Date(b.createdAt)) < 7 * 24 * 60 * 60 * 1000)
      .slice(0, 3)
      .forEach(booking => {
        activities.push({
          type: 'primary',
          icon: 'event',
          title: `Nuova prenotazione per ${DateHelpers.formatDate(booking.date)}`,
          date: booking.createdAt
        });
      });
    
    // Sort by date and limit
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }

  getCoursesWithLowAttendance() {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    return courses.filter(c => {
      const occupancy = (c.enrolledStudents.length / c.maxStudents) * 100;
      return c.status === COURSE_STATUS.ACTIVE && occupancy < 50;
    });
  }

  calculateTeacherRevenue(teacherId) {
    const payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    
    // Revenue from private lessons
    const teacherBookings = bookings.filter(b => b.teacherId === teacherId);
    const bookingRevenue = payments
      .filter(p => 
        p.type === 'booking' && 
        teacherBookings.some(b => b.id === p.referenceId)
      )
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Revenue from courses (estimated)
    const teacherCourses = courses.filter(c => c.teacherId === teacherId);
    const courseRevenue = teacherCourses.reduce((sum, c) => 
      sum + (c.price * c.enrolledStudents.length), 0
    );
    
    return bookingRevenue + courseRevenue;
  }

  // Actions

  init() {
    // Draw revenue chart after render
    setTimeout(() => {
      this.drawRevenueChart();
    }, 100);
  }

  drawRevenueChart() {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    
    // Get last 6 months data
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === date.getMonth() &&
               paymentDate.getFullYear() === date.getFullYear() &&
               p.status === PAYMENT_STATUS.COMPLETED;
      });
      
      monthlyData.push({
        month: DateHelpers.getMonthName(date).substring(0, 3),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0)
      });
    }
    
    // Simple bar chart
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 300;
    const padding = 40;
    const barWidth = (width - padding * 2) / monthlyData.length - 20;
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw bars
    monthlyData.forEach((data, index) => {
      const barHeight = (data.revenue / maxRevenue) * (height - padding * 2);
      const x = padding + index * (barWidth + 20);
      const y = height - padding - barHeight;
      
      // Bar
      ctx.fillStyle = 'var(--color-primary)';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Value
      ctx.fillStyle = 'var(--text-primary)';
      ctx.font = '12px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(
        NumberHelpers.formatCurrency(data.revenue), 
        x + barWidth / 2, 
        y - 10
      );
      
      // Month label
      ctx.fillText(data.month, x + barWidth / 2, height - 20);
    });
  }

  updateChart(period) {
    // Update chart based on period
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Redraw chart with new data
    this.drawRevenueChart();
  }

  async generateReport() {
    const reportType = await Modal.form({
      title: 'Genera Report',
      fields: [
        {
          name: 'type',
          label: 'Tipo di Report',
          type: 'select',
          options: [
            { value: 'monthly', label: 'Report Mensile' },
            { value: 'financial', label: 'Report Finanziario' },
            { value: 'students', label: 'Report Studenti' },
            { value: 'teachers', label: 'Report Maestri' },
            { value: 'courses', label: 'Report Corsi' }
          ],
          required: true
        },
        {
          name: 'period',
          label: 'Periodo',
          type: 'select',
          options: [
            { value: 'current_month', label: 'Mese Corrente' },
            { value: 'last_month', label: 'Mese Scorso' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Anno' },
            { value: 'custom', label: 'Personalizzato' }
          ],
          required: true
        }
      ],
      onSubmit: (formData) => {
        app.router.navigate(`${ROUTES.ADMIN_REPORTS}?type=${formData.type}&period=${formData.period}`);
      }
    });
  }

  quickActions() {
    const actions = [
      { icon: 'person_add', label: 'Aggiungi Studente', route: ROUTES.ADMIN_STUDENTS },
      { icon: 'class', label: 'Nuovo Corso', route: ROUTES.ADMIN_COURSES },
      { icon: 'event', label: 'Crea Evento', route: ROUTES.ADMIN_EVENTS },
      { icon: 'campaign', label: 'Invia Comunicazione', route: ROUTES.ADMIN_COMMUNICATIONS },
      { icon: 'local_offer', label: 'Nuova Promozione', route: ROUTES.ADMIN_PROMOTIONS }
    ];
    
    const content = `
      <div class="quick-actions-grid">
        ${actions.map(action => `
          <button class="quick-action-btn" onclick="app.router.navigate('${action.route}')">
            <span class="material-icons">${action.icon}</span>
            <span>${action.label}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    Modal.create({
      title: 'Azioni Rapide',
      content: content,
      size: 'medium'
    });
  }

  viewTeacherDetails(teacherId) {
    app.router.navigate(`${ROUTES.ADMIN_TEACHERS}?id=${teacherId}`);
  }
}

// Create global instance
window.adminDashboardPage = new AdminDashboardPage();