// Admin Students Page - Boricua Dance Studio

class AdminStudentsPage {
  constructor() {
    this.services = null;
    this.students = [];
    this.filter = 'all';
    this.searchTerm = '';
  }

  init(services) {
    this.services = services;
    this.addEventListeners();
  }

  addEventListeners() {
    const pageContent = document.getElementById('page-content');
    pageContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;

      const actionName = action.dataset.action;
      const actionId = action.dataset.id;
      const actionFilter = action.dataset.filter;

      switch (actionName) {
        case 'add-student':
          this.addStudent();
          break;
        case 'export-students':
          this.exportStudents();
          break;
        case 'filter-students':
          this.filterStudents(actionFilter);
          break;
        case 'view-student':
          this.viewStudent(actionId);
          break;
        case 'edit-student':
          this.editStudent(actionId);
          break;
        case 'delete-student':
          this.deleteStudent(actionId);
          break;
      }
    });

    pageContent.addEventListener('keyup', (event) => {
        const action = event.target.closest('[data-action]');
        if (!action || action.dataset.action !== 'search-students') return;
        this.handleSearch(event);
    });
  }

  async render() {
    this.students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const stats = this.calculateStats();

    return `
      <div class="students-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Allievi</h1>
            <p class="page-subtitle">Visualizza, aggiungi e gestisci gli allievi della scuola</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" data-action="add-student">
              <span class="material-icons">person_add</span>
              Aggiungi Allievo
            </button>
            <button class="btn btn-outline" data-action="export-students">
              <span class="material-icons">download</span>
              Esporta
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="student-stats">
          <div class="stat-card">
            <div class="stat-icon primary"><span class="material-icons">groups</span></div>
            <div class="stat-content">
              <div class="stat-label">Allievi Totali</div>
              <div class="stat-value">${stats.total}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success"><span class="material-icons">how_to_reg</span></div>
            <div class="stat-content">
              <div class="stat-label">Allievi Attivi</div>
              <div class="stat-value">${stats.active}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning"><span class="material-icons">history</span></div>
            <div class="stat-content">
              <div class="stat-label">Allievi In Prova</div>
              <div class="stat-value">${stats.trial}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger"><span class="material-icons">no_accounts</span></div>
            <div class="stat-content">
              <div class="stat-label">Allievi Inattivi</div>
              <div class="stat-value">${stats.inactive}</div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="filters-bar mt-3">
          <div class="search-box">
            <span class="material-icons">search</span>
            <input type="text" 
                   placeholder="Cerca per nome, email o telefono..." 
                   class="search-input"
                   value="${this.searchTerm}"
                   data-action="search-students">
          </div>
          <div class="filter-buttons">
            <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" data-action="filter-students" data-filter="all">Tutti</button>
            <button class="filter-btn ${this.filter === 'active' ? 'active' : ''}" data-action="filter-students" data-filter="active">Attivi</button>
            <button class="filter-btn ${this.filter === 'trial' ? 'active' : ''}" data-action="filter-students" data-filter="trial">In Prova</button>
            <button class="filter-btn ${this.filter === 'inactive' ? 'active' : ''}" data-action="filter-students" data-filter="inactive">Inattivi</button>
          </div>
        </div>

        <!-- Students Table -->
        <div class="table-container mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Allievo</th>
                <th>Contatti</th>
                <th>Stato</th>
                <th>Iscrizione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              ${this.renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTableBody() {
    const filteredStudents = this.getFilteredStudents();
    if (filteredStudents.length === 0) {
      return `<tr><td colspan="5" class="text-center text-secondary">Nessun allievo trovato.</td></tr>`;
    }
    return filteredStudents.map(student => this.renderStudentRow(student)).join('');
  }

  renderStudentRow(student) {
    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar">${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}</div>
            <div>
              <div class="font-medium">${student.firstName} ${student.lastName}</div>
              <div class="text-sm text-secondary">ID: ${student.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${student.email}</div>
          <div class="text-sm text-secondary">${student.phone || 'N/D'}</div>
        </td>
        <td>
          <span class="status-indicator status-${student.status}">
            ${this.getStatusLabel(student.status)}
          </span>
        </td>
        <td>${DateHelpers.formatDate(student.registrationDate)}</td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn" data-action="view-student" data-id="${student.id}" title="Visualizza">
              <span class="material-icons">visibility</span>
            </button>
            <button class="icon-btn" data-action="edit-student" data-id="${student.id}" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn text-danger" data-action="delete-student" data-id="${student.id}" title="Elimina">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Actions
  addStudent() {
    this.showStudentForm();
  }

  editStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      this.showStudentForm(student);
    }
  }

  async deleteStudent(studentId) {
    const confirmed = await this.services.modal.confirm({
      title: 'Elimina Allievo',
      message: 'Sei sicuro di voler eliminare questo allievo? Questa azione è irreversibile e cancellerà anche i dati associati.',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });

    if (confirmed) {
      this.students = this.students.filter(s => s.id !== studentId);
      Storage.set(STORAGE_KEYS.STUDENTS, this.students);
      this.services.toast.show('Allievo eliminato con successo.', 'success');
      this.refreshTable();
    }
  }

  viewStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    // Dummy data for demo
    const lastLesson = "Corso Salsa Base - 15/06/2024";
    const nextLesson = "Corso Bachata Int. - 22/06/2024";
    const activeSubscription = "Abbonamento Mensile Open";

    const content = `
      <div class="student-details-modal">
        <div class="student-header">
          <div class="avatar avatar-lg">${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}</div>
          <div>
            <h3>${student.firstName} ${student.lastName}</h3>
            <p class="text-secondary">${student.email}</p>
          </div>
        </div>
        <div class="student-info-grid">
          <div><strong>Telefono:</strong> ${student.phone || 'N/D'}</div>
          <div><strong>Stato:</strong> <span class="status-indicator status-${student.status}">${this.getStatusLabel(student.status)}</span></div>
          <div><strong>Iscrizione:</strong> ${DateHelpers.formatDate(student.registrationDate)}</div>
          <div><strong>Nato/a il:</strong> ${student.birthDate ? DateHelpers.formatDate(student.birthDate) : 'N/D'}</div>
        </div>
        <hr>
        <h4>Attività Recente</h4>
        <p><strong>Ultima Lezione:</strong> ${lastLesson}</p>
        <p><strong>Prossima Lezione:</strong> ${nextLesson}</p>
        <p><strong>Abbonamento Attivo:</strong> ${activeSubscription}</p>
      </div>
    `;

    this.services.modal.create({
      title: 'Dettaglio Allievo',
      content: content,
      actions: [
        { text: 'Chiudi', class: 'btn-primary', onClick: () => true }
      ]
    });
  }

  showStudentForm(student = null) {
    this.services.modal.form({
      title: student ? 'Modifica Allievo' : 'Aggiungi Allievo',
      size: 'large',
      fields: [
        { name: 'firstName', label: 'Nome', value: student?.firstName || '', required: true },
        { name: 'lastName', label: 'Cognome', value: student?.lastName || '', required: true },
        { name: 'email', label: 'Email', type: 'email', value: student?.email || '', required: true },
        { name: 'phone', label: 'Telefono', type: 'tel', value: student?.phone || '' },
        { name: 'birthDate', label: 'Data di Nascita', type: 'date', value: student?.birthDate || '' },
        { name: 'status', label: 'Stato', type: 'select', options: Object.values(STUDENT_STATUS).map(s => ({ value: s, label: this.getStatusLabel(s) })), value: student?.status || STUDENT_STATUS.ACTIVE, required: true }
      ],
      onSubmit: (formData) => {
        if (student) {
          // Update
          const index = this.students.findIndex(s => s.id === student.id);
          this.students[index] = { ...this.students[index], ...formData };
          this.services.toast.show('Allievo aggiornato con successo.', 'success');
        } else {
          // Create
          const newStudent = {
            id: StringHelpers.generateId('student'),
            ...formData,
            registrationDate: new Date().toISOString(),
            level: 'beginner', // default
            notes: ''
          };
          this.students.push(newStudent);
          this.services.toast.show('Allievo aggiunto con successo.', 'success');
        }
        Storage.set(STORAGE_KEYS.STUDENTS, this.students);
        this.refreshTable();
      }
    });
  }

  exportStudents() {
    this.services.backup.exportCollectionAsCSV(STORAGE_KEYS.STUDENTS, 'allievi');
  }

  filterStudents(filter) {
    this.filter = filter;
    this.refreshTable();
    // Update active button
    document.querySelectorAll('.filter-buttons .filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[data-filter="${filter}"]`).classList.add('active');
  }

  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
    this.refreshTable();
  }

  refreshTable() {
    document.getElementById('students-table-body').innerHTML = this.renderTableBody();
  }

  // Helpers
  calculateStats() {
    return {
      total: this.students.length,
      active: this.students.filter(s => s.status === STUDENT_STATUS.ACTIVE).length,
      inactive: this.students.filter(s => s.status === STUDENT_STATUS.INACTIVE).length,
      trial: this.students.filter(s => s.status === STUDENT_STATUS.TRIAL).length,
    };
  }

  getFilteredStudents() {
    let filtered = this.students;

    if (this.filter !== 'all') {
      filtered = filtered.filter(s => s.status === this.filter);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(this.searchTerm) ||
        s.lastName.toLowerCase().includes(this.searchTerm) ||
        s.email.toLowerCase().includes(this.searchTerm) ||
        (s.phone && s.phone.includes(this.searchTerm))
      );
    }

    return filtered;
  }

  getStatusLabel(status) {
    const labels = {
      [STUDENT_STATUS.ACTIVE]: 'Attivo',
      [STUDENT_STATUS.INACTIVE]: 'Inattivo',
      [STUDENT_STATUS.TRIAL]: 'In Prova',
      [STUDENT_STATUS.SUSPENDED]: 'Sospeso'
    };
    return labels[status] || status;
  }
}

window.adminStudentsPage = new AdminStudentsPage();