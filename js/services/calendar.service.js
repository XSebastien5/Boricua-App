// Calendar Service - Boricua Dance Studio

class CalendarService {
  constructor(services) {
    this.notificationService = services.notification;
    this.currentView = CALENDAR_VIEWS.MONTH;
    this.currentDate = new Date();
    this.events = [];
  }
  
  // Get calendar events for a specific period
  getEvents(startDate, endDate, filters = {}) {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const events = Storage.get(STORAGE_KEYS.EVENTS) || [];
    const user = Storage.get(STORAGE_KEYS.USER);
    
    let calendarEvents = [];
    
    // Add courses as recurring events
    if (!filters.hideClasses) {
      courses.forEach(course => {
        if (course.status !== COURSE_STATUS.ACTIVE) return;
        
        // Check if user has access to this course
        if (!this.userHasAccessToCourse(course, user)) return;
        
        const courseEvents = this.generateCourseEvents(course, startDate, endDate);
        calendarEvents = calendarEvents.concat(courseEvents);
      });
    }
    
    // Add bookings
    if (!filters.hideBookings) {
      bookings.forEach(booking => {
        if (!this.userHasAccessToBooking(booking, user)) return;
        
        const bookingDate = new Date(booking.date);
        if (bookingDate >= startDate && bookingDate <= endDate) {
          calendarEvents.push(this.createBookingEvent(booking));
        }
      });
    }
    
    // Add special events
    if (!filters.hideEvents) {
      events.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate >= startDate && eventDate <= endDate) {
          calendarEvents.push(this.createSpecialEvent(event));
        }
      });
    }
    
    // Apply additional filters
    if (filters.teacherId) {
      calendarEvents = calendarEvents.filter(e => e.teacherId === filters.teacherId);
    }
    
    if (filters.studentId) {
      calendarEvents = calendarEvents.filter(e => 
        e.studentId === filters.studentId || 
        (e.enrolledStudents && e.enrolledStudents.includes(filters.studentId))
      );
    }
    
    if (filters.type) {
      calendarEvents = calendarEvents.filter(e => e.type === filters.type);
    }
    
    // Sort by date and time
    calendarEvents.sort((a, b) => {
      const dateCompare = a.start - b.start;
      return dateCompare !== 0 ? dateCompare : a.title.localeCompare(b.title);
    });
    
    return calendarEvents;
  }
  
  // Generate recurring events for a course
  generateCourseEvents(course, startDate, endDate) {
    const events = [];
    const courseStart = new Date(course.startDate);
    const courseEnd = new Date(course.endDate);
    
    // Adjust dates to stay within course period
    const effectiveStart = courseStart > startDate ? courseStart : startDate;
    const effectiveEnd = courseEnd < endDate ? courseEnd : endDate;
    
    // Get day of week (0-6)
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    const courseDayOfWeek = dayMap[course.schedule.dayOfWeek.toLowerCase()];
    
    // Find first occurrence
    let currentDate = new Date(effectiveStart);
    while (currentDate.getDay() !== courseDayOfWeek && currentDate <= effectiveEnd) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate events for each week
    while (currentDate <= effectiveEnd) {
      const [hours, minutes] = course.schedule.time.split(':').map(Number);
      const eventDate = new Date(currentDate);
      eventDate.setHours(hours, minutes, 0, 0);
      
      events.push({
        id: `${course.id}_${eventDate.getTime()}`,
        title: course.name,
        type: 'course',
        courseId: course.id,
        teacherId: course.teacherId,
        enrolledStudents: course.enrolledStudents,
        start: eventDate,
        end: new Date(eventDate.getTime() + course.schedule.duration * 60000),
        location: course.location,
        color: this.getCourseColor(course.style),
        recurring: true,
        description: course.description,
        level: course.level,
        style: course.style
      });
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return events;
  }
  
  // Create booking event
  createBookingEvent(booking) {
    const [hours, minutes] = booking.time.split(':').map(Number);
    const startDate = new Date(booking.date);
    startDate.setHours(hours, minutes, 0, 0);
    
    return {
      id: `booking_${booking.id}`,
      title: 'Lezione Privata',
      type: 'booking',
      bookingId: booking.id,
      studentId: booking.studentId,
      teacherId: booking.teacherId,
      start: startDate,
      end: new Date(startDate.getTime() + booking.duration * 60000),
      status: booking.status,
      color: this.getBookingColor(booking.status),
      description: booking.notes || 'Lezione privata'
    };
  }
  
  // Create special event
  createSpecialEvent(event) {
    const [hours, minutes] = event.time.split(':').map(Number);
    const startDate = new Date(event.date);
    startDate.setHours(hours, minutes, 0, 0);
    
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);
    const endDate = new Date(event.date);
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    return {
      id: `event_${event.id}`,
      title: event.name,
      type: 'special',
      eventId: event.id,
      start: startDate,
      end: endDate,
      location: event.location,
      color: this.getEventColor(event.type),
      description: event.description,
      price: event.price,
      registeredParticipants: event.registeredParticipants,
      maxParticipants: event.maxParticipants
    };
  }
  
  // Check user access to course
  userHasAccessToCourse(course, user) {
    if (!user) return false;
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return true;
      
      case USER_ROLES.TEACHER:
        return course.teacherId === user.teacherId;
      
      case USER_ROLES.STUDENT:
        return course.enrolledStudents.includes(user.studentId);
      
      default:
        return false;
    }
  }
  
  // Check user access to booking
  userHasAccessToBooking(booking, user) {
    if (!user) return false;
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return true;
      
      case USER_ROLES.TEACHER:
        return booking.teacherId === user.teacherId;
      
      case USER_ROLES.STUDENT:
        return booking.studentId === user.studentId;
      
      default:
        return false;
    }
  }
  
  // Get course color based on style
  getCourseColor(style) {
    const colors = {
      'Salsa': '#e53935',
      'Bachata': '#8e24aa',
      'Kizomba': '#1e88e5',
      'Reggaeton': '#43a047',
      'Rueda de Casino': '#fb8c00',
      'Son Cubano': '#6d4c41',
      'Cha Cha Cha': '#ec407a',
      'Rumba': '#5e35b1',
      'Afro-Cuban': '#fdd835',
      'Merengue': '#00acc1'
    };
    
    return colors[style] || '#757575';
  }
  
  // Get booking color based on status
  getBookingColor(status) {
    const colors = {
      [BOOKING_STATUS.PENDING]: '#ff9800',
      [BOOKING_STATUS.CONFIRMED]: '#4caf50',
      [BOOKING_STATUS.CANCELLED]: '#f44336',
      [BOOKING_STATUS.COMPLETED]: '#9e9e9e'
    };
    
    return colors[status] || '#757575';
  }
  
  // Get event color based on type
  getEventColor(type) {
    const colors = {
      'social': '#e91e63',
      'workshop': '#3f51b5',
      'competition': '#ff5722',
      'performance': '#9c27b0'
    };
    
    return colors[type] || '#607d8b';
  }
  
  // Get available time slots for booking
  getAvailableSlots(teacherId, date) {
    const teacher = ArrayHelpers.findById(Storage.get(STORAGE_KEYS.TEACHERS) || [], teacherId);
    if (!teacher) return [];
    
    const dayOfWeek = DateHelpers.getDayName(date).toLowerCase();
    const availability = teacher.availability[dayOfWeek] || [];
    
    if (availability.length === 0) return [];
    
    // Get existing bookings for that day
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const dayBookings = bookings.filter(b => 
      b.teacherId === teacherId &&
      b.date === DateHelpers.formatDate(date, 'short') &&
      (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.PENDING)
    );
    
    const slots = [];
    
    availability.forEach(timeRange => {
      const [startTime, endTime] = timeRange.split('-');
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      // Generate 30-minute slots
      let currentHour = startHour;
      let currentMin = startMin;
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const slotTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        
        // Check if slot is available
        const isBooked = dayBookings.some(booking => {
          const [bookingHour, bookingMin] = booking.time.split(':').map(Number);
          const bookingStart = bookingHour * 60 + bookingMin;
          const bookingEnd = bookingStart + booking.duration;
          const slotStart = currentHour * 60 + currentMin;
          const slotEnd = slotStart + 30;
          
          return (slotStart < bookingEnd && slotEnd > bookingStart);
        });
        
        if (!isBooked) {
          slots.push({
            time: slotTime,
            available: true
          });
        }
        
        // Move to next slot
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour++;
          currentMin = 0;
        }
      }
    });
    
    return slots;
  }
  
  // Create new booking
  async createBooking(bookingData) {
    try {
      const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
      
      // Validate booking doesn't conflict
      const conflicts = this.checkBookingConflicts(bookingData);
      if (conflicts.length > 0) {
        return {
          success: false,
          message: 'Orario non disponibile'
        };
      }
      
      const newBooking = {
        id: StringHelpers.generateId('booking'),
        ...bookingData,
        status: BOOKING_STATUS.PENDING,
        createdAt: new Date().toISOString()
      };
      
      bookings.push(newBooking);
      Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
      
      // Create notification for teacher
      this.createBookingNotification(newBooking);
      
      return {
        success: true,
        booking: newBooking
      };
      
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        message: 'Errore nella creazione della prenotazione'
      };
    }
  }
  
  // Check booking conflicts
  checkBookingConflicts(bookingData) {
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    
    return bookings.filter(booking => {
      // Same teacher, same day
      if (booking.teacherId !== bookingData.teacherId || 
          booking.date !== bookingData.date) {
        return false;
      }
      
      // Skip cancelled bookings
      if (booking.status === BOOKING_STATUS.CANCELLED) {
        return false;
      }
      
      // Check time overlap
      const [newHour, newMin] = bookingData.time.split(':').map(Number);
      const [existingHour, existingMin] = booking.time.split(':').map(Number);
      
      const newStart = newHour * 60 + newMin;
      const newEnd = newStart + bookingData.duration;
      const existingStart = existingHour * 60 + existingMin;
      const existingEnd = existingStart + booking.duration;
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }
  
  // Update booking status
  updateBookingStatus(bookingId, status) {
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const booking = ArrayHelpers.findById(bookings, bookingId);
    
    if (!booking) return false;
    
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    
    Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
    
    // Create notification
    if (status === BOOKING_STATUS.CONFIRMED) {
      this.notificationService.createInAppNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Prenotazione Confermata',
        message: `La tua lezione del ${DateHelpers.formatDate(booking.date)} alle ${booking.time} è stata confermata`,
        targetRole: USER_ROLES.STUDENT,
        data: { studentId: booking.studentId, bookingId: booking.id }
      });
    } else if (status === BOOKING_STATUS.CANCELLED) {
      this.notificationService.createInAppNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Prenotazione Cancellata',
        message: `La lezione del ${DateHelpers.formatDate(booking.date)} alle ${booking.time} è stata cancellata`,
        targetRole: USER_ROLES.STUDENT,
        data: { studentId: booking.studentId, bookingId: booking.id }
      });
    }
    
    return true;
  }
  
  // Get calendar view
  getCalendarView(view, date, filters = {}) {
    let startDate, endDate;
    
    switch (view) {
      case CALENDAR_VIEWS.DAY:
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case CALENDAR_VIEWS.WEEK:
        startDate = this.getWeekStart(date);
        endDate = this.getWeekEnd(date);
        break;
      
      case CALENDAR_VIEWS.MONTH:
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case CALENDAR_VIEWS.LIST:
        // List view shows next 30 days
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = DateHelpers.addDays(startDate, 30);
        break;
    }
    
    const events = this.getEvents(startDate, endDate, filters);
    
    return {
      view: view,
      date: date,
      startDate: startDate,
      endDate: endDate,
      events: events,
      filters: filters
    };
  }
  
  // Get week start (Monday)
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  }
  
  // Get week end (Sunday)
  getWeekEnd(date) {
    const start = this.getWeekStart(date);
    const end = DateHelpers.addDays(start, 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  
  // Create booking notification
  createBookingNotification(booking) {
    const student = ArrayHelpers.findById(Storage.get(STORAGE_KEYS.STUDENTS) || [], booking.studentId);
    
    this.notificationService.createInAppNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: 'Nuova Richiesta Prenotazione',
      message: `${student ? student.firstName + ' ' + student.lastName : 'Uno studente'} ha richiesto una lezione per ${DateHelpers.formatDate(booking.date)} alle ${booking.time}`,
      targetRole: USER_ROLES.TEACHER,
      data: { teacherId: booking.teacherId, bookingId: booking.id }
    });
  }
  
  // Export calendar to ICS
  exportToICS(events) {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Boricua Dance Studio//Calendar//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    events.forEach(event => {
      const uid = `${event.id}@boricuadance.com`;
      const dtstart = this.formatICSDate(event.start);
      const dtend = this.formatICSDate(event.end);
      
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${uid}`);
      icsContent.push(`DTSTAMP:${this.formatICSDate(new Date())}`);
      icsContent.push(`DTSTART:${dtstart}`);
      icsContent.push(`DTEND:${dtend}`);
      icsContent.push(`SUMMARY:${event.title}`);
      
      if (event.location) {
        icsContent.push(`LOCATION:${event.location}`);
      }
      
      if (event.description) {
        icsContent.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
      }
      
      icsContent.push('END:VEVENT');
    });
    
    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
  }
  
  // Format date for ICS
  formatICSDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }
  
  // Get upcoming events for dashboard
  getUpcomingEvents(limit = 5) {
    const user = Storage.get(STORAGE_KEYS.USER);
    const startDate = new Date();
    const endDate = DateHelpers.addDays(startDate, 30);
    
    const events = this.getEvents(startDate, endDate);
    
    // Filter based on user role
    let filteredEvents = events;
    
    if (user?.role === USER_ROLES.STUDENT) {
      filteredEvents = events.filter(e => 
        e.studentId === user.studentId ||
        (e.enrolledStudents && e.enrolledStudents.includes(user.studentId)) ||
        e.type === 'special'
      );
    } else if (user?.role === USER_ROLES.TEACHER) {
      filteredEvents = events.filter(e => 
        e.teacherId === user.teacherId ||
        e.type === 'special'
      );
    }
    
    return filteredEvents.slice(0, limit);
  }
  
  // Get teacher schedule
  getTeacherSchedule(teacherId, date) {
    const weekStart = this.getWeekStart(date);
    const weekEnd = this.getWeekEnd(date);
    
    const events = this.getEvents(weekStart, weekEnd, { teacherId });
    
    // Group by day
    const schedule = {};
    const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    
    days.forEach((day, index) => {
      const dayDate = DateHelpers.addDays(weekStart, index);
      schedule[day] = events.filter(e => 
        e.start.toDateString() === dayDate.toDateString()
      );
    });
    
    return schedule;
  }
}

// No global instance