// Admin Teachers Page - Boricua Dance Studio

class AdminTeachersPage {
  constructor() {
    this.services = null;
    this.teachers = [];
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

      switch (actionName) {
        case 'add-teacher':
          this.addTeacher();
          break;
        case 'edit-teacher':
          this.editTeacher(actionId);
          break;
        case 'delete-teacher':
          this.deleteTeacher(actionId);
          break;
        case 'view-teacher-schedule':
          this.viewTeacherSchedule(actionId);
          break;
      }
    });
  }

  async render() {
    this.teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    return `
      <div class="teachers-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Insegnanti</h1>
            <p class="page-subtitle">Aggiungi e gestisci gli insegnanti della scuola</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" data-action="add-teacher">
              <span class="material-icons">person_add</span>
              Aggiungi Insegnante
            </button>
          </div>
        </div>

        <!-- Teachers List -->
        <div class="table-container mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Insegnante</th>
                <th>Contatti</th>
                <th>Specializzazione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody id="teachers-table-body">
              ${this.renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTableBody() {
    if (this.teachers.length === 0) {
      return `<tr><td colspan="4" class="text-center text-secondary">Nessun insegnante trovato.</td></tr>`;
    }
    return this.teachers.map(teacher => this.renderTeacherRow(teacher)).join('');
  }

  renderTeacherRow(teacher) {
    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar">${StringHelpers.getInitials(teacher.name)}</div>
            <div>
              <div class="font-medium">${teacher.name}</div>
              <div class="text-sm text-secondary">ID: ${teacher.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${teacher.email}</div>
          <div class="text-sm text-secondary">${teacher.phone || 'N/D'}</div>
        </td>
        <td>${teacher.specialization || 'N/D'}</td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn" data-action="view-teacher-schedule" data-id="${teacher.id}" title="Vedi Orari">
              <span class="material-icons">calendar_month</span>
            </button>
            <button class="icon-btn" data-action="edit-teacher" data-id="${teacher.id}" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn text-danger" data-action="delete-teacher" data-id="${teacher.id}" title="Elimina">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Actions
  addTeacher() {
    this.showTeacherForm();
  }

  editTeacher(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (teacher) {
      this.showTeacherForm(teacher);
    }
  }

  async deleteTeacher(teacherId) {
    const confirmed = await this.services.modal.confirm({
      title: 'Elimina Insegnante',
      message: 'Sei sicuro di voler eliminare questo insegnante? Questa azione è irreversibile.',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });

    if (confirmed) {
      this.teachers = this.teachers.filter(t => t.id !== teacherId);
      Storage.set(STORAGE_KEYS.TEACHERS, this.teachers);
      this.services.toast.show('Insegnante eliminato con successo.', 'success');
      this.refreshTable();
    }
  }

  viewTeacherSchedule(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    this.services.modal.create({
      title: `Orari di ${teacher.name}`,
      content: `<p>Funzionalità di visualizzazione orari non ancora implementata.</p>`,
      actions: [{ text: 'Chiudi', class: 'btn-primary', onClick: () => true }]
    });
  }

  showTeacherForm(teacher = null) {
    this.services.modal.form({
      title: teacher ? 'Modifica Insegnante' : 'Aggiungi Insegnante',
      fields: [
        { name: 'name', label: 'Nome Completo', value: teacher?.name || '', required: true },
        { name: 'email', label: 'Email', type: 'email', value: teacher?.email || '', required: true },
        { name: 'phone', label: 'Telefono', type: 'tel', value: teacher?.phone || '' },
        { name: 'specialization', label: 'Specializzazione (es. Salsa, Bachata)', value: teacher?.specialization || '' }
      ],
      onSubmit: (formData) => {
        if (teacher) {
          // Update
          const index = this.teachers.findIndex(t => t.id === teacher.id);
          this.teachers[index] = { ...this.teachers[index], ...formData };
          this.services.toast.show('Insegnante aggiornato con successo.', 'success');
        } else {
          // Create
          const newTeacher = {
            id: StringHelpers.generateId('teacher'),
            ...formData
          };
          this.teachers.push(newTeacher);
          this.services.toast.show('Insegnante aggiunto con successo.', 'success');
        }
        Storage.set(STORAGE_KEYS.TEACHERS, this.teachers);
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    document.getElementById('teachers-table-body').innerHTML = this.renderTableBody();
  }
}

window.adminTeachersPage = new AdminTeachersPage();