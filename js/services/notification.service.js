// Notification Service - Boricua Dance Studio

class NotificationService {
  constructor(services) {
    this.toast = services.toast;
    this.permission = 'default';
    this.swRegistration = null;
    this.init();
  }
  
  async init() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }
    
    // Get current permission
    this.permission = Notification.permission;
    
    // Get service worker registration
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.error('Error getting service worker:', error);
      }
    }
  }
  
  // Request permission
  async requestPermission() {
    if (this.permission === 'granted') {
      return true;
    }
    
    if (this.permission === 'denied') {
      this.toast.show('Le notifiche sono state bloccate. Abilitale nelle impostazioni del browser.', 'warning');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        this.toast.show('Notifiche abilitate!', 'success');
        this.subscribeToNotifications();
        return true;
      } else {
        this.toast.show('Notifiche non abilitate', 'info');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }
  
  // Subscribe to push notifications
  async subscribeToNotifications() {
    if (!this.swRegistration || !this.swRegistration.pushManager) {
      console.log('Push notifications not supported');
      return;
    }
    
    try {
      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BEL2Fh9BpJNxgB0v-DxFzC8X3V1mQGYqVZdmcgYJqVJSRkEikYH_zxqMzYmYv6WGg4uOQJ0xJXVhj1kt3wm3bpI'
          )
        });
      }
      
      // Save subscription (in real app, send to server)
      console.log('Push subscription:', subscription);
      
      // Test notification
      this.showNotification('Notifiche attivate!', {
        body: 'Riceverai aggiornamenti importanti dalla scuola',
        icon: '/assets/icons/icon-192.png'
      });
      
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  }
  
  // Show notification
  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }
    
    const defaultOptions = {
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/icon-96.png',
      vibrate: [200, 100, 200],
      tag: 'boricua-notification',
      renotify: false,
      requireInteraction: false,
      silent: false,
      timestamp: Date.now(),
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    const notificationOptions = { ...defaultOptions, ...options };
    
    try {
      if (this.swRegistration && this.swRegistration.showNotification) {
        // Use service worker notification
        await this.swRegistration.showNotification(title, notificationOptions);
      } else {
        // Fallback to Notification API
        new Notification(title, notificationOptions);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
  
  // Create in-app notification
  createInAppNotification(notification) {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    
    const newNotification = {
      id: StringHelpers.generateId('notif'),
      ...notification,
      date: new Date().toISOString(),
      read: false
    };
    
    notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }
    
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    
    // Update badge
    this.updateNotificationBadge();
    
    // Show push notification if enabled
    if (notification.showPush !== false) {
      this.showNotification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/assets/icons/icon-192.png',
        data: { notificationId: newNotification.id }
      });
    }
    
    return newNotification;
  }
  
  // Get notifications for current user
  getNotifications(options = {}) {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const user = Storage.get(STORAGE_KEYS.USER);
    
    if (!user) return [];
    
    // Filter by user role
    let filtered = notifications.filter(n => 
      !n.targetRole || n.targetRole === user.role || n.targetRole === 'all'
    );
    
    // Filter by read status
    if (options.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  }
  
  // Mark notification as read
  markAsRead(notificationId) {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
      this.updateNotificationBadge();
    }
  }
  
  // Mark all as read
  markAllAsRead() {
    const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    const user = Storage.get(STORAGE_KEYS.USER);
    
    if (!user) return;
    
    notifications.forEach(n => {
      if (!n.targetRole || n.targetRole === user.role || n.targetRole === 'all') {
        n.read = true;
      }
    });
    
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    this.updateNotificationBadge();
  }
  
  // Delete notification
  deleteNotification(notificationId) {
    let notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
    notifications = notifications.filter(n => n.id !== notificationId);
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    this.updateNotificationBadge();
  }
  
  // Update notification badge
  updateNotificationBadge() {
    const unreadCount = this.getNotifications({ unreadOnly: true }).length;
    const badge = document.getElementById('notification-badge');
    
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
    
    // Update app badge (if supported)
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(unreadCount).catch(console.error);
    }
  }
  
  // Schedule notification
  scheduleNotification(notification, date) {
    // Calculate delay
    const delay = new Date(date) - new Date();
    
    if (delay <= 0) {
      // Show immediately if date is in the past
      this.createInAppNotification(notification);
      return;
    }
    
    // Schedule for future
    setTimeout(() => {
      this.createInAppNotification(notification);
    }, delay);
  }
  
  // Create reminder notifications
  createReminders() {
    const user = Storage.get(STORAGE_KEYS.USER);
    if (!user) return;
    
    // Different reminders based on role
    switch (user.role) {
      case USER_ROLES.STUDENT:
        this.createStudentReminders();
        break;
      case USER_ROLES.TEACHER:
        this.createTeacherReminders();
        break;
      case USER_ROLES.ADMIN:
        this.createAdminReminders();
        break;
    }
  }
  
  createStudentReminders() {
    const bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
    const studentId = Storage.get(STORAGE_KEYS.USER)?.studentId;
    
    if (!studentId) return;
    
    // Filter student's upcoming bookings
    const upcomingBookings = bookings.filter(b => 
      b.studentId === studentId &&
      b.status === BOOKING_STATUS.CONFIRMED &&
      new Date(b.date) > new Date()
    );
    
    // Create reminder for each booking (24 hours before)
    upcomingBookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      const reminderDate = new Date(bookingDate);
      reminderDate.setHours(reminderDate.getHours() - 24);
      
      if (reminderDate > new Date()) {
        this.scheduleNotification({
          type: NOTIFICATION_TYPES.REMINDER,
          title: 'Promemoria Lezione',
          message: `Hai una lezione domani alle ${booking.time}`,
          targetRole: USER_ROLES.STUDENT
        }, reminderDate);
      }
    });
  }
  
  createTeacherReminders() {
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const teacherId = Storage.get(STORAGE_KEYS.USER)?.teacherId;
    
    if (!teacherId) return;
    
    // Filter teacher's courses
    const teacherCourses = courses.filter(c => 
      c.teacherId === teacherId &&
      c.status === COURSE_STATUS.ACTIVE
    );
    
    // Create daily reminder for courses
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    this.scheduleNotification({
      type: NOTIFICATION_TYPES.REMINDER,
      title: 'Promemoria Corsi',
      message: `Hai ${teacherCourses.length} cors${teacherCourses.length === 1 ? 'o' : 'i'} attiv${teacherCourses.length === 1 ? 'o' : 'i'}`,
      targetRole: USER_ROLES.TEACHER
    }, tomorrow);
  }
  
  createAdminReminders() {
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const pendingStudents = students.filter(s => s.status === STUDENT_STATUS.PENDING);
    
    if (pendingStudents.length > 0) {
      this.createInAppNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Richieste in sospeso',
        message: `Ci sono ${pendingStudents.length} richieste di iscrizione in attesa`,
        targetRole: USER_ROLES.ADMIN
      });
    }
    
    // Check for expiring subscriptions
    const subscriptions = Storage.get(STORAGE_KEYS.SUBSCRIPTIONS) || [];
    const expiringCount = subscriptions.filter(s => {
      const endDate = new Date(s.endDate);
      const daysUntilExpiry = (endDate - new Date()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    }).length;
    
    if (expiringCount > 0) {
      this.createInAppNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Abbonamenti in scadenza',
        message: `${expiringCount} abbonament${expiringCount === 1 ? 'o' : 'i'} in scadenza questa settimana`,
        targetRole: USER_ROLES.ADMIN
      });
    }
  }
  
  // Utility function
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// No global instance