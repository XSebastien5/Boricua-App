// Admin Teachers Page - Boricua Dance Studio

class AdminTeachersPage {
  constructor() {
    this.teachers = [];
    this.courses = [];
    this.bookings = [];
    this.searchTerm = '';
  }

  async render() {
    this.teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    this.courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    this.bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    
    return `
      <div class="teachers-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Maestri</h1>
            <p class="page-subtitle">Gestisci i maestri della scuola</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" onclick="adminTeachersPage.showAddTeacher()">
              <span class="material-icons">person_add</span>
              Aggiungi Maestro
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="search-section">
          <div class="search-box">
            <span class="material-icons">search</span>
            <input type="text" 
                   placeholder="Cerca per nome, email o specialità..." 
                   class="search-input"
                   value="${this.searchTerm}"
                   onkeyup="adminTeachersPage.handleSearch(event)">
          </div>
        </div>

        <!-- Teachers Grid -->
        <div class="teachers-grid">
          ${this.getFilteredTeachers().map(teacher => this.renderTeacherCard(teacher)).join('')}
        </div>

        ${this.teachers.length === 0 ? this.renderEmptyState() : ''}
      </div>
    `;
  }

  renderTeacherCard(teacher) {
    const teacherStats = this.getTeacherStats(teacher.id);
    
    return `
      <div class="teacher-card">
        <div class="teacher-header">
          <div class="teacher-avatar">
            <div class="avatar avatar-lg">
              ${StringHelpers.getInitials(teacher.firstName + ' ' + teacher.lastName)}
            </div>
            <span class="status-dot ${teacher.status}"></span>
          </div>
          <div class="teacher-actions">
            <button class="icon-btn" onclick="adminTeachersPage.editTeacher('${teacher.id}')" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn" onclick="adminTeachersPage.viewSchedule('${teacher.id}')" title="Calendario">
              <span class="material-icons">calendar_today</span>
            </button>
          </div>
        </div>
        
        <div class="teacher-info">
          <h3 class="teacher-name">${teacher.firstName} ${teacher.lastName}</h3>
          <p class="teacher-email">${teacher.email}</p>
          <p class="teacher-phone">${teacher.phone}</p>
          
          <div class="teacher-specialties">
            ${teacher.specialties.map(specialty => 
              `<span class="specialty-tag">${specialty}</span>`
            ).join('')}
          </div>
          
          <div class="teacher-bio">
            ${teacher.bio || 'Nessuna biografia disponibile'}
          </div>
        </div>
        
        <div class="teacher-stats">
          <div class="stat">
            <span class="stat-value">${teacherStats.coursesCount}</span>
            <span class="stat-label">Corsi</span>
          </div>
          <div class="stat">
            <span class="stat-value">${teacherStats.studentsCount}</span>
            <span class="stat-label">Studenti</span>
          </div>
          <div class="stat">
            <span class="stat-value">${teacherStats.lessonsCount}</span>
            <span class="stat-label">Lezioni</span>
          </div>
          <div class="stat">
            <span class="stat-value">
              <span class="material-icons star">star</span>
              ${teacher.rating ? teacher.rating.toFixed(1) : 'N/A'}
            </span>
            <span class="stat-label">Valutazione</span>
          </div>
        </div>
        
        <div class="teacher-availability">
          <h4>Disponibilità</h4>
          <div class="availability-grid">
            ${this.renderAvailability(teacher.availability)}
          </div>
        </div>
        
        <div class="teacher-footer">
          <button class="btn btn-outline btn-sm" onclick="adminTeachersPage.viewTeacherDetails('${teacher.id}')">
            <span class="material-icons">visibility</span>
            Dettagli Completi
          </button>
          <button class="btn btn-outline btn-sm text-danger" onclick="adminTeachersPage.deleteTeacher('${teacher.id}')">
            <span class="material-icons">delete</span>
            Elimina
          </button>
        </div>
      </div>
    `;
  }

  renderAvailability(availability) {
    const days = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Gio',
      friday: 'Ven',
      saturday: 'Sab',
      sunday: 'Dom'
    };
    
    return Object.entries(days).map(([key, label]) => {
      const slots = availability[key] || [];
      return `
        <div class="availability-day ${slots.length > 0 ? 'available' : ''}">
          <span class="day-label">${label}</span>
          ${slots.length > 0 ? `
            <span class="day-slots">${slots.join(', ')}</span>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <span class="material-icons">school</span>
        <h3>Nessun Maestro Registrato</h3>
        <p>Aggiungi il primo maestro per iniziare</p>
        <button class="btn btn-primary" onclick="adminTeachersPage.showAddTeacher()">
          <span class="material-icons">person_add</span>
          Aggiungi Maestro
        </button>
      </div>
    `;
  }

  getFilteredTeachers() {
    if (!this.searchTerm) return this.teachers;
    
    const search = this.searchTerm.toLowerCase();
    return this.teachers.filter(teacher => {
      const searchableText = `
        ${teacher.firstName} 
        ${teacher.lastName} 
        ${teacher.email} 
        ${teacher.phone}
        ${teacher.specialties.join(' ')}
        ${teacher.bio || ''}
      `.toLowerCase();
      
      return searchableText.includes(search);
    });
  }

  getTeacherStats(teacherId) {
    const teacherCourses = this.courses.filter(c => c.teacherId === teacherId);
    const studentsCount = teacherCourses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
    const lessonsCount = this.bookings.filter(b => 
      b.teacherId === teacherId && 
      b.status === BOOKING_STATUS.COMPLETED
    ).length;
    
    return {
      coursesCount: teacherCourses.length,
      studentsCount,
      lessonsCount
    };
  }

  // Actions

  handleSearch(event) {
    this.searchTerm = event.target.value;
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  async showAddTeacher() {
    const styleOptions = DANCE_STYLES.map(style => ({
      value: style,
      label: style
    }));

    Modal.form({
      title: 'Aggiungi Nuovo Maestro',
      size: 'large',
      fields: [
        { name: 'firstName', label: 'Nome', type: 'text', required: true },
        { name: 'lastName', label: 'Cognome', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Telefono', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { 
          name: 'specialties', 
          label: 'Specialità (seleziona multiple tenendo Ctrl)', 
          type: 'select',
          multiple: true,
          options: styleOptions,
          required: true 
        },
        { name: 'bio', label: 'Biografia', type: 'textarea', rows: 4 }
      ],
      onSubmit: async (formData) => {
        const newTeacher = {
          id: StringHelpers.generateId('teacher'),
          ...formData,
          password: btoa(formData.password),
          specialties: Array.isArray(formData.specialties) ? formData.specialties : [formData.specialties],
          availability: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          },
          rating: 0,
          courses: [],
          status: 'active',
          joinedDate: new Date().toISOString()
        };
        
        this.teachers.push(newTeacher);
        Storage.set(STORAGE_KEYS.TEACHERS, this.teachers);
        
        Toast.show('Maestro aggiunto con successo', 'success');
        this.render().then(html => {
          document.getElementById('page-content').innerHTML = html;
        });
      }
    });
  }

  async editTeacher(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    // Show edit form with availability management
    Toast.show('Modifica maestro in sviluppo', 'info');
  }

  async viewSchedule(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    const content = `
      <div class="teacher-schedule">
        <div id="teacher-calendar"></div>
      </div>
    `;
    
    Modal.create({
      title: `Calendario ${teacher.firstName} ${teacher.lastName}`,
      content: content,
      size: 'large',
      onOpen: () => {
        // Initialize calendar for teacher
        const calendar = new CalendarComponent('teacher-calendar', {
          view: CALENDAR_VIEWS.WEEK,
          filters: { teacherId },
          showControls: true,
          showFilters: false
        });
        calendar.render();
      }
    });
  }

  async viewTeacherDetails(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    const stats = this.getTeacherStats(teacherId);
    const teacherCourses = this.courses.filter(c => c.teacherId === teacherId);
    const recentBookings = this.bookings
      .filter(b => b.teacherId === teacherId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    const content = `
      <div class="teacher-details-modal">
        <div class="detail-header">
          <div class="avatar avatar-lg">
            ${StringHelpers.getInitials(teacher.firstName + ' ' + teacher.lastName)}
          </div>
          <div>
            <h3>${teacher.firstName} ${teacher.lastName}</h3>
            <p>${teacher.email} • ${teacher.phone}</p>
          </div>
        </div>
        
        <div class="detail-stats">
          <div class="stat-card">
            <span class="stat-value">${stats.coursesCount}</span>
            <span class="stat-label">Corsi Attivi</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.studentsCount}</span>
            <span class="stat-label">Studenti Totali</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.lessonsCount}</span>
            <span class="stat-label">Lezioni Private</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${teacher.rating ? teacher.rating.toFixed(1) : 'N/A'}</span>
            <span class="stat-label">Valutazione Media</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Corsi Attivi</h4>
          ${teacherCourses.length > 0 ? `
            <div class="courses-list">
              ${teacherCourses.map(course => `
                <div class="course-item">
                  <span class="course-name">${course.name}</span>
                  <span class="course-schedule">${StringHelpers.capitalize(course.schedule.dayOfWeek)} ${course.schedule.time}</span>
                  <span class="course-students">${course.enrolledStudents.length}/${course.maxStudents} studenti</span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-secondary">Nessun corso assegnato</p>'}
        </div>
        
        <div class="detail-section">
          <h4>Prenotazioni Recenti</h4>
          ${recentBookings.length > 0 ? `
            <div class="bookings-list">
              ${recentBookings.map(booking => `
                <div class="booking-item">
                  <span class="booking-date">${DateHelpers.formatDate(booking.date)}</span>
                  <span class="booking-time">${booking.time}</span>
                  <span class="status-indicator status-${booking.status}">
                    ${this.getBookingStatusLabel(booking.status)}
                  </span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-secondary">Nessuna prenotazione recente</p>'}
        </div>
      </div>
    `;
    
    Modal.create({
      title: 'Dettagli Maestro',
      content: content,
      size: 'large'
    });
  }

  async deleteTeacher(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    // Check if teacher has active courses
    const activeCourses = this.courses.filter(c => 
      c.teacherId === teacherId && c.status === COURSE_STATUS.ACTIVE
    );
    
    if (activeCourses.length > 0) {
      Toast.show('Impossibile eliminare: il maestro ha corsi attivi', 'error');
      return;
    }
    
    const confirmed = await Modal.confirm({
      title: 'Elimina Maestro',
      message: `Sei sicuro di voler eliminare ${teacher.firstName} ${teacher.lastName}?`,
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      const index = this.teachers.findIndex(t => t.id === teacherId);
      this.teachers.splice(index, 1);
      Storage.set(STORAGE_KEYS.TEACHERS, this.teachers);
      
      Toast.show('Maestro eliminato', 'success');
      this.render().then(html => {
        document.getElementById('page-content').innerHTML = html;
      });
    }
  }

  getBookingStatusLabel(status) {
    const labels = {
      [BOOKING_STATUS.PENDING]: 'In Attesa',
      [BOOKING_STATUS.CONFIRMED]: 'Confermata',
      [BOOKING_STATUS.CANCELLED]: 'Cancellata',
      [BOOKING_STATUS.COMPLETED]: 'Completata'
    };
    return labels[status] || status;
  }
}

// Create global instance
window.adminTeachersPage = new AdminTeachersPage();