// Admin Students Page - Boricua Dance Studio

class AdminStudentsPage {
  constructor() {
    this.students = [];
    this.filteredStudents = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
  }

  async render() {
    this.students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    this.filteredStudents = [...this.students];
    
    return `
      <div class="students-page">
        <!-- Header con azioni -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Allievi</h1>
            <p class="page-subtitle">Totale allievi: ${this.students.length}</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" onclick="adminStudentsPage.showAddStudent()">
              <span class="material-icons">person_add</span>
              Aggiungi Allievo
            </button>
            <button class="btn btn-outline" onclick="adminStudentsPage.exportStudents()">
              <span class="material-icons">download</span>
              Esporta
            </button>
          </div>
        </div>

        <!-- Filtri e ricerca -->
        <div class="filters-bar">
          <div class="search-box">
            <span class="material-icons">search</span>
            <input type="text" 
                   placeholder="Cerca per nome, cognome o email..." 
                   class="search-input"
                   onkeyup="adminStudentsPage.handleSearch(event)">
          </div>
          
          <div class="filter-buttons">
            <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                    onclick="adminStudentsPage.filterStudents('all')">
              Tutti (${this.students.length})
            </button>
            <button class="filter-btn ${this.currentFilter === 'active' ? 'active' : ''}" 
                    onclick="adminStudentsPage.filterStudents('active')">
              Attivi (${this.students.filter(s => s.status === STUDENT_STATUS.ACTIVE).length})
            </button>
            <button class="filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}" 
                    onclick="adminStudentsPage.filterStudents('pending')">
              In Attesa (${this.students.filter(s => s.status === STUDENT_STATUS.PENDING).length})
            </button>
            <button class="filter-btn ${this.currentFilter === 'inactive' ? 'active' : ''}" 
                    onclick="adminStudentsPage.filterStudents('inactive')">
              Inattivi (${this.students.filter(s => s.status === STUDENT_STATUS.INACTIVE).length})
            </button>
          </div>
        </div>

        <!-- Tabella allievi -->
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Allievo</th>
                <th>Email / Telefono</th>
                <th>Corsi</th>
                <th>Abbonamento</th>
                <th>Stato</th>
                <th>Iscritto dal</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredStudents.length > 0 ? 
                this.filteredStudents.map(student => this.renderStudentRow(student)).join('') :
                '<tr><td colspan="7" class="text-center text-secondary">Nessun allievo trovato</td></tr>'
              }
            </tbody>
          </table>
        </div>

        <!-- Pending requests alert -->
        ${this.renderPendingAlert()}
      </div>
    `;
  }

  renderStudentRow(student) {
    const subscriptions = Storage.get(STORAGE_KEYS.SUBSCRIPTIONS) || [];
    const activeSubscription = subscriptions.find(s => 
      s.studentId === student.id && 
      s.status === 'active' &&
      new Date(s.endDate) > new Date()
    );

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar avatar-sm">
              ${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}
            </div>
            <div>
              <div class="font-medium">${student.firstName} ${student.lastName}</div>
              <div class="text-sm text-secondary">${student.fiscalCode}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="contact-info">
            <div>${student.email}</div>
            <div class="text-sm text-secondary">${student.phone}</div>
          </div>
        </td>
        <td>
          <span class="badge">${student.courses?.length || 0} corsi</span>
        </td>
        <td>
          ${activeSubscription ? 
            `<span class="subscription-badge active">${activeSubscription.name}</span>` :
            '<span class="subscription-badge inactive">Nessuno</span>'
          }
        </td>
        <td>
          <span class="status-indicator status-${student.status}">
            ${this.getStatusLabel(student.status)}
          </span>
        </td>
        <td>
          <span class="text-secondary">${DateHelpers.formatDate(student.registrationDate)}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn" onclick="adminStudentsPage.viewStudent('${student.id}')" title="Visualizza">
              <span class="material-icons">visibility</span>
            </button>
            <button class="icon-btn" onclick="adminStudentsPage.editStudent('${student.id}')" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            ${student.status === STUDENT_STATUS.PENDING ? `
              <button class="icon-btn text-success" onclick="adminStudentsPage.approveStudent('${student.id}')" title="Approva">
                <span class="material-icons">check_circle</span>
              </button>
              <button class="icon-btn text-danger" onclick="adminStudentsPage.rejectStudent('${student.id}')" title="Rifiuta">
                <span class="material-icons">cancel</span>
              </button>
            ` : `
              <button class="icon-btn text-danger" onclick="adminStudentsPage.deleteStudent('${student.id}')" title="Elimina">
                <span class="material-icons">delete</span>
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }

  renderPendingAlert() {
    const pendingCount = this.students.filter(s => s.status === STUDENT_STATUS.PENDING).length;
    
    if (pendingCount === 0) return '';
    
    return `
      <div class="alert alert-warning mt-3">
        <span class="material-icons">warning</span>
        <div>
          <strong>Attenzione!</strong> Ci sono ${pendingCount} richieste di iscrizione in attesa di approvazione.
          <button class="btn btn-sm btn-outline ml-2" onclick="adminStudentsPage.filterStudents('pending')">
            Visualizza
          </button>
        </div>
      </div>
    `;
  }

  getStatusLabel(status) {
    const labels = {
      [STUDENT_STATUS.ACTIVE]: 'Attivo',
      [STUDENT_STATUS.INACTIVE]: 'Inattivo',
      [STUDENT_STATUS.PENDING]: 'In Attesa',
      [STUDENT_STATUS.SUSPENDED]: 'Sospeso'
    };
    return labels[status] || status;
  }

  // Handlers

  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterStudents(filter) {
    this.currentFilter = filter;
    this.applyFilters();
    
    // Update UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase().includes(filter));
    });
  }

  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      // Apply status filter
      if (this.currentFilter !== 'all' && student.status !== this.currentFilter) {
        return false;
      }
      
      // Apply search filter
      if (this.searchTerm) {
        const searchableText = `
          ${student.firstName} 
          ${student.lastName} 
          ${student.email} 
          ${student.phone} 
          ${student.fiscalCode}
        `.toLowerCase();
        
        if (!searchableText.includes(this.searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
    
    // Re-render table
    this.updateTable();
  }

  updateTable() {
    const tbody = document.querySelector('.table tbody');
    if (tbody) {
      tbody.innerHTML = this.filteredStudents.length > 0 ? 
        this.filteredStudents.map(student => this.renderStudentRow(student)).join('') :
        '<tr><td colspan="7" class="text-center text-secondary">Nessun allievo trovato</td></tr>';
    }
  }

  // Actions

  async showAddStudent() {
    const modal = Modal.form({
      title: 'Aggiungi Nuovo Allievo',
      size: 'large',
      fields: [
        { name: 'firstName', label: 'Nome', type: 'text', required: true },
        { name: 'lastName', label: 'Cognome', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Telefono', type: 'text', required: true },
        { name: 'birthDate', label: 'Data di Nascita', type: 'date', required: true },
        { name: 'birthPlace', label: 'Luogo di Nascita', type: 'text', required: true },
        { name: 'fiscalCode', label: 'Codice Fiscale', type: 'text', required: true },
        { name: 'address', label: 'Indirizzo', type: 'text', required: true },
        { name: 'city', label: 'Città', type: 'text', required: true },
        { name: 'postalCode', label: 'CAP', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'notes', label: 'Note', type: 'textarea', rows: 3 }
      ],
      validationRules: Validators.getStudentValidationRules(),
      onSubmit: async (formData) => {
        const newStudent = {
          id: StringHelpers.generateId('student'),
          ...formData,
          password: btoa(formData.password),
          status: STUDENT_STATUS.ACTIVE,
          registrationDate: new Date().toISOString(),
          courses: [],
          subscriptions: [],
          points: 0,
          badges: []
        };
        
        this.students.push(newStudent);
        Storage.set(STORAGE_KEYS.STUDENTS, this.students);
        
        Toast.show('Allievo aggiunto con successo', 'success');
        this.render().then(html => {
          document.getElementById('page-content').innerHTML = html;
        });
      }
    });
  }

  async viewStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;
    
    // Navigate to student detail page
    window.app.router.navigate(`/admin/students/${studentId}`);
  }

  async editStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;
    
    const modal = Modal.form({
      title: 'Modifica Allievo',
      size: 'large',
      fields: [
        { name: 'firstName', label: 'Nome', type: 'text', value: student.firstName, required: true },
        { name: 'lastName', label: 'Cognome', type: 'text', value: student.lastName, required: true },
        { name: 'email', label: 'Email', type: 'email', value: student.email, required: true },
        { name: 'phone', label: 'Telefono', type: 'text', value: student.phone, required: true },
        { name: 'birthDate', label: 'Data di Nascita', type: 'date', value: student.birthDate, required: true },
        { name: 'birthPlace', label: 'Luogo di Nascita', type: 'text', value: student.birthPlace, required: true },
        { name: 'fiscalCode', label: 'Codice Fiscale', type: 'text', value: student.fiscalCode, required: true },
        { name: 'address', label: 'Indirizzo', type: 'text', value: student.address, required: true },
        { name: 'city', label: 'Città', type: 'text', value: student.city, required: true },
        { name: 'postalCode', label: 'CAP', type: 'text', value: student.postalCode, required: true },
        { 
          name: 'status', 
          label: 'Stato', 
          type: 'select', 
          value: student.status,
          options: [
            { value: STUDENT_STATUS.ACTIVE, label: 'Attivo' },
            { value: STUDENT_STATUS.INACTIVE, label: 'Inattivo' },
            { value: STUDENT_STATUS.SUSPENDED, label: 'Sospeso' }
          ]
        },
        { name: 'notes', label: 'Note', type: 'textarea', value: student.notes || '', rows: 3 }
      ],
      onSubmit: async (formData) => {
        Object.assign(student, formData);
        Storage.set(STORAGE_KEYS.STUDENTS, this.students);
        
        Toast.show('Allievo modificato con successo', 'success');
        this.updateTable();
      }
    });
  }

  async approveStudent(studentId) {
    const confirmed = await Modal.confirm({
      title: 'Approva Iscrizione',
      message: 'Vuoi approvare questa richiesta di iscrizione?',
      confirmText: 'Approva',
      confirmClass: 'btn-success'
    });
    
    if (confirmed) {
      const student = this.students.find(s => s.id === studentId);
      if (student) {
        student.status = STUDENT_STATUS.ACTIVE;
        Storage.set(STORAGE_KEYS.STUDENTS, this.students);
        
        // Create welcome notification
        NotificationService.createInAppNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          title: 'Benvenuto in Boricua Dance Studio!',
          message: 'La tua iscrizione è stata approvata. Ora puoi accedere a tutti i servizi.',
          targetRole: USER_ROLES.STUDENT,
          data: { studentId }
        });
        
        Toast.show('Iscrizione approvata', 'success');
        this.applyFilters();
      }
    }
  }

  async rejectStudent(studentId) {
    const reason = await Modal.prompt({
      title: 'Rifiuta Iscrizione',
      message: 'Motivo del rifiuto (opzionale):',
      placeholder: 'Inserisci il motivo...'
    });
    
    if (reason !== null) {
      const index = this.students.findIndex(s => s.id === studentId);
      if (index !== -1) {
        this.students.splice(index, 1);
        Storage.set(STORAGE_KEYS.STUDENTS, this.students);
        
        Toast.show('Iscrizione rifiutata', 'info');
        this.applyFilters();
      }
    }
  }

  async deleteStudent(studentId) {
    const confirmed = await Modal.confirm({
      title: 'Elimina Allievo',
      message: 'Sei sicuro di voler eliminare questo allievo? Questa azione non può essere annullata.',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      const index = this.students.findIndex(s => s.id === studentId);
      if (index !== -1) {
        this.students.splice(index, 1);
        Storage.set(STORAGE_KEYS.STUDENTS, this.students);
        
        // Remove related data
        this.removeStudentData(studentId);
        
        Toast.show('Allievo eliminato', 'success');
        this.applyFilters();
      }
    }
  }

  removeStudentData(studentId) {
    // Remove from courses
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    courses.forEach(course => {
      course.enrolledStudents = course.enrolledStudents.filter(id => id !== studentId);
    });
    Storage.set(STORAGE_KEYS.COURSES, courses);
    
    // Remove bookings
    let bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    bookings = bookings.filter(b => b.studentId !== studentId);
    Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
    
    // Remove attendance
    let attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    attendance = attendance.filter(a => a.studentId !== studentId);
    Storage.set(STORAGE_KEYS.ATTENDANCE, attendance);
    
    // Remove payments
    let payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    payments = payments.filter(p => p.studentId !== studentId);
    Storage.set(STORAGE_KEYS.PAYMENTS, payments);
    
    // Remove subscriptions
    let subscriptions = Storage.get(STORAGE_KEYS.SUBSCRIPTIONS) || [];
    subscriptions = subscriptions.filter(s => s.studentId !== studentId);
    Storage.set(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    
    // Remove gamification data
    GamificationService.resetStudentGamification(studentId);
  }

  exportStudents() {
    const exportOptions = [
      { value: 'csv', label: 'CSV' },
      { value: 'json', label: 'JSON' },
      { value: 'pdf', label: 'PDF' }
    ];
    
    Modal.form({
      title: 'Esporta Allievi',
      fields: [
        { 
          name: 'format', 
          label: 'Formato', 
          type: 'select', 
          options: exportOptions,
          required: true 
        },
        {
          name: 'filters',
          label: 'Applica filtri correnti',
          type: 'checkbox',
          checked: true
        }
      ],
      onSubmit: (formData) => {
        const dataToExport = formData.filters ? this.filteredStudents : this.students;
        
        switch (formData.format) {
          case 'csv':
            BackupService.exportCollectionAsCSV(STORAGE_KEYS.STUDENTS, 'allievi');
            break;
          case 'json':
            BackupService.downloadJSON({ students: dataToExport }, 'allievi');
            break;
          case 'pdf':
            Toast.show('Export PDF in sviluppo', 'info');
            break;
        }
      }
    });
  }

  // Initialize
  init() {
    // Set up periodic refresh
    this.refreshInterval = setInterval(() => {
      this.students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
      this.applyFilters();
    }, 30000); // Refresh every 30 seconds
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Create global instance
window.adminStudentsPage = new AdminStudentsPage();