// Admin Bookings Page - Boricua Dance Studio

class AdminBookingsPage {
  constructor() {
    this.bookings = [];
    this.students = [];
    this.teachers = [];
    this.currentFilter = 'all';
    this.dateFilter = null;
  }

  async render() {
    this.bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    this.students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    this.teachers = Storage.get(STORAGE_KEYS.TEACHERS) || [];
    
    const stats = this.calculateStats();
    
    return `
      <div class="bookings-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Prenotazioni</h1>
            <p class="page-subtitle">Lezioni private e prenotazioni</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" onclick="adminBookingsPage.showAddBooking()">
              <span class="material-icons">add</span>
              Nuova Prenotazione
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="booking-stats">
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">event</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Prenotazioni Oggi</div>
              <div class="stat-value">${stats.todayBookings}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">pending</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">In Attesa</div>
              <div class="stat-value">${stats.pendingBookings}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">check_circle</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Confermate Settimana</div>
              <div class="stat-value">${stats.weekConfirmed}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">euro</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Valore Settimana</div>
              <div class="stat-value">${NumberHelpers.formatCurrency(stats.weekRevenue)}</div>
            </div>
          </div>
        </div>

        <!-- Calendar View -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Calendario Prenotazioni</h3>
            <div class="view-toggle">
              <button class="view-btn active" onclick="adminBookingsPage.showCalendarView()">
                <span class="material-icons">calendar_month</span>
                Calendario
              </button>
              <button class="view-btn" onclick="adminBookingsPage.showListView()">
                <span class="material-icons">list</span>
                Lista
              </button>
            </div>
          </div>
          <div class="card-body">
            <div id="bookings-calendar"></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar mt-3">
          <div class="filter-buttons">
            <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                    onclick="adminBookingsPage.filterBookings('all')">
              Tutte
            </button>
            <button class="filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}" 
                    onclick="adminBookingsPage.filterBookings('pending')">
              In Attesa (${stats.pendingBookings})
            </button>
            <button class="filter-btn ${this.currentFilter === 'confirmed' ? 'active' : ''}" 
                    onclick="adminBookingsPage.filterBookings('confirmed')">
              Confermate
            </button>
            <button class="filter-btn ${this.currentFilter === 'completed' ? 'active' : ''}" 
                    onclick="adminBookingsPage.filterBookings('completed')">
              Completate
            </button>
            <button class="filter-btn ${this.currentFilter === 'cancelled' ? 'active' : ''}" 
                    onclick="adminBookingsPage.filterBookings('cancelled')">
              Cancellate
            </button>
          </div>
          
          <div class="date-filter">
            <input type="date" id="booking-date-filter" onchange="adminBookingsPage.filterByDate(this.value)">
          </div>
        </div>

        <!-- Bookings List -->
        <div class="bookings-list-container mt-3" id="bookings-list" style="display: none;">
          ${this.renderBookingsList()}
        </div>
      </div>
    `;
  }

  renderBookingsList() {
    const filteredBookings = this.getFilteredBookings();
    
    if (filteredBookings.length === 0) {
      return '<p class="text-center text-secondary">Nessuna prenotazione trovata</p>';
    }
    
    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Data/Ora</th>
              <th>Studente</th>
              <th>Maestro</th>
              <th>Durata</th>
              <th>Stato</th>
              <th>Note</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings.map(booking => this.renderBookingRow(booking)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderBookingRow(booking) {
    const student = this.students.find(s => s.id === booking.studentId);
    const teacher = this.teachers.find(t => t.id === booking.teacherId);
    
    return `
      <tr>
        <td>
          <div class="date-time-cell">
            <div class="date">${DateHelpers.formatDate(booking.date, 'long')}</div>
            <div class="time">${booking.time}</div>
          </div>
        </td>
        <td>
          ${student ? `
            <div class="user-cell">
              <div class="avatar avatar-sm">
                ${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}
              </div>
              <div>
                <div class="font-medium">${student.firstName} ${student.lastName}</div>
                <div class="text-sm text-secondary">${student.phone}</div>
              </div>
            </div>
          ` : 'N/A'}
        </td>
        <td>
          ${teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}
        </td>
        <td>${booking.duration} min</td>
        <td>
          <span class="status-indicator status-${booking.status}">
            ${this.getStatusLabel(booking.status)}
          </span>
        </td>
        <td>
          ${booking.notes ? `
            <span class="notes-preview" title="${booking.notes}">
              ${StringHelpers.truncate(booking.notes, 30)}
            </span>
          ` : '-'}
        </td>
        <td>
          <div class="action-buttons">
            ${booking.status === BOOKING_STATUS.PENDING ? `
              <button class="icon-btn text-success" onclick="adminBookingsPage.confirmBooking('${booking.id}')" title="Conferma">
                <span class="material-icons">check_circle</span>
              </button>
              <button class="icon-btn text-danger" onclick="adminBookingsPage.cancelBooking('${booking.id}')" title="Rifiuta">
                <span class="material-icons">cancel</span>
              </button>
            ` : ''}
            ${booking.status === BOOKING_STATUS.CONFIRMED ? `
              <button class="icon-btn text-success" onclick="adminBookingsPage.completeBooking('${booking.id}')" title="Completa">
                <span class="material-icons">done_all</span>
              </button>
              <button class="icon-btn text-warning" onclick="adminBookingsPage.rescheduleBooking('${booking.id}')" title="Riprogramma">
                <span class="material-icons">update</span>
              </button>
            ` : ''}
            <button class="icon-btn" onclick="adminBookingsPage.viewBookingDetails('${booking.id}')" title="Dettagli">
              <span class="material-icons">visibility</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  calculateStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const todayBookings = this.bookings.filter(b => 
      new Date(b.date).toDateString() === today.toDateString()
    ).length;
    
    const pendingBookings = this.bookings.filter(b => 
      b.status === BOOKING_STATUS.PENDING
    ).length;
    
    const weekBookings = this.bookings.filter(b => 
      new Date(b.date) >= weekStart && 
      b.status === BOOKING_STATUS.CONFIRMED
    );
    
    const weekConfirmed = weekBookings.length;
    const weekRevenue = weekBookings.reduce((sum, b) => sum + (b.price || 40), 0);
    
    return {
      todayBookings,
      pendingBookings,
      weekConfirmed,
      weekRevenue
    };
  }

  getFilteredBookings() {
    let filtered = [...this.bookings];
    
    // Status filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(b => b.status === this.currentFilter);
    }
    
    // Date filter
    if (this.dateFilter) {
      filtered = filtered.filter(b => b.date === this.dateFilter);
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      return (bHours * 60 + bMinutes) - (aHours * 60 + aMinutes);
    });
    
    return filtered;
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

  // Actions

  init() {
    // Initialize calendar
    setTimeout(() => {
      const calendar = new CalendarComponent('bookings-calendar', {
        view: CALENDAR_VIEWS.WEEK,
        showControls: true,
        showFilters: false,
        filters: {
          hideClasses: true,
          hideEvents: true
        },
        onEventClick: (event) => {
          if (event.bookingId) {
            this.viewBookingDetails(event.bookingId);
          }
        }
      });
      calendar.render();
      window.bookingsCalendar = calendar;
    }, 100);
  }

  showCalendarView() {
    document.getElementById('bookings-calendar').style.display = 'block';
    document.getElementById('bookings-list').style.display = 'none';
    
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.closest('.view-btn').classList.add('active');
  }

  showListView() {
    document.getElementById('bookings-calendar').style.display = 'none';
    document.getElementById('bookings-list').style.display = 'block';
    
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.closest('.view-btn').classList.add('active');
  }

  filterBookings(filter) {
    this.currentFilter = filter;
    document.getElementById('bookings-list').innerHTML = this.renderBookingsList();
    
    // Update buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  filterByDate(date) {
    this.dateFilter = date || null;
    document.getElementById('bookings-list').innerHTML = this.renderBookingsList();
  }

  async showAddBooking() {
    const studentOptions = this.students
      .filter(s => s.status === STUDENT_STATUS.ACTIVE)
      .map(s => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName}`
      }));
    
    const teacherOptions = this.teachers.map(t => ({
      value: t.id,
      label: `${t.firstName} ${t.lastName}`
    }));
    
    Modal.form({
      title: 'Nuova Prenotazione',
      fields: [
        {
          name: 'studentId',
          label: 'Studente',
          type: 'select',
          options: studentOptions,
          required: true
        },
        {
          name: 'teacherId',
          label: 'Maestro',
          type: 'select',
          options: teacherOptions,
          required: true
        },
        {
          name: 'date',
          label: 'Data',
          type: 'date',
          required: true,
          min: new Date().toISOString().split('T')[0]
        },
        {
          name: 'time',
          label: 'Orario',
          type: 'time',
          required: true
        },
        {
          name: 'duration',
          label: 'Durata (minuti)',
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
          label: 'Note',
          type: 'textarea',
          rows: 3
        }
      ],
      onSubmit: async (formData) => {
        const result = await CalendarService.createBooking({
          ...formData,
          duration: parseInt(formData.duration),
          status: BOOKING_STATUS.CONFIRMED
        });
        
        if (result.success) {
          Toast.show('Prenotazione creata con successo', 'success');
          this.bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
          this.render().then(html => {
            document.getElementById('page-content').innerHTML = html;
            this.init();
          });
        } else {
          Toast.show(result.message, 'error');
        }
      }
    });
  }

  async confirmBooking(bookingId) {
    CalendarService.updateBookingStatus(bookingId, BOOKING_STATUS.CONFIRMED);
    Toast.show('Prenotazione confermata', 'success');
    this.updateBookingsList();
  }

  async cancelBooking(bookingId) {
    const reason = await Modal.prompt({
      title: 'Cancella Prenotazione',
      message: 'Motivo della cancellazione:',
      placeholder: 'Inserisci il motivo...'
    });
    
    if (reason !== null) {
      CalendarService.updateBookingStatus(bookingId, BOOKING_STATUS.CANCELLED);
      Toast.show('Prenotazione cancellata', 'info');
      this.updateBookingsList();
    }
  }

  async completeBooking(bookingId) {
    CalendarService.updateBookingStatus(bookingId, BOOKING_STATUS.COMPLETED);
    
    // Award attendance points
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      GamificationService.awardBookingCompletedPoints(booking.studentId);
    }
    
    Toast.show('Prenotazione completata', 'success');
    this.updateBookingsList();
  }

  async rescheduleBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    Modal.form({
      title: 'Riprogramma Prenotazione',
      fields: [
        {
          name: 'date',
          label: 'Nuova Data',
          type: 'date',
          value: booking.date,
          required: true,
          min: new Date().toISOString().split('T')[0]
        },
        {
          name: 'time',
          label: 'Nuovo Orario',
          type: 'time',
          value: booking.time,
          required: true
        }
      ],
      onSubmit: (formData) => {
        booking.date = formData.date;
        booking.time = formData.time;
        booking.updatedAt = new Date().toISOString();
        
        Storage.set(STORAGE_KEYS.BOOKINGS, this.bookings);
        Toast.show('Prenotazione riprogrammata', 'success');
        this.updateBookingsList();
        
        // Notify student
        NotificationService.createInAppNotification({
          type: NOTIFICATION_TYPES.INFO,
          title: 'Prenotazione Riprogrammata',
          message: `La tua lezione è stata riprogrammata per ${DateHelpers.formatDate(formData.date)} alle ${formData.time}`,
          targetRole: USER_ROLES.STUDENT,
          data: { studentId: booking.studentId, bookingId: booking.id }
        });
      }
    });
  }

  viewBookingDetails(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const student = this.students.find(s => s.id === booking.studentId);
    const teacher = this.teachers.find(t => t.id === booking.teacherId);
    
    const content = `
      <div class="booking-details">
        <div class="detail-section">
          <h4>Informazioni Prenotazione</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID:</label>
              <span>${booking.id}</span>
            </div>
            <div class="detail-item">
              <label>Data:</label>
              <span>${DateHelpers.formatDate(booking.date, 'long')}</span>
            </div>
            <div class="detail-item">
              <label>Orario:</label>
              <span>${booking.time} (${booking.duration} minuti)</span>
            </div>
            <div class="detail-item">
              <label>Stato:</label>
              <span class="status-indicator status-${booking.status}">
                ${this.getStatusLabel(booking.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Studente</h4>
          ${student ? `
            <div class="user-info">
              <p><strong>${student.firstName} ${student.lastName}</strong></p>
              <p>${student.email}</p>
              <p>${student.phone}</p>
            </div>
          ` : '<p>Informazioni non disponibili</p>'}
        </div>
        
        <div class="detail-section">
          <h4>Maestro</h4>
          ${teacher ? `
            <div class="user-info">
              <p><strong>${teacher.firstName} ${teacher.lastName}</strong></p>
              <p>Specialità: ${teacher.specialties.join(', ')}</p>
            </div>
          ` : '<p>Informazioni non disponibili</p>'}
        </div>
        
        ${booking.notes ? `
          <div class="detail-section">
            <h4>Note</h4>
            <p>${booking.notes}</p>
          </div>
        ` : ''}
        
        <div class="detail-section">
          <h4>Timeline</h4>
          <div class="timeline">
            <div class="timeline-item">
              <span class="timeline-icon">
                <span class="material-icons">add_circle</span>
              </span>
              <div class="timeline-content">
                <p>Prenotazione creata</p>
                <span class="timeline-date">${DateHelpers.formatDate(booking.createdAt, 'datetime')}</span>
              </div>
            </div>
            ${booking.updatedAt ? `
              <div class="timeline-item">
                <span class="timeline-icon">
                  <span class="material-icons">update</span>
                </span>
                <div class="timeline-content">
                  <p>Ultima modifica</p>
                  <span class="timeline-date">${DateHelpers.formatDate(booking.updatedAt, 'datetime')}</span>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    Modal.create({
      title: 'Dettagli Prenotazione',
      content: content,
      size: 'medium'
    });
  }

  updateBookingsList() {
    this.bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    document.getElementById('bookings-list').innerHTML = this.renderBookingsList();
    
    // Update calendar if visible
    if (window.bookingsCalendar) {
      window.bookingsCalendar.refresh();
    }
  }
}

// Create global instance
window.adminBookingsPage = new AdminBookingsPage();