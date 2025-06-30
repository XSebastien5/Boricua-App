// Admin Bookings Page - Boricua Dance Studio

class AdminBookingsPage {
  constructor() {
    this.services = null;
    this.calendarComponent = null;
  }

  init(services) {
    this.services = services;
    // The calendar component will be initialized by the render method
  }

  addEventListeners() {
    // Event listeners for the calendar are handled within the CalendarComponent
    // Add listeners for any other controls on this page if needed
    const pageContent = document.getElementById('page-content');
    pageContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;

      const actionName = action.dataset.action;
      
      if (actionName === 'add-booking') {
        this.addBooking();
      }
    });
  }

  async render() {
    // Initialize the calendar component with admin-specific settings
    this.calendarComponent = new CalendarComponent({
      services: this.services,
      isAdmin: true,
      // Admin can see all bookings and manage them
      eventClickHandler: (event) => this.showBookingDetails(event),
      dateClickHandler: (date) => this.showDateActions(date),
    });

    return `
      <div class="bookings-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Calendario Prenotazioni</h1>
            <p class="page-subtitle">Visualizza e gestisci tutte le lezioni e le prenotazioni</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" data-action="add-booking">
              <span class="material-icons">add</span>
              Aggiungi Evento/Lezione
            </button>
          </div>
        </div>

        <!-- Calendar -->
        <div id="calendar-container" class="mt-3">
          ${await this.calendarComponent.render()}
        </div>
      </div>
    `;
  }

  afterRender() {
    // Attach event listeners after the calendar is in the DOM
    if (this.calendarComponent) {
      this.calendarComponent.attachEventListeners();
    }
    this.addEventListeners();
  }

  showBookingDetails(booking) {
    // Admin can view details of any booking
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const student = students.find(s => s.id === booking.studentId);
    
    const content = `
      <p><strong>Corso:</strong> ${booking.title}</p>
      <p><strong>Data:</strong> ${DateHelpers.formatDateTime(booking.start)}</p>
      <p><strong>Allievo:</strong> ${student ? `${student.firstName} ${student.lastName}` : 'N/D'}</p>
      <p><strong>Stato:</strong> ${booking.extendedProps.status || 'Confermato'}</p>
    `;
    this.services.modal.create({
      title: 'Dettaglio Prenotazione',
      content: content,
      actions: [
        { text: 'Modifica', class: 'btn-outline', onClick: () => this.editBooking(booking) },
        { text: 'Annulla Prenotazione', class: 'btn-danger', onClick: () => this.cancelBooking(booking.id) },
        { text: 'Chiudi', class: 'btn-primary', onClick: () => true },
      ]
    });
  }

  showDateActions(date) {
    // On date click, admin can add a new event
    this.addBooking(date);
  }

  addBooking(date = new Date()) {
    this.showBookingForm({ start: date });
  }

  editBooking(booking) {
    this.showBookingForm(booking);
  }

  async cancelBooking(bookingId) {
    const confirmed = await this.services.modal.confirm({
        title: 'Annulla Prenotazione',
        message: 'Sei sicuro di voler annullare questa prenotazione?',
        confirmText: 'Conferma Annullamento',
        confirmClass: 'btn-danger'
    });

    if (confirmed) {
        let bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
        bookings = bookings.filter(b => b.id !== bookingId);
        Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
        this.services.toast.show('Prenotazione annullata.', 'success');
        this.calendarComponent.refresh();
    }
  }

  showBookingForm(booking = {}) {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const courseOptions = courses.map(c => ({ value: c.id, label: c.name }));
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const studentOptions = students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }));

    // Find course from title if editing
    const course = courses.find(c => c.name === booking.title);

    this.services.modal.form({
      title: booking.id ? 'Modifica Evento' : 'Aggiungi Evento/Lezione',
      size: 'large',
      fields: [
        { name: 'courseId', label: 'Corso', type: 'select', options: courseOptions, value: course?.id || '', required: true },
        { name: 'studentId', label: 'Allievo (opzionale)', type: 'select', options: studentOptions, value: booking.studentId || '' },
        { name: 'start', label: 'Data e Ora Inizio', type: 'datetime-local', value: booking.start ? DateHelpers.toDateTimeLocal(new Date(booking.start)) : DateHelpers.toDateTimeLocal(new Date()), required: true },
        { name: 'end', label: 'Data e Ora Fine', type: 'datetime-local', value: booking.end ? DateHelpers.toDateTimeLocal(new Date(booking.end)) : '' },
        { name: 'isRecurring', label: 'Evento Ricorrente', type: 'checkbox', checked: booking.isRecurring || false },
      ],
      onSubmit: (formData) => {
        const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
        const selectedCourse = courses.find(c => c.id === formData.courseId);

        if (booking.id) {
          // Update
          const index = bookings.findIndex(b => b.id === booking.id);
          if (index !== -1) {
            bookings[index] = {
              ...bookings[index],
              title: selectedCourse.name,
              start: new Date(formData.start).toISOString(),
              end: formData.end ? new Date(formData.end).toISOString() : null,
              studentId: formData.studentId,
              // more props...
            };
            this.services.toast.show('Evento aggiornato!', 'success');
          }
        } else {
          // Create
          const newBooking = {
            id: StringHelpers.generateId('book'),
            title: selectedCourse.name,
            start: new Date(formData.start).toISOString(),
            end: formData.end ? new Date(formData.end).toISOString() : null,
            studentId: formData.studentId,
            extendedProps: {
                status: 'Confermato',
                courseId: selectedCourse.id
            }
          };
          bookings.push(newBooking);
          this.services.toast.show('Evento creato con successo!', 'success');
        }
        
        Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
        this.calendarComponent.refresh();
      }
    });
  }
}

window.adminBookingsPage = new AdminBookingsPage();