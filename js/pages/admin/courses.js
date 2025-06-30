// Admin Courses Page - Boricua Dance Studio

class AdminCoursesPage {
  constructor() {
    this.services = null;
    this.courses = [];
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
        case 'add-course':
          this.addCourse();
          break;
        case 'edit-course':
          this.editCourse(actionId);
          break;
        case 'delete-course':
          this.deleteCourse(actionId);
          break;
        case 'view-course-students':
          this.viewCourseStudents(actionId);
          break;
      }
    });
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
            <p class="page-subtitle">Crea e gestisci i corsi di ballo della scuola</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" data-action="add-course">
              <span class="material-icons">add_circle</span>
              Aggiungi Corso
            </button>
          </div>
        </div>

        <!-- Courses List -->
        <div class="table-container mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Corso</th>
                <th>Insegnante</th>
                <th>Orario</th>
                <th>Iscritti</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody id="courses-table-body">
              ${this.renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTableBody() {
    if (this.courses.length === 0) {
      return `<tr><td colspan="5" class="text-center text-secondary">Nessun corso trovato.</td></tr>`;
    }
    return this.courses.map(course => this.renderCourseRow(course)).join('');
  }

  renderCourseRow(course) {
    const teacher = this.teachers.find(t => t.id === course.teacherId);
    return `
      <tr>
        <td>
          <div class="font-medium">${course.name}</div>
          <div class="text-sm text-secondary">${course.level}</div>
        </td>
        <td>${teacher ? teacher.name : 'N/D'}</td>
        <td>${course.schedule || 'N/D'}</td>
        <td>${course.students ? course.students.length : 0} / ${course.maxStudents || '∞'}</td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn" data-action="view-course-students" data-id="${course.id}" title="Vedi Iscritti">
              <span class="material-icons">groups</span>
            </button>
            <button class="icon-btn" data-action="edit-course" data-id="${course.id}" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn text-danger" data-action="delete-course" data-id="${course.id}" title="Elimina">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Actions
  addCourse() {
    this.showCourseForm();
  }

  editCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      this.showCourseForm(course);
    }
  }

  async deleteCourse(courseId) {
    const confirmed = await this.services.modal.confirm({
      title: 'Elimina Corso',
      message: 'Sei sicuro di voler eliminare questo corso? Questa azione è irreversibile.',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });

    if (confirmed) {
      this.courses = this.courses.filter(c => c.id !== courseId);
      Storage.set(STORAGE_KEYS.COURSES, this.courses);
      this.services.toast.show('Corso eliminato con successo.', 'success');
      this.refreshTable();
    }
  }

  viewCourseStudents(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    // This is a simplified view. A real implementation would fetch student details.
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const enrolledStudents = (course.students || []).map(studentId => {
        return students.find(s => s.id === studentId);
    }).filter(Boolean);

    const studentListHtml = enrolledStudents.length > 0 
      ? `<ul class="list-group">${enrolledStudents.map(s => `<li class="list-group-item">${s.firstName} ${s.lastName}</li>`).join('')}</ul>`
      : '<p class="text-secondary">Nessun allievo iscritto a questo corso.</p>';

    this.services.modal.create({
      title: `Iscritti a ${course.name}`,
      content: studentListHtml,
      actions: [{ text: 'Chiudi', class: 'btn-primary', onClick: () => true }]
    });
  }

  showCourseForm(course = null) {
    const teacherOptions = this.teachers.map(t => ({ value: t.id, label: t.name }));

    this.services.modal.form({
      title: course ? 'Modifica Corso' : 'Aggiungi Corso',
      size: 'large',
      fields: [
        { name: 'name', label: 'Nome Corso', value: course?.name || '', required: true },
        { name: 'level', label: 'Livello', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzato', 'Open'], value: course?.level || 'Principiante', required: true },
        { name: 'teacherId', label: 'Insegnante', type: 'select', options: teacherOptions, value: course?.teacherId || '', required: true },
        { name: 'schedule', label: 'Orario (es. Lun 20:30-21:30)', value: course?.schedule || '' },
        { name: 'maxStudents', label: 'Max Iscritti', type: 'number', value: course?.maxStudents || '' },
        { name: 'description', label: 'Descrizione', type: 'textarea', value: course?.description || '' }
      ],
      onSubmit: (formData) => {
        if (course) {
          // Update
          const index = this.courses.findIndex(c => c.id === course.id);
          this.courses[index] = { ...this.courses[index], ...formData };
          this.services.toast.show('Corso aggiornato con successo.', 'success');
        } else {
          // Create
          const newCourse = {
            id: StringHelpers.generateId('course'),
            ...formData,
            students: []
          };
          this.courses.push(newCourse);
          this.services.toast.show('Corso aggiunto con successo.', 'success');
        }
        Storage.set(STORAGE_KEYS.COURSES, this.courses);
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    document.getElementById('courses-table-body').innerHTML = this.renderTableBody();
  }
}

window.adminCoursesPage = new AdminCoursesPage();