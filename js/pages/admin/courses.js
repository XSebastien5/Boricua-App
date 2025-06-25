// Admin Courses Page - Boricua Dance Studio

class AdminCoursesPage {
  constructor() {
    this.courses = [];
    this.teachers = [];
    this.currentView = 'grid'; // grid or list
  }

  async render() {
    this.courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    this.teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    
    return `
      <div class="courses-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Corsi</h1>
            <p class="page-subtitle">
              ${this.courses.filter(c => c.status === COURSE_STATUS.ACTIVE).length} corsi attivi
            </p>
          </div>
          <div class="page-header-actions">
            <div class="view-toggle">
              <button class="icon-btn ${this.currentView === 'grid' ? 'active' : ''}" 
                      onclick="adminCoursesPage.toggleView('grid')"
                      title="Vista griglia">
                <span class="material-icons">grid_view</span>
              </button>
              <button class="icon-btn ${this.currentView === 'list' ? 'active' : ''}" 
                      onclick="adminCoursesPage.toggleView('list')"
                      title="Vista lista">
                <span class="material-icons">list</span>
              </button>
            </div>
            <button class="btn btn-primary" onclick="adminCoursesPage.showAddCourse()">
              <span class="material-icons">add</span>
              Nuovo Corso
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="course-stats">
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">school</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Totale Corsi</div>
              <div class="stat-value">${this.courses.length}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">people</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Studenti Iscritti</div>
              <div class="stat-value">${this.getTotalEnrolledStudents()}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">euro</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Entrate Mensili</div>
              <div class="stat-value">${this.getMonthlyRevenue()}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">trending_up</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Tasso Occupazione</div>
              <div class="stat-value">${this.getOccupancyRate()}%</div>
            </div>
          </div>
        </div>

        <!-- Courses View -->
        ${this.currentView === 'grid' ? this.renderGridView() : this.renderListView()}
      </div>
    `;
  }

  renderGridView() {
    return `
      <div class="courses-grid">
        ${this.courses.map(course => this.renderCourseCard(course)).join('')}
      </div>
    `;
  }

  renderCourseCard(course) {
    const teacher = this.teachers.find(t => t.id === course.teacherId);
    const occupancy = Math.round((course.enrolledStudents.length / course.maxStudents) * 100);
    
    return `
      <div class="course-card ${course.status !== COURSE_STATUS.ACTIVE ? 'inactive' : ''}">
        <div class="course-card-header">
          <div class="course-style-badge" style="background-color: ${CalendarService.getCourseColor(course.style)}">
            ${course.style}
          </div>
          <div class="course-status">
            <span class="status-indicator status-${course.status}">
              ${this.getStatusLabel(course.status)}
            </span>
          </div>
        </div>
        
        <div class="course-card-body">
          <h3 class="course-name">${course.name}</h3>
          <p class="course-level">Livello: ${course.level}</p>
          
          <div class="course-info">
            <div class="info-item">
              <span class="material-icons">person</span>
              <span>${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="material-icons">schedule</span>
              <span>${StringHelpers.capitalize(course.schedule.dayOfWeek)} ${course.schedule.time}</span>
            </div>
            <div class="info-item">
              <span class="material-icons">location_on</span>
              <span>${course.location}</span>
            </div>
          </div>
          
          <div class="course-occupancy">
            <div class="occupancy-header">
              <span>Occupazione</span>
              <span>${course.enrolledStudents.length}/${course.maxStudents}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${occupancy}%"></div>
            </div>
          </div>
          
          <div class="course-dates">
            <span class="material-icons">calendar_today</span>
            <span>${DateHelpers.formatDate(course.startDate)} - ${DateHelpers.formatDate(course.endDate)}</span>
          </div>
        </div>
        
        <div class="course-card-footer">
          <div class="course-price">€${course.price}/mese</div>
          <div class="course-actions">
            <button class="icon-btn" onclick="adminCoursesPage.viewCourse('${course.id}')" title="Visualizza">
              <span class="material-icons">visibility</span>
            </button>
            <button class="icon-btn" onclick="adminCoursesPage.editCourse('${course.id}')" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn" onclick="adminCoursesPage.manageCourseMapping('${course.id}')" title="Course Mapping">
              <span class="material-icons">map</span>
            </button>
            <button class="icon-btn text-danger" onclick="adminCoursesPage.deleteCourse('${course.id}')" title="Elimina">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderListView() {
    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Corso</th>
              <th>Maestro</th>
              <th>Orario</th>
              <th>Studenti</th>
              <th>Periodo</th>
              <th>Prezzo</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${this.courses.map(course => this.renderCourseRow(course)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderCourseRow(course) {
    const teacher = this.teachers.find(t => t.id === course.teacherId);
    
    return `
      <tr>
        <td>
          <div>
            <div class="font-medium">${course.name}</div>
            <div class="text-sm text-secondary">${course.style} - ${course.level}</div>
          </div>
        </td>
        <td>${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}</td>
        <td>
          <div>
            <div>${StringHelpers.capitalize(course.schedule.dayOfWeek)}</div>
            <div class="text-sm text-secondary">${course.schedule.time} (${course.schedule.duration} min)</div>
          </div>
        </td>
        <td>
          <div class="progress-info">
            <span>${course.enrolledStudents.length}/${course.maxStudents}</span>
            <div class="progress-bar small">
              <div class="progress-fill" 
                   style="width: ${(course.enrolledStudents.length / course.maxStudents) * 100}%"></div>
            </div>
          </div>
        </td>
        <td>
          <div class="text-sm">
            <div>${DateHelpers.formatDate(course.startDate)}</div>
            <div>${DateHelpers.formatDate(course.endDate)}</div>
          </div>
        </td>
        <td>€${course.price}</td>
        <td>
          <span class="status-indicator status-${course.status}">
            ${this.getStatusLabel(course.status)}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn" onclick="adminCoursesPage.viewCourse('${course.id}')" title="Visualizza">
              <span class="material-icons">visibility</span>
            </button>
            <button class="icon-btn" onclick="adminCoursesPage.editCourse('${course.id}')" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn text-danger" onclick="adminCoursesPage.deleteCourse('${course.id}')" title="Elimina">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Utility methods

  getStatusLabel(status) {
    const labels = {
      [COURSE_STATUS.ACTIVE]: 'Attivo',
      [COURSE_STATUS.INACTIVE]: 'Inattivo',
      [COURSE_STATUS.COMPLETED]: 'Completato',
      [COURSE_STATUS.CANCELLED]: 'Cancellato'
    };
    return labels[status] || status;
  }

  getTotalEnrolledStudents() {
    return this.courses.reduce((total, course) => total + course.enrolledStudents.length, 0);
  }

  getMonthlyRevenue() {
    const revenue = this.courses
      .filter(c => c.status === COURSE_STATUS.ACTIVE)
      .reduce((total, course) => total + (course.price * course.enrolledStudents.length), 0);
    
    return NumberHelpers.formatCurrency(revenue);
  }

  getOccupancyRate() {
    const activeCourses = this.courses.filter(c => c.status === COURSE_STATUS.ACTIVE);
    if (activeCourses.length === 0) return 0;
    
    const totalCapacity = activeCourses.reduce((total, course) => total + course.maxStudents, 0);
    const totalEnrolled = activeCourses.reduce((total, course) => total + course.enrolledStudents.length, 0);
    
    return Math.round((totalEnrolled / totalCapacity) * 100);
  }

  // Actions

  toggleView(view) {
    this.currentView = view;
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  async showAddCourse() {
    const teacherOptions = this.teachers.map(t => ({
      value: t.id,
      label: `${t.firstName} ${t.lastName}`
    }));

    const styleOptions = DANCE_STYLES.map(style => ({
      value: style,
      label: style
    }));

    const dayOptions = [
      { value: 'monday', label: 'Lunedì' },
      { value: 'tuesday', label: 'Martedì' },
      { value: 'wednesday', label: 'Mercoledì' },
      { value: 'thursday', label: 'Giovedì' },
      { value: 'friday', label: 'Venerdì' },
      { value: 'saturday', label: 'Sabato' },
      { value: 'sunday', label: 'Domenica' }
    ];

    Modal.form({
      title: 'Nuovo Corso',
      size: 'large',
      fields: [
        { name: 'name', label: 'Nome Corso', type: 'text', required: true },
        { name: 'description', label: 'Descrizione', type: 'textarea', rows: 3, required: true },
        { name: 'style', label: 'Stile', type: 'select', options: styleOptions, required: true },
        { 
          name: 'level', 
          label: 'Livello', 
          type: 'select', 
          options: [
            { value: 'Principiante', label: 'Principiante' },
            { value: 'Intermedio', label: 'Intermedio' },
            { value: 'Avanzato', label: 'Avanzato' },
            { value: 'Tutti i livelli', label: 'Tutti i livelli' }
          ],
          required: true 
        },
        { name: 'teacherId', label: 'Maestro', type: 'select', options: teacherOptions, required: true },
        { name: 'startDate', label: 'Data Inizio', type: 'date', required: true },
        { name: 'endDate', label: 'Data Fine', type: 'date', required: true },
        { name: 'dayOfWeek', label: 'Giorno', type: 'select', options: dayOptions, required: true },
        { name: 'time', label: 'Orario', type: 'time', required: true },
        { name: 'duration', label: 'Durata (minuti)', type: 'number', value: 60, min: 30, max: 180, required: true },
        { name: 'location', label: 'Sala', type: 'text', required: true },
        { name: 'maxStudents', label: 'Max Studenti', type: 'number', min: 1, max: 50, required: true },
        { name: 'price', label: 'Prezzo Mensile (€)', type: 'number', min: 0, required: true },
        { name: 'requirements', label: 'Requisiti', type: 'textarea', rows: 2 }
      ],
      validationRules: Validators.getCourseValidationRules(),
      onSubmit: async (formData) => {
        const newCourse = {
          id: StringHelpers.generateId('course'),
          name: formData.name,
          description: formData.description,
          teacherId: formData.teacherId,
          level: formData.level,
          style: formData.style,
          startDate: formData.startDate,
          endDate: formData.endDate,
          schedule: {
            dayOfWeek: formData.dayOfWeek,
            time: formData.time,
            duration: parseInt(formData.duration)
          },
          maxStudents: parseInt(formData.maxStudents),
          enrolledStudents: [],
          price: parseFloat(formData.price),
          status: COURSE_STATUS.ACTIVE,
          location: formData.location,
          requirements: formData.requirements || ''
        };
        
        this.courses.push(newCourse);
        Storage.set(STORAGE_KEYS.COURSES, this.courses);
        
        Toast.show('Corso creato con successo', 'success');
        this.render().then(html => {
          document.getElementById('page-content').innerHTML = html;
        });
      }
    });
  }

  async viewCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    const teacher = this.teachers.find(t => t.id === course.teacherId);
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const enrolledStudents = students.filter(s => course.enrolledStudents.includes(s.id));

    const content = `
      <div class="course-details">
        <h3>${course.name}</h3>
        <div class="course-info-grid">
          <div class="info-section">
            <h4>Informazioni Generali</h4>
            <p><strong>Stile:</strong> ${course.style}</p>
            <p><strong>Livello:</strong> ${course.level}</p>
            <p><strong>Maestro:</strong> ${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}</p>
            <p><strong>Sala:</strong> ${course.location}</p>
            <p><strong>Prezzo:</strong> €${course.price}/mese</p>
          </div>
          
          <div class="info-section">
            <h4>Orario e Periodo</h4>
            <p><strong>Giorno:</strong> ${StringHelpers.capitalize(course.schedule.dayOfWeek)}</p>
            <p><strong>Orario:</strong> ${course.schedule.time}</p>
            <p><strong>Durata:</strong> ${course.schedule.duration} minuti</p>
            <p><strong>Inizio:</strong> ${DateHelpers.formatDate(course.startDate, 'long')}</p>
            <p><strong>Fine:</strong> ${DateHelpers.formatDate(course.endDate, 'long')}</p>
          </div>
        </div>
        
        <div class="enrolled-students mt-3">
          <h4>Studenti Iscritti (${enrolledStudents.length}/${course.maxStudents})</h4>
          ${enrolledStudents.length > 0 ? `
            <div class="students-list">
              ${enrolledStudents.map(student => `
                <div class="student-item">
                  <div class="avatar avatar-sm">
                    ${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}
                  </div>
                  <span>${student.firstName} ${student.lastName}</span>
                  <span class="text-secondary">${student.email}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-secondary">Nessuno studente iscritto</p>'}
        </div>
      </div>
    `;

    Modal.create({
      title: 'Dettagli Corso',
      content: content,
      size: 'large',
      actions: [
        {
          text: 'Chiudi',
          class: 'btn-primary',
          onClick: () => true
        }
      ]
    });
  }

  async editCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    const teacherOptions = this.teachers.map(t => ({
      value: t.id,
      label: `${t.firstName} ${t.lastName}`
    }));

    // Similar form to add but with existing values
    // Implementation similar to showAddCourse but with course data pre-filled
    Toast.show('Modifica corso in sviluppo', 'info');
  }

  async deleteCourse(courseId) {
    const confirmed = await Modal.confirm({
      title: 'Elimina Corso',
      message: 'Sei sicuro di voler eliminare questo corso?',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });

    if (confirmed) {
      const index = this.courses.findIndex(c => c.id === courseId);
      if (index !== -1) {
        this.courses.splice(index, 1);
        Storage.set(STORAGE_KEYS.COURSES, this.courses);
        
        Toast.show('Corso eliminato', 'success');
        this.render().then(html => {
          document.getElementById('page-content').innerHTML = html;
        });
      }
    }
  }

  manageCourseMapping(courseId) {
    window.app.router.navigate(`${ROUTES.ADMIN_COURSE_MAPPING}?courseId=${courseId}`);
  }
}

// Create global instance
window.adminCoursesPage = new AdminCoursesPage();