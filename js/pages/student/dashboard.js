// Student Dashboard Page - Boricua Dance Studio

class StudentDashboardPage {
  constructor() {
    this.services = null;
    this.user = null;
  }

  init(services) {
    this.services = services;
    this.user = this.services.auth.getCurrentUser();
    this.addEventListeners();
  }

  addEventListeners() {
    const pageContent = document.getElementById('page-content');
    pageContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;

      const actionName = action.dataset.action;
      
      if (actionName === 'view-course-details') {
        const courseId = action.dataset.id;
        this.viewCourseDetails(courseId);
      }
    });
  }

  async render() {
    if (!this.user) {
      return '<p>Utente non trovato.</p>';
    }

    const studentData = this.getStudentData();

    return `
      <div class="student-dashboard">
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Bentornato, ${this.user.firstName}!</h1>
          <p class="page-subtitle">Questa è la tua dashboard personale</p>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-card">
            <div class="stat-icon primary"><span class="material-icons">event_available</span></div>
            <div class="stat-content">
              <div class="stat-label">Prossima Lezione</div>
              <div class="stat-value">${studentData.nextLesson?.title || 'Nessuna'} <small>(${studentData.nextLesson ? DateHelpers.formatDate(studentData.nextLesson.start) : ''})</small></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success"><span class="material-icons">school</span></div>
            <div class="stat-content">
              <div class="stat-label">Corsi Iscritti</div>
              <div class="stat-value">${studentData.enrolledCourses.length}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning"><span class="material-icons">military_tech</span></div>
            <div class="stat-content">
              <div class="stat-label">Punti Fedeltà</div>
              <div class="stat-value">${studentData.loyaltyPoints}</div>
            </div>
          </div>
        </div>

        <div class="dashboard-columns">
          <!-- My Courses -->
          <div class="dashboard-column">
            <div class="card">
              <div class="card-header">
                <h3>I Miei Corsi</h3>
              </div>
              <div class="card-body">
                ${this.renderEnrolledCourses(studentData.enrolledCourses)}
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="dashboard-column">
            <div class="card">
              <div class="card-header">
                <h3>Notifiche Recenti</h3>
              </div>
              <div class="card-body">
                ${this.renderNotifications(studentData.notifications)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStudentData() {
    const allBookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const studentBookings = allBookings.filter(b => b.studentId === this.user.id);
    const upcomingBookings = studentBookings
      .filter(b => new Date(b.start) > new Date())
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    const allCourses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const enrolledCourseIds = [...new Set(studentBookings.map(b => b.extendedProps.courseId))];
    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));

    const notifications = this.services.notification.getForUser(this.user.id);
    const loyaltyPoints = this.services.gamification.getPoints(this.user.id);

    return {
      nextLesson: upcomingBookings[0],
      enrolledCourses,
      notifications,
      loyaltyPoints
    };
  }

  renderEnrolledCourses(courses) {
    if (courses.length === 0) {
      return '<p class="text-secondary">Non sei iscritto a nessun corso.</p>';
    }
    return `
      <ul class="list-group list-group-flush">
        ${courses.map(course => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div class="font-medium">${course.name}</div>
              <small class="text-secondary">${course.level} - ${course.schedule}</small>
            </div>
            <button class="btn btn-sm btn-outline" data-action="view-course-details" data-id="${course.id}">Dettagli</button>
          </li>
        `).join('')}
      </ul>
    `;
  }

  renderNotifications(notifications) {
    if (notifications.length === 0) {
      return '<p class="text-secondary">Nessuna nuova notifica.</p>';
    }
    return `
      <ul class="list-group list-group-flush">
        ${notifications.map(n => `
          <li class="list-group-item">
            <div class="font-medium">${n.title}</div>
            <p class="mb-0">${n.message}</p>
            <small class="text-secondary">${DateHelpers.timeAgo(n.date)}</small>
          </li>
        `).join('')}
      </ul>
    `;
  }

  viewCourseDetails(courseId) {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === course.teacherId);

    const content = `
      <p><strong>Livello:</strong> ${course.level}</p>
      <p><strong>Insegnante:</strong> ${teacher ? teacher.name : 'N/D'}</p>
      <p><strong>Orario:</strong> ${course.schedule}</p>
      <p>${course.description || 'Nessuna descrizione disponibile.'}</p>
    `;

    this.services.modal.create({
      title: course.name,
      content: content,
      actions: [
        { text: 'Le mie prenotazioni', class: 'btn-outline', onClick: () => this.services.router.navigateTo('/student/bookings') },
        { text: 'Chiudi', class: 'btn-primary', onClick: () => true }
      ]
    });
  }
}

window.studentDashboardPage = new StudentDashboardPage();