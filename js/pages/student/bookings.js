// Student Bookings Page - Boricua Dance Studio

class StudentBookingsPage {
  constructor() {
    this.teachers = [];
    this.bookings = [];
    this.selectedTeacher = null;
    this.selectedDate = null;
    this.availableSlots = [];
  }

  async render() {
    const user = Storage.get(STORAGE_KEYS.USER);
    this.teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    this.bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    
    // Filter student's bookings
    const myBookings = this.bookings.filter(b => b.studentId === user?.studentId);
    const upcomingBookings = myBookings.filter(b => 
      new Date(b.date) >= new Date() && 
      b.status !== BOOKING_STATUS.CANCELLED
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const pastBookings = myBookings.filter(b => 
      new Date(b.date) < new Date() || 
      b.status === BOOKING_STATUS.COMPLETED
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
      <div class="bookings-page">
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Lezioni Private</h1>
          <p class="page-subtitle">Prenota una lezione privata con i nostri maestri</p>
        </div>

        <!-- Booking Steps -->
        <div class="booking-container">
          <div class="booking-steps">
            <div class="step ${this.selectedTeacher ? 'completed' : 'active'}">
              <div class="step-number">1</div>
              <div class="step-label">Scegli Maestro</div>
            </div>
            <div class="step ${this.selectedTeacher && this.selectedDate ? 'completed' : this.selectedTeacher ? 'active' : ''}">
              <div class="step-number">2</div>
              <div class="step-label">Scegli Data</div>
            </div>
            <div class="step ${this.selectedDate ? 'active' : ''}">
              <div class="step-number">3</div>
              <div class="step-label">Scegli Orario</div>
            </div>
          </div>

          <!-- Step 1: Choose Teacher -->
          <div class="booking-step-content" ${this.selectedTeacher ? 'style="display:none"' : ''}>
            <h2>Scegli un Maestro</h2>
            <div class="teachers-grid">
              ${this.teachers.map(teacher => this.renderTeacherCard(teacher)).join('')}
            </div>
          </div>

          <!-- Step 2: Choose Date -->
          <div class="booking-step-content" ${!this.selectedTeacher || this.selectedDate ? 'style="display:none"' : ''}>
            <h2>Scegli una Data</h2>
            <button class="btn btn-ghost mb-2" onclick="studentBookingsPage.backToTeachers()">
              <span class="material-icons">arrow_back</span>
              Cambia Maestro
            </button>
            <div id="calendar-container">
              ${this.renderCalendar()}
            </div>
          </div>

          <!-- Step 3: Choose Time Slot -->
          <div class="booking-step-content" ${!this.selectedDate ? 'style="display:none"' : ''}>
            <h2>Scegli un Orario</h2>
            <button class="btn btn-ghost mb-2" onclick="studentBookingsPage.backToCalendar()">
              <span class="material-icons">arrow_back</span>
              Cambia Data
            </button>
            
            <div class="selected-info">
              <p><strong>Maestro:</strong> ${this.selectedTeacher ? 
                `${this.selectedTeacher.firstName} ${this.selectedTeacher.lastName}` : ''}</p>
              <p><strong>Data:</strong> ${this.selectedDate ? 
                DateHelpers.formatDate(this.selectedDate, 'long') : ''}</p>
            </div>

            <div class="time-slots-grid" id="time-slots">
              ${this.renderTimeSlots()}
            </div>
          </div>
        </div>

        <!-- My Bookings -->
        <div class="my-bookings mt-4">
          <h2>Le Mie Prenotazioni</h2>
          
          <!-- Upcoming Bookings -->
          <div class="bookings-section">
            <h3>Prossime Lezioni</h3>
            ${upcomingBookings.length > 0 ? `
              <div class="bookings-list">
                ${upcomingBookings.map(booking => this.renderBookingCard(booking)).join('')}
              </div>
            ` : '<p class="text-secondary">Nessuna lezione programmata</p>'}
          </div>

          <!-- Past Bookings -->
          <div class="bookings-section mt-3">
            <h3>Lezioni Passate</h3>
            ${pastBookings.length > 0 ? `
              <div class="bookings-list">
                ${pastBookings.slice(0, 5).map(booking => this.renderBookingCard(booking, true)).join('')}
              </div>
            ` : '<p class="text-secondary">Nessuna lezione passata</p>'}
          </div>
        </div>
      </div>
    `;
  }

  renderTeacherCard(teacher) {
    const specialties = teacher.specialties.join(', ');
    const avgRating = teacher.rating || 0;
    
    return `
      <div class="teacher-card" onclick="studentBookingsPage.selectTeacher('${teacher.id}')">
        <div class="teacher-avatar">
          <div class="avatar avatar-lg">
            ${StringHelpers.getInitials(teacher.firstName + ' ' + teacher.lastName)}
          </div>
        </div>
        <h3 class="teacher-name">${teacher.firstName} ${teacher.lastName}</h3>
        <p class="teacher-specialties">${specialties}</p>
        
        <div class="teacher-rating">
          ${this.renderStars(avgRating)}
          <span class="rating-value">${avgRating.toFixed(1)}</span>
        </div>
        
        <div class="teacher-bio">
          ${teacher.bio}
        </div>
        
        <button class="btn btn-primary btn-block mt-2">
          Seleziona
        </button>
      </div>
    `;
  }

  renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars += '<span class="material-icons star filled">star</span>';
      } else if (i - 0.5 <= rating) {
        stars += '<span class="material-icons star half">star_half</span>';
      } else {
        stars += '<span class="material-icons star">star_outline</span>';
      }
    }
    return stars;
  }

  renderCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get teacher availability
    const availability = this.selectedTeacher?.availability || {};
    const availableDays = Object.keys(availability).filter(day => availability[day].length > 0);
    
    return `
      <div class="booking-calendar">
        <div class="calendar-header">
          <h3>${DateHelpers.getMonthName(today)} ${currentYear}</h3>
        </div>
        <div class="calendar-grid">
          <div class="calendar-day-header">Lun</div>
          <div class="calendar-day-header">Mar</div>
          <div class="calendar-day-header">Mer</div>
          <div class="calendar-day-header">Gio</div>
          <div class="calendar-day-header">Ven</div>
          <div class="calendar-day-header">Sab</div>
          <div class="calendar-day-header">Dom</div>
          ${this.generateCalendarDays(currentYear, currentMonth, availableDays)}
        </div>
      </div>
    `;
  }

  generateCalendarDays(year, month, availableDays) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = DateHelpers.getDaysInMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let days = '';
    
    // Empty cells for days before month starts
    const startPadding = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startPadding; i++) {
      days += '<div class="calendar-day other-month"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      const isPast = date < today;
      const isAvailable = availableDays.includes(dayName) && !isPast;
      const isToday = date.toDateString() === today.toDateString();
      
      days += `
        <div class="calendar-day ${isPast ? 'disabled' : ''} ${isAvailable ? 'available' : ''} ${isToday ? 'today' : ''}"
             ${isAvailable ? `onclick="studentBookingsPage.selectDate('${date.toISOString()}')"` : ''}>
          <span class="calendar-day-number">${day}</span>
        </div>
      `;
    }
    
    return days;
  }

  renderTimeSlots() {
    if (!this.availableSlots || this.availableSlots.length === 0) {
      return '<p class="text-secondary">Nessuno slot disponibile per questa data</p>';
    }
    
    return this.availableSlots.map(slot => `
      <button class="time-slot ${slot.available ? '' : 'disabled'}" 
              ${slot.available ? `onclick="studentBookingsPage.selectTimeSlot('${slot.time}')"` : ''}
              ${!slot.available ? 'disabled' : ''}>
        <span class="time">${slot.time}</span>
        ${!slot.available ? '<span class="status">Occupato</span>' : ''}
      </button>
    `).join('');
  }

  renderBookingCard(booking, isPast = false) {
    const teacher = this.teachers.find(t => t.id === booking.teacherId);
    const statusClass = `status-${booking.status}`;
    
    return `
      <div class="booking-card ${isPast ? 'past' : ''}">
        <div class="booking-date">
          <div class="date-day">${new Date(booking.date).getDate()}</div>
          <div class="date-month">${DateHelpers.getMonthName(new Date(booking.date)).substring(0, 3)}</div>
        </div>
        
        <div class="booking-info">
          <h4>Lezione con ${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}</h4>
          <p class="booking-time">
            <span class="material-icons">schedule</span>
            ${booking.time} - ${this.calculateEndTime(booking.time, booking.duration)}
          </p>
          <p class="booking-duration">
            <span class="material-icons">timer</span>
            ${booking.duration} minuti
          </p>
        </div>
        
        <div class="booking-status">
          <span class="status-indicator ${statusClass}">
            ${this.getStatusLabel(booking.status)}
          </span>
        </div>
        
        <div class="booking-actions">
          ${!isPast && booking.status === BOOKING_STATUS.CONFIRMED ? `
            <button class="btn btn-sm btn-danger" onclick="studentBookingsPage.cancelBooking('${booking.id}')">
              Cancella
            </button>
          ` : ''}
          ${isPast && booking.status === BOOKING_STATUS.COMPLETED ? `
            <button class="btn btn-sm btn-primary" onclick="studentBookingsPage.leaveReview('${booking.id}')">
              Lascia Recensione
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Actions

  selectTeacher(teacherId) {
    this.selectedTeacher = this.teachers.find(t => t.id === teacherId);
    this.selectedDate = null;
    this.availableSlots = [];
    
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  selectDate(dateString) {
    this.selectedDate = new Date(dateString);
    
    // Load available slots
    this.availableSlots = CalendarService.getAvailableSlots(
      this.selectedTeacher.id, 
      this.selectedDate
    );
    
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  async selectTimeSlot(time) {
    const duration = await Modal.form({
      title: 'Durata Lezione',
      fields: [
        {
          name: 'duration',
          label: 'Seleziona la durata',
          type: 'select',
          options: [
            { value: '30', label: '30 minuti' },
            { value: '60', label: '60 minuti' },
            { value: '90', label: '90 minuti' },
            { value: '120', label: '120 minuti' }
          ],
          required: true
        },
        {
          name: 'notes',
          label: 'Note per il maestro (opzionale)',
          type: 'textarea',
          rows: 3,
          placeholder: 'Cosa vorresti praticare? Hai richieste particolari?'
        }
      ],
      submitText: 'Conferma Prenotazione',
      onSubmit: async (formData) => {
        const bookingData = {
          studentId: Storage.get(STORAGE_KEYS.USER).studentId,
          teacherId: this.selectedTeacher.id,
          date: this.selectedDate.toISOString().split('T')[0],
          time: time,
          duration: parseInt(formData.duration),
          notes: formData.notes || ''
        };
        
        const result = await CalendarService.createBooking(bookingData);
        
        if (result.success) {
          Toast.show('Prenotazione effettuata! In attesa di conferma dal maestro.', 'success');
          
          // Reset selection
          this.selectedTeacher = null;
          this.selectedDate = null;
          this.availableSlots = [];
          
          // Refresh page
          this.render().then(html => {
            document.getElementById('page-content').innerHTML = html;
          });
        } else {
          Toast.show(result.message || 'Errore nella prenotazione', 'error');
        }
      }
    });
  }

  backToTeachers() {
    this.selectedTeacher = null;
    this.selectedDate = null;
    this.availableSlots = [];
    
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  backToCalendar() {
    this.selectedDate = null;
    this.availableSlots = [];
    
    this.render().then(html => {
      document.getElementById('page-content').innerHTML = html;
    });
  }

  async cancelBooking(bookingId) {
    const confirmed = await Modal.confirm({
      title: 'Cancella Prenotazione',
      message: 'Sei sicuro di voler cancellare questa prenotazione?',
      confirmText: 'Cancella',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      CalendarService.updateBookingStatus(bookingId, BOOKING_STATUS.CANCELLED);
      Toast.show('Prenotazione cancellata', 'info');
      
      this.render().then(html => {
        document.getElementById('page-content').innerHTML = html;
      });
    }
  }

  async leaveReview(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    Modal.form({
      title: 'Lascia una Recensione',
      fields: [
        {
          name: 'rating',
          label: 'Valutazione',
          type: 'select',
          options: [
            { value: '5', label: '⭐⭐⭐⭐⭐ Eccellente' },
            { value: '4', label: '⭐⭐⭐⭐ Molto buono' },
            { value: '3', label: '⭐⭐⭐ Buono' },
            { value: '2', label: '⭐⭐ Sufficiente' },
            { value: '1', label: '⭐ Insufficiente' }
          ],
          required: true
        },
        {
          name: 'comment',
          label: 'Commento',
          type: 'textarea',
          rows: 4,
          placeholder: 'Condividi la tua esperienza...'
        }
      ],
      submitText: 'Invia Recensione',
      onSubmit: (formData) => {
        // Save review (in real app, would save to database)
        Toast.show('Grazie per la tua recensione!', 'success');
        
        // Award points for review
        GamificationService.awardReviewPoints(Storage.get(STORAGE_KEYS.USER).studentId);
      }
    });
  }

  // Utility methods

  calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  getStatusLabel(status) {
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
window.studentBookingsPage = new StudentBookingsPage();