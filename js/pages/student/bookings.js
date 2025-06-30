// Student Bookings Page - Boricua Dance Studio

class StudentBookingsPage {
  constructor() {
    this.services = null;
    this.user = null;
    this.calendarComponent = null;
  }

  init(services) {
    this.services = services;
    this.user = this.services.auth.getCurrentUser();
  }

  addEventListeners() {
    // Event listeners for the calendar are handled within the CalendarComponent
  }

  async render() {
    if (!this.user) {
      return '<p>Devi effettuare il login per vedere le tue prenotazioni.</p>';
    }

    // Initialize the calendar component with student-specific settings
    this.calendarComponent = new CalendarComponent({
      services: this.services,
      isAdmin: false,
      studentId: this.user.id, // Filter events for the current student
      eventClickHandler: (event) => this.showBookingDetails(event),
      dateClickHandler: (date) => this.showDateActions(date),
    });

    return `
      <div class="bookings-page">
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Le Mie Prenotazioni</h1>
          <p class="page-subtitle">Visualizza e gestisci le tue lezioni prenotate</p>
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
  }

  showBookingDetails(booking) {
    const content = `
      <p><strong>Corso:</strong> ${booking.title}</p>
      <p><strong>Data:</strong> ${DateHelpers.formatDateTime(booking.start)}</p>
      <p><strong>Stato:</strong> ${booking.extendedProps.status || 'Confermato'}</p>
    `;
    this.services.modal.create({
      title: 'Dettaglio Prenotazione',
      content: content,
      actions: [
        { text: 'Annulla Prenotazione', class: 'btn-danger', onClick: () => this.cancelBooking(booking.id) },
        { text: 'Chiudi', class: 'btn-primary', onClick: () => true },
      ]
    });
  }

  showDateActions(date) {
    // Student can book a new lesson
    this.bookNewLesson(date);
  }

  bookNewLesson(date) {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const courseOptions = courses.map(c => ({ value: c.id, label: `${c.name} (${c.level})` }));

    this.services.modal.form({
      title: 'Prenota una Lezione',
      fields: [
        { name: 'courseId', label: 'Scegli il corso', type: 'select', options: courseOptions, required: true },
        // In a real app, you'd show available slots based on the selected course and date
      ],
      onSubmit: (formData) => {
        const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
        const selectedCourse = courses.find(c => c.id === formData.courseId);
        
        // For demo, we just book it on the selected date at a default time
        const bookingDate = new Date(date);
        bookingDate.setHours(20, 30, 0, 0); // Default time

        const newBooking = {
          id: StringHelpers.generateId('book'),
          title: selectedCourse.name,
          start: bookingDate.toISOString(),
          studentId: this.user.id,
          extendedProps: {
            status: 'Confermato',
            courseId: selectedCourse.id
          }
        };

        bookings.push(newBooking);
        Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
        this.services.toast.show('Lezione prenotata con successo!', 'success');
        this.calendarComponent.refresh();
      }
    });
  }

  async cancelBooking(bookingId) {
    const confirmed = await this.services.modal.confirm({
        title: 'Annulla Prenotazione',
        message: 'Sei sicuro di voler annullare questa prenotazione? Potrebbero essere applicate delle penali.',
        confirmText: 'Sì, annulla',
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
}

window.studentBookingsPage = new StudentBookingsPage();