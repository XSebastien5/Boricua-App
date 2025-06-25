// Calendar Component - Boricua Dance Studio

class CalendarComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      view: options.view || CALENDAR_VIEWS.MONTH,
      date: options.date || new Date(),
      showControls: options.showControls !== false,
      showFilters: options.showFilters !== false,
      onEventClick: options.onEventClick || null,
      onDateClick: options.onDateClick || null,
      filters: options.filters || {}
    };
    
    this.currentDate = new Date(this.options.date);
    this.currentView = this.options.view;
    this.events = [];
  }

  async render() {
    const calendarData = CalendarService.getCalendarView(
      this.currentView,
      this.currentDate,
      this.options.filters
    );
    
    this.events = calendarData.events;
    
    const html = `
      <div class="calendar-component">
        ${this.options.showControls ? this.renderControls() : ''}
        ${this.options.showFilters ? this.renderFilters() : ''}
        <div class="calendar-content">
          ${this.renderView()}
        </div>
      </div>
    `;
    
    if (this.container) {
      this.container.innerHTML = html;
      this.attachEventListeners();
    }
    
    return html;
  }

  renderControls() {
    return `
      <div class="calendar-controls">
        <div class="calendar-nav">
          <button class="icon-btn" onclick="calendar.previousPeriod()">
            <span class="material-icons">chevron_left</span>
          </button>
          <h3 class="calendar-title">${this.getTitle()}</h3>
          <button class="icon-btn" onclick="calendar.nextPeriod()">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
        
        <div class="calendar-actions">
          <button class="btn btn-ghost" onclick="calendar.today()">Oggi</button>
          <div class="view-switcher">
            <button class="view-btn ${this.currentView === CALENDAR_VIEWS.MONTH ? 'active' : ''}" 
                    onclick="calendar.changeView('${CALENDAR_VIEWS.MONTH}')">
              Mese
            </button>
            <button class="view-btn ${this.currentView === CALENDAR_VIEWS.WEEK ? 'active' : ''}" 
                    onclick="calendar.changeView('${CALENDAR_VIEWS.WEEK}')">
              Settimana
            </button>
            <button class="view-btn ${this.currentView === CALENDAR_VIEWS.DAY ? 'active' : ''}" 
                    onclick="calendar.changeView('${CALENDAR_VIEWS.DAY}')">
              Giorno
            </button>
            <button class="view-btn ${this.currentView === CALENDAR_VIEWS.LIST ? 'active' : ''}" 
                    onclick="calendar.changeView('${CALENDAR_VIEWS.LIST}')">
              Lista
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderFilters() {
    return `
      <div class="calendar-filters">
        <label class="checkbox">
          <input type="checkbox" id="filter-classes" checked 
                 onchange="calendar.toggleFilter('hideClasses', !this.checked)">
          <span>Mostra Corsi</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" id="filter-bookings" checked 
                 onchange="calendar.toggleFilter('hideBookings', !this.checked)">
          <span>Mostra Lezioni Private</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" id="filter-events" checked 
                 onchange="calendar.toggleFilter('hideEvents', !this.checked)">
          <span>Mostra Eventi</span>
        </label>
      </div>
    `;
  }

  renderView() {
    switch (this.currentView) {
      case CALENDAR_VIEWS.MONTH:
        return this.renderMonthView();
      case CALENDAR_VIEWS.WEEK:
        return this.renderWeekView();
      case CALENDAR_VIEWS.DAY:
        return this.renderDayView();
      case CALENDAR_VIEWS.LIST:
        return this.renderListView();
      default:
        return this.renderMonthView();
    }
  }

  renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const startPadding = firstDay.getDay() || 7;
    startDate.setDate(startDate.getDate() - startPadding + 1);
    
    const weeks = [];
    let currentWeek = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (startDate <= lastDay || currentWeek.length > 0) {
      const date = new Date(startDate);
      const dayEvents = this.getEventsForDate(date);
      
      currentWeek.push({
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return `
      <div class="calendar-month-view">
        <div class="calendar-grid">
          <div class="calendar-day-header">Lun</div>
          <div class="calendar-day-header">Mar</div>
          <div class="calendar-day-header">Mer</div>
          <div class="calendar-day-header">Gio</div>
          <div class="calendar-day-header">Ven</div>
          <div class="calendar-day-header">Sab</div>
          <div class="calendar-day-header">Dom</div>
          
          ${weeks.map(week => week.map(day => `
            <div class="calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}"
                 onclick="calendar.handleDateClick(${day.date.getTime()})">
              <div class="calendar-day-number">${day.date.getDate()}</div>
              <div class="calendar-events">
                ${day.events.slice(0, 3).map(event => `
                  <div class="calendar-event" 
                       style="background-color: ${event.color}"
                       onclick="calendar.handleEventClick(event, '${event.id}')">
                    <span class="event-time">${DateHelpers.formatDate(event.start, 'time')}</span>
                    <span class="event-title">${event.title}</span>
                  </div>
                `).join('')}
                ${day.events.length > 3 ? `
                  <div class="more-events">+${day.events.length - 3} altri</div>
                ` : ''}
              </div>
            </div>
          `).join('')).join('')}
        </div>
      </div>
    `;
  }

  renderWeekView() {
    const weekStart = CalendarService.getWeekStart(this.currentDate);
    const weekDays = [];
    const timeSlots = [];
    
    // Generate days
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }
    
    // Generate time slots (8:00 - 22:00)
    for (let hour = 8; hour <= 22; hour++) {
      timeSlots.push(hour);
    }
    
    return `
      <div class="calendar-week-view">
        <div class="week-grid">
          <div class="time-column">
            <div class="day-header"></div>
            ${timeSlots.map(hour => `
              <div class="time-slot-label">${hour}:00</div>
            `).join('')}
          </div>
          
          ${weekDays.map(day => `
            <div class="day-column">
              <div class="day-header ${DateHelpers.isToday(day) ? 'today' : ''}">
                <div class="day-name">${DateHelpers.getDayName(day).substr(0, 3)}</div>
                <div class="day-number">${day.getDate()}</div>
              </div>
              <div class="day-events">
                ${this.renderDayEvents(day, timeSlots)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderDayView() {
    const timeSlots = [];
    for (let hour = 8; hour <= 22; hour++) {
      timeSlots.push(hour);
    }
    
    const dayEvents = this.getEventsForDate(this.currentDate);
    
    return `
      <div class="calendar-day-view">
        <div class="day-schedule">
          ${timeSlots.map(hour => `
            <div class="hour-row">
              <div class="hour-label">${hour}:00</div>
              <div class="hour-events">
                ${this.renderHourEvents(dayEvents, hour)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderListView() {
    const groupedEvents = this.groupEventsByDate();
    
    return `
      <div class="calendar-list-view">
        ${Object.entries(groupedEvents).map(([dateStr, events]) => `
          <div class="event-date-group">
            <h3 class="date-header">${DateHelpers.formatDate(new Date(dateStr), 'long')}</h3>
            <div class="events-list">
              ${events.map(event => this.renderEventListItem(event)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderEventListItem(event) {
    const duration = (event.end - event.start) / (1000 * 60);
    
    return `
      <div class="event-list-item" onclick="calendar.handleEventClick(event, '${event.id}')">
        <div class="event-color" style="background-color: ${event.color}"></div>
        <div class="event-time">
          ${DateHelpers.formatDate(event.start, 'time')} - ${DateHelpers.formatDate(event.end, 'time')}
          <span class="event-duration">(${duration} min)</span>
        </div>
        <div class="event-details">
          <h4 class="event-title">${event.title}</h4>
          ${event.location ? `<p class="event-location">
            <span class="material-icons">location_on</span>
            ${event.location}
          </p>` : ''}
          ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
        </div>
        <div class="event-type">
          <span class="event-type-badge ${event.type}">${this.getEventTypeLabel(event.type)}</span>
        </div>
      </div>
    `;
  }

  renderDayEvents(date, timeSlots) {
    const dayEvents = this.getEventsForDate(date);
    let html = '';
    
    timeSlots.forEach(hour => {
      html += `<div class="hour-slot">${this.renderHourEvents(dayEvents, hour)}</div>`;
    });
    
    return html;
  }

  renderHourEvents(events, hour) {
    const hourStart = hour * 60;
    const hourEnd = (hour + 1) * 60;
    
    const hourEvents = events.filter(event => {
      const eventStart = event.start.getHours() * 60 + event.start.getMinutes();
      const eventEnd = event.end.getHours() * 60 + event.end.getMinutes();
      return (eventStart < hourEnd && eventEnd > hourStart);
    });
    
    return hourEvents.map(event => {
      const eventStart = event.start.getHours() * 60 + event.start.getMinutes();
      const eventDuration = (event.end - event.start) / (1000 * 60);
      const top = Math.max(0, eventStart - hourStart);
      const height = Math.min(60 - top, eventDuration);
      
      return `
        <div class="week-event" 
             style="background-color: ${event.color}; top: ${(top/60)*100}%; height: ${(height/60)*100}%"
             onclick="calendar.handleEventClick(event, '${event.id}')">
          <div class="event-content">
            <div class="event-time">${DateHelpers.formatDate(event.start, 'time')}</div>
            <div class="event-title">${event.title}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Utility methods

  getTitle() {
    switch (this.currentView) {
      case CALENDAR_VIEWS.MONTH:
        return `${DateHelpers.getMonthName(this.currentDate)} ${this.currentDate.getFullYear()}`;
      case CALENDAR_VIEWS.WEEK:
        const weekStart = CalendarService.getWeekStart(this.currentDate);
        const weekEnd = CalendarService.getWeekEnd(this.currentDate);
        return `${DateHelpers.formatDate(weekStart)} - ${DateHelpers.formatDate(weekEnd)}`;
      case CALENDAR_VIEWS.DAY:
        return DateHelpers.formatDate(this.currentDate, 'long');
      case CALENDAR_VIEWS.LIST:
        return 'Prossimi Eventi';
    }
  }

  getEventsForDate(date) {
    const dateStr = date.toDateString();
    return this.events.filter(event => event.start.toDateString() === dateStr);
  }

  groupEventsByDate() {
    const grouped = {};
    
    this.events.forEach(event => {
      const dateStr = event.start.toDateString();
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(event);
    });
    
    // Sort by date
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    const sortedGrouped = {};
    sortedDates.forEach(date => {
      sortedGrouped[date] = grouped[date];
    });
    
    return sortedGrouped;
  }

  getEventTypeLabel(type) {
    const labels = {
      'course': 'Corso',
      'booking': 'Lezione Privata',
      'special': 'Evento'
    };
    return labels[type] || type;
  }

  // Event handlers

  handleDateClick(timestamp) {
    const date = new Date(timestamp);
    if (this.options.onDateClick) {
      this.options.onDateClick(date);
    } else if (this.currentView === CALENDAR_VIEWS.MONTH) {
      this.currentDate = date;
      this.changeView(CALENDAR_VIEWS.DAY);
    }
  }

  handleEventClick(event, eventId) {
    event.stopPropagation();
    const eventData = this.events.find(e => e.id === eventId);
    
    if (this.options.onEventClick) {
      this.options.onEventClick(eventData);
    } else {
      this.showEventDetails(eventData);
    }
  }

  showEventDetails(event) {
    const content = `
      <div class="event-details-modal">
        <div class="event-header" style="background-color: ${event.color}">
          <h3>${event.title}</h3>
          <span class="event-type-badge">${this.getEventTypeLabel(event.type)}</span>
        </div>
        
        <div class="event-info">
          <div class="info-item">
            <span class="material-icons">schedule</span>
            <div>
              <strong>Orario</strong><br>
              ${DateHelpers.formatDate(event.start, 'datetime')} - ${DateHelpers.formatDate(event.end, 'time')}
            </div>
          </div>
          
          ${event.location ? `
            <div class="info-item">
              <span class="material-icons">location_on</span>
              <div>
                <strong>Luogo</strong><br>
                ${event.location}
              </div>
            </div>
          ` : ''}
          
          ${event.description ? `
            <div class="info-item">
              <span class="material-icons">description</span>
              <div>
                <strong>Descrizione</strong><br>
                ${event.description}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    Modal.create({
      title: 'Dettagli Evento',
      content: content,
      actions: [
        {
          text: 'Chiudi',
          class: 'btn-primary',
          onClick: () => true
        }
      ]
    });
  }

  // Navigation methods

  previousPeriod() {
    switch (this.currentView) {
      case CALENDAR_VIEWS.MONTH:
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        break;
      case CALENDAR_VIEWS.WEEK:
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        break;
      case CALENDAR_VIEWS.DAY:
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        break;
    }
    this.render();
  }

  nextPeriod() {
    switch (this.currentView) {
      case CALENDAR_VIEWS.MONTH:
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        break;
      case CALENDAR_VIEWS.WEEK:
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        break;
      case CALENDAR_VIEWS.DAY:
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        break;
    }
    this.render();
  }

  today() {
    this.currentDate = new Date();
    this.render();
  }

  changeView(view) {
    this.currentView = view;
    this.render();
  }

  toggleFilter(filterName, value) {
    this.options.filters[filterName] = value;
    this.render();
  }

  attachEventListeners() {
    // Attach any additional event listeners after render
  }

  // Public API

  refresh() {
    this.render();
  }

  setDate(date) {
    this.currentDate = new Date(date);
    this.render();
  }

  setFilters(filters) {
    this.options.filters = { ...this.options.filters, ...filters };
    this.render();
  }
}

// Create global instance if needed
window.CalendarComponent = CalendarComponent;