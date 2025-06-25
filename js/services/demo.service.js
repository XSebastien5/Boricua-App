// Demo Service - Boricua Dance Studio

class DemoService {
  constructor() {
    this.initialized = false;
  }
  
  // Initialize demo data
  initializeDemoData() {
    if (this.initialized) return;
    
    console.log('Initializing demo data...');
    
    // Create demo teachers
    this.createDemoTeachers();
    
    // Create demo students
    this.createDemoStudents();
    
    // Create demo courses
    this.createDemoCourses();
    
    // Create demo subscriptions
    this.createDemoSubscriptions();
    
    // Create demo bookings
    this.createDemoBookings();
    
    // Create demo payments
    this.createDemoPayments();
    
    // Create demo attendance
    this.createDemoAttendance();
    
    // Create demo communications
    this.createDemoCommunications();
    
    // Create demo promotions
    this.createDemoPromotions();
    
    // Create demo events
    this.createDemoEvents();
    
    // Create demo course mappings
    this.createDemoCourseMappings();
    
    // Initialize gamification
    this.initializeGamification();
    
    this.initialized = true;
    console.log('Demo data initialized successfully');
  }
  
  createDemoTeachers() {
    const teachers = [
      {
        id: 'teacher_1',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'maestro@boricua.com',
        phone: '333 1234567',
        password: btoa('maestro123'),
        specialties: ['Salsa', 'Bachata', 'Merengue'],
        bio: 'Maestro internazionale con 15 anni di esperienza',
        imageUrl: '',
        availability: {
          monday: ['18:00-22:00'],
          tuesday: ['18:00-22:00'],
          wednesday: ['18:00-22:00'],
          thursday: ['18:00-22:00'],
          friday: ['18:00-22:00'],
          saturday: ['10:00-13:00', '15:00-19:00']
        },
        rating: 4.8,
        courses: [],
        status: 'active',
        joinedDate: '2020-01-15'
      },
      {
        id: 'teacher_2',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        email: 'maria.gonzalez@boricua.com',
        phone: '333 2345678',
        password: btoa('maria123'),
        specialties: ['Kizomba', 'Reggaeton', 'Afro-Cuban'],
        bio: 'Specialista in danze afro-caraibiche',
        imageUrl: '',
        availability: {
          monday: ['19:00-22:00'],
          tuesday: ['19:00-22:00'],
          thursday: ['19:00-22:00'],
          friday: ['19:00-22:00'],
          saturday: ['14:00-18:00']
        },
        rating: 4.9,
        courses: [],
        status: 'active',
        joinedDate: '2021-03-20'
      },
      {
        id: 'teacher_3',
        firstName: 'Antonio',
        lastName: 'Martinez',
        email: 'antonio.martinez@boricua.com',
        phone: '333 3456789',
        password: btoa('antonio123'),
        specialties: ['Rueda de Casino', 'Son Cubano', 'Cha Cha Cha'],
        bio: 'Campione nazionale di balli cubani',
        imageUrl: '',
        availability: {
          tuesday: ['20:00-22:00'],
          wednesday: ['20:00-22:00'],
          thursday: ['20:00-22:00'],
          saturday: ['16:00-20:00'],
          sunday: ['10:00-13:00']
        },
        rating: 4.7,
        courses: [],
        status: 'active',
        joinedDate: '2019-09-10'
      }
    ];
    
    Storage.set(STORAGE_KEYS.TEACHERS, teachers);
  }
  
  createDemoStudents() {
    const students = [
      {
        id: 'student_1',
        firstName: 'Marco',
        lastName: 'Rossi',
        email: 'allievo@boricua.com',
        phone: '339 1234567',
        password: btoa('allievo123'),
        birthDate: '1995-05-15',
        birthPlace: 'Napoli',
        fiscalCode: 'RSSMRC95E15F839X',
        address: 'Via Toledo 123',
        city: 'Napoli',
        postalCode: '80134',
        status: STUDENT_STATUS.ACTIVE,
        registrationDate: '2023-09-01',
        courses: ['course_1', 'course_3'],
        subscriptions: ['sub_1'],
        points: 250,
        badges: ['first_class', 'perfect_week'],
        notes: 'Ottimo allievo, molto motivato',
        emergencyContact: {
          name: 'Anna Rossi',
          phone: '339 7654321',
          relationship: 'Madre'
        }
      },
      {
        id: 'student_2',
        firstName: 'Giulia',
        lastName: 'Esposito',
        email: 'giulia.esposito@email.com',
        phone: '340 2345678',
        password: btoa('giulia123'),
        birthDate: '1998-08-22',
        birthPlace: 'Napoli',
        fiscalCode: 'SPSGLI98M62F839Z',
        address: 'Via dei Mille 45',
        city: 'Napoli',
        postalCode: '80121',
        status: STUDENT_STATUS.ACTIVE,
        registrationDate: '2023-10-15',
        courses: ['course_2', 'course_4'],
        subscriptions: ['sub_2'],
        points: 180,
        badges: ['first_class'],
        notes: ''
      },
      {
        id: 'student_3',
        firstName: 'Francesco',
        lastName: 'Russo',
        email: 'francesco.russo@email.com',
        phone: '341 3456789',
        password: btoa('francesco123'),
        birthDate: '2000-03-10',
        birthPlace: 'Caserta',
        fiscalCode: 'RSSFNC00C10B963P',
        address: 'Corso Umberto 78',
        city: 'Napoli',
        postalCode: '80138',
        status: STUDENT_STATUS.PENDING,
        registrationDate: '2024-01-05',
        courses: [],
        subscriptions: [],
        points: 0,
        badges: [],
        notes: 'Nuovo iscritto, in attesa di approvazione'
      },
      {
        id: 'student_4',
        firstName: 'Alessia',
        lastName: 'Romano',
        email: 'alessia.romano@email.com',
        phone: '342 4567890',
        password: btoa('alessia123'),
        birthDate: '1996-11-30',
        birthPlace: 'Salerno',
        fiscalCode: 'RMNLSS96S70H703K',
        address: 'Via Chiaia 156',
        city: 'Napoli',
        postalCode: '80121',
        status: STUDENT_STATUS.ACTIVE,
        registrationDate: '2022-06-20',
        courses: ['course_1', 'course_2', 'course_5'],
        subscriptions: ['sub_3'],
        points: 580,
        badges: ['first_class', 'perfect_week', 'dance_master'],
        notes: 'Allieva avanzata, partecipa a competizioni'
      }
    ];
    
    Storage.set(STORAGE_KEYS.STUDENTS, students);
  }
  
  createDemoCourses() {
    const courses = [
      {
        id: 'course_1',
        name: 'Salsa Principianti',
        description: 'Corso base di salsa cubana per principianti assoluti',
        teacherId: 'teacher_1',
        level: 'Principiante',
        style: 'Salsa',
        startDate: '2024-01-15',
        endDate: '2024-06-15',
        schedule: {
          dayOfWeek: 'monday',
          time: '19:00',
          duration: 60
        },
        maxStudents: 20,
        enrolledStudents: ['student_1', 'student_4'],
        price: 50,
        status: COURSE_STATUS.ACTIVE,
        location: 'Sala 1',
        requirements: 'Nessun requisito particolare'
      },
      {
        id: 'course_2',
        name: 'Bachata Intermedio',
        description: 'Corso di bachata per allievi con esperienza base',
        teacherId: 'teacher_1',
        level: 'Intermedio',
        style: 'Bachata',
        startDate: '2024-01-16',
        endDate: '2024-06-16',
        schedule: {
          dayOfWeek: 'tuesday',
          time: '20:00',
          duration: 60
        },
        maxStudents: 18,
        enrolledStudents: ['student_2', 'student_4'],
        price: 60,
        status: COURSE_STATUS.ACTIVE,
        location: 'Sala 1',
        requirements: 'Minimo 6 mesi di esperienza'
      },
      {
        id: 'course_3',
        name: 'Kizomba Base',
        description: 'Introduzione alla kizomba, il tango africano',
        teacherId: 'teacher_2',
        level: 'Principiante',
        style: 'Kizomba',
        startDate: '2024-01-17',
        endDate: '2024-06-17',
        schedule: {
          dayOfWeek: 'wednesday',
          time: '19:00',
          duration: 60
        },
        maxStudents: 16,
        enrolledStudents: ['student_1'],
        price: 55,
        status: COURSE_STATUS.ACTIVE,
        location: 'Sala 2',
        requirements: 'Nessun requisito particolare'
      },
      {
        id: 'course_4',
        name: 'Reggaeton Fitness',
        description: 'Allenamento e divertimento con ritmi reggaeton',
        teacherId: 'teacher_2',
        level: 'Tutti i livelli',
        style: 'Reggaeton',
        startDate: '2024-01-18',
        endDate: '2024-06-18',
        schedule: {
          dayOfWeek: 'thursday',
          time: '19:00',
          duration: 60
        },
        maxStudents: 25,
        enrolledStudents: ['student_2'],
        price: 45,
        status: COURSE_STATUS.ACTIVE,
        location: 'Sala 3',
        requirements: 'Nessun requisito particolare'
      },
      {
        id: 'course_5',
        name: 'Rueda de Casino',
        description: 'Ballo di gruppo in cerchio con cambi di partner',
        teacherId: 'teacher_3',
        level: 'Intermedio',
        style: 'Rueda de Casino',
        startDate: '2024-01-20',
        endDate: '2024-06-20',
        schedule: {
          dayOfWeek: 'saturday',
          time: '17:00',
          duration: 90
        },
        maxStudents: 24,
        enrolledStudents: ['student_4'],
        price: 70,
        status: COURSE_STATUS.ACTIVE,
        location: 'Sala 1',
        requirements: 'Conoscenza base di salsa'
      }
    ];
    
    Storage.set(STORAGE_KEYS.COURSES, courses);
  }
  
  createDemoSubscriptions() {
    const subscriptions = [
      {
        id: 'sub_1',
        studentId: 'student_1',
        type: SUBSCRIPTION_TYPES.MONTHLY,
        name: 'Abbonamento Mensile',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        price: 80,
        courses: ['course_1', 'course_3'],
        status: 'active',
        autoRenew: true,
        paymentMethod: 'credit_card'
      },
      {
        id: 'sub_2',
        studentId: 'student_2',
        type: SUBSCRIPTION_TYPES.QUARTERLY,
        name: 'Abbonamento Trimestrale',
        startDate: '2023-11-01',
        endDate: '2024-01-31',
        price: 200,
        courses: ['course_2', 'course_4'],
        status: 'active',
        autoRenew: false,
        paymentMethod: 'bank_transfer'
      },
      {
        id: 'sub_3',
        studentId: 'student_4',
        type: SUBSCRIPTION_TYPES.ANNUAL,
        name: 'Abbonamento Annuale Premium',
        startDate: '2023-07-01',
        endDate: '2024-06-30',
        price: 800,
        courses: 'all',
        status: 'active',
        autoRenew: true,
        paymentMethod: 'credit_card',
        benefits: ['Accesso a tutti i corsi', 'Lezioni private scontate', 'Eventi esclusivi']
      }
    ];
    
    Storage.set(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }
  
  createDemoBookings() {
    const bookings = [
      {
        id: 'booking_1',
        studentId: 'student_1',
        teacherId: 'teacher_1',
        date: DateHelpers.addDays(new Date(), 2).toISOString().split('T')[0],
        time: '18:00',
        duration: 60,
        type: 'private_lesson',
        status: BOOKING_STATUS.CONFIRMED,
        price: 40,
        notes: 'Focus su giri e figure avanzate',
        createdAt: new Date().toISOString()
      },
      {
        id: 'booking_2',
        studentId: 'student_2',
        teacherId: 'teacher_2',
        date: DateHelpers.addDays(new Date(), 5).toISOString().split('T')[0],
        time: '19:00',
        duration: 60,
        type: 'private_lesson',
        status: BOOKING_STATUS.PENDING,
        price: 40,
        notes: 'Prima lezione privata',
        createdAt: new Date().toISOString()
      },
      {
        id: 'booking_3',
        studentId: 'student_4',
        teacherId: 'teacher_1',
        date: DateHelpers.addDays(new Date(), -3).toISOString().split('T')[0],
        time: '17:00',
        duration: 90,
        type: 'private_lesson',
        status: BOOKING_STATUS.COMPLETED,
        price: 60,
        notes: 'Preparazione per competizione',
        createdAt: DateHelpers.addDays(new Date(), -10).toISOString()
      }
    ];
    
    Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
  }
  
  createDemoPayments() {
    const payments = [
      {
        id: 'payment_1',
        studentId: 'student_1',
        amount: 80,
        date: '2024-01-01',
        method: 'credit_card',
        status: PAYMENT_STATUS.COMPLETED,
        type: 'subscription',
        referenceId: 'sub_1',
        description: 'Abbonamento Mensile - Gennaio 2024',
        invoice: 'INV-2024-001'
      },
      {
        id: 'payment_2',
        studentId: 'student_2',
        amount: 200,
        date: '2023-11-01',
        method: 'bank_transfer',
        status: PAYMENT_STATUS.COMPLETED,
        type: 'subscription',
        referenceId: 'sub_2',
        description: 'Abbonamento Trimestrale',
        invoice: 'INV-2023-156'
      },
      {
        id: 'payment_3',
        studentId: 'student_4',
        amount: 60,
        date: DateHelpers.addDays(new Date(), -3).toISOString().split('T')[0],
        method: 'cash',
        status: PAYMENT_STATUS.COMPLETED,
        type: 'booking',
        referenceId: 'booking_3',
        description: 'Lezione privata 90 minuti',
        invoice: 'INV-2024-012'
      },
      {
        id: 'payment_4',
        studentId: 'student_4',
        amount: 800,
        date: '2023-07-01',
        method: 'credit_card',
        status: PAYMENT_STATUS.COMPLETED,
        type: 'subscription',
        referenceId: 'sub_3',
        description: 'Abbonamento Annuale Premium',
        invoice: 'INV-2023-089'
      }
    ];
    
    Storage.set(STORAGE_KEYS.PAYMENTS, payments);
  }
  
  createDemoAttendance() {
    const attendance = [];
    const students = ['student_1', 'student_2', 'student_4'];
    const courses = ['course_1', 'course_2', 'course_3', 'course_4', 'course_5'];
    
    // Generate attendance for last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = DateHelpers.addDays(new Date(), -i);
      const dayOfWeek = date.getDay();
      
      // Skip Sundays
      if (dayOfWeek === 0) continue;
      
      // Random attendance
      students.forEach(studentId => {
        if (Math.random() > 0.3) { // 70% attendance rate
          const courseId = courses[Math.floor(Math.random() * courses.length)];
          
          attendance.push({
            id: StringHelpers.generateId('att'),
            studentId: studentId,
            courseId: courseId,
            date: date.toISOString().split('T')[0],
            time: '19:00',
            present: true,
            checkedInAt: date.toISOString(),
            method: Math.random() > 0.5 ? 'qr_code' : 'manual'
          });
        }
      });
    }
    
    Storage.set(STORAGE_KEYS.ATTENDANCE, attendance);
  }
  
  createDemoCommunications() {
    const communications = [
      {
        id: 'comm_1',
        title: 'Orario Festività Natalizie',
        message: 'La scuola rimarrà chiusa dal 24 dicembre al 7 gennaio. Le lezioni riprenderanno regolarmente lunedì 8 gennaio. Buone feste a tutti!',
        type: 'announcement',
        priority: 'high',
        targetAudience: 'all',
        createdBy: 'admin_1',
        createdAt: '2023-12-15T10:00:00Z',
        validUntil: '2024-01-08T00:00:00Z',
        status: 'active'
      },
      {
        id: 'comm_2',
        title: 'Nuovo Corso di Rumba',
        message: 'A partire da febbraio inizierà il nuovo corso di Rumba con il maestro Antonio. Iscrizioni aperte!',
        type: 'announcement',
        priority: 'normal',
        targetAudience: 'all',
        createdBy: 'admin_1',
        createdAt: '2024-01-10T14:00:00Z',
        validUntil: '2024-02-01T00:00:00Z',
        status: 'active'
      },
      {
        id: 'comm_3',
        title: 'Reminder Pagamento',
        message: 'Ricordiamo di rinnovare gli abbonamenti in scadenza entro la fine del mese.',
        type: 'reminder',
        priority: 'normal',
        targetAudience: 'students',
        createdBy: 'admin_1',
        createdAt: '2024-01-20T09:00:00Z',
        validUntil: '2024-01-31T23:59:59Z',
        status: 'active'
      }
    ];
    
    Storage.set(STORAGE_KEYS.COMMUNICATIONS, communications);
  }
  
  createDemoPromotions() {
    const promotions = [
      {
        id: 'promo_1',
        name: 'Promo Nuovo Anno',
        description: 'Sconto 20% su tutti gli abbonamenti trimestrali',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-01-01',
        validUntil: '2024-01-31',
        code: 'NEWYEAR2024',
        maxUses: 50,
        usedCount: 12,
        applicableTo: ['subscriptions'],
        conditions: ['Solo per nuovi iscritti'],
        status: 'active'
      },
      {
        id: 'promo_2',
        name: 'Porta un Amico',
        description: 'Porta un amico e ricevi 1 mese gratis',
        discountType: 'referral',
        discountValue: 100,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        code: 'FRIEND2024',
        maxUses: null,
        usedCount: 5,
        applicableTo: ['subscriptions'],
        conditions: ['L\'amico deve iscriversi per almeno 3 mesi'],
        status: 'active'
      }
    ];
    
    Storage.set(STORAGE_KEYS.PROMOTIONS, promotions);
  }
  
  createDemoEvents() {
    const events = [
      {
        id: 'event_1',
        name: 'Serata Salsa Social',
        description: 'Serata di ballo sociale con DJ e animazione',
        date: DateHelpers.addDays(new Date(), 10).toISOString().split('T')[0],
        time: '21:00',
        endTime: '01:00',
        location: 'Sala principale',
        price: 10,
        maxParticipants: 100,
        registeredParticipants: ['student_1', 'student_2', 'student_4'],
        imageUrl: '',
        type: 'social',
        status: 'upcoming'
      },
      {
        id: 'event_2',
        name: 'Workshop Bachata Sensual',
        description: 'Workshop intensivo con maestri internazionali',
        date: DateHelpers.addDays(new Date(), 20).toISOString().split('T')[0],
        time: '15:00',
        endTime: '18:00',
        location: 'Tutte le sale',
        price: 35,
        maxParticipants: 60,
        registeredParticipants: ['student_4'],
        imageUrl: '',
        type: 'workshop',
        status: 'upcoming',
        instructors: ['Maestro ospite internazionale']
      },
      {
        id: 'event_3',
        name: 'Competizione Interna',
        description: 'Gara amichevole tra allievi della scuola',
        date: DateHelpers.addDays(new Date(), 45).toISOString().split('T')[0],
        time: '16:00',
        endTime: '20:00',
        location: 'Sala principale',
        price: 0,
        maxParticipants: 50,
        registeredParticipants: [],
        imageUrl: '',
        type: 'competition',
        status: 'upcoming',
        categories: ['Principianti', 'Intermedi', 'Avanzati']
      }
    ];
    
    Storage.set(STORAGE_KEYS.EVENTS, events);
  }
  
  createDemoCourseMappings() {
    const courseMappings = [
      {
        id: 'mapping_1',
        courseId: 'course_1',
        teacherId: 'teacher_1',
        figures: [
          { id: 'fig_1', name: 'Passo Base', completed: true, order: 1 },
          { id: 'fig_2', name: 'Dile Que No', completed: true, order: 2 },
          { id: 'fig_3', name: 'Enchufla', completed: true, order: 3 },
          { id: 'fig_4', name: 'Sombrero', completed: false, order: 4 },
          { id: 'fig_5', name: 'Vacilala', completed: false, order: 5 },
          { id: 'fig_6', name: 'Setenta', completed: false, order: 6 }
        ],
        createdAt: '2024-01-15',
        updatedAt: '2024-01-22'
      },
      {
        id: 'mapping_2',
        courseId: 'course_2',
        teacherId: 'teacher_1',
        figures: [
          { id: 'fig_7', name: 'Passo Base Bachata', completed: true, order: 1 },
          { id: 'fig_8', name: 'Lateral Basic', completed: true, order: 2 },
          { id: 'fig_9', name: 'Giro Semplice', completed: false, order: 3 },
          { id: 'fig_10', name: 'Giro con Cambré', completed: false, order: 4 },
          { id: 'fig_11', name: 'Wave', completed: false, order: 5 }
        ],
        createdAt: '2024-01-16',
        updatedAt: '2024-01-23'
      },
      {
        id: 'mapping_3',
        courseId: 'course_3',
        teacherId: 'teacher_2',
        figures: [
          { id: 'fig_12', name: 'Base Kizomba', completed: true, order: 1 },
          { id: 'fig_13', name: 'Saida Lateral', completed: true, order: 2 },
          { id: 'fig_14', name: 'Virgula', completed: false, order: 3 },
          { id: 'fig_15', name: 'Estrela', completed: false, order: 4 }
        ],
        createdAt: '2024-01-17',
        updatedAt: '2024-01-24'
      }
    ];
    
    Storage.set(STORAGE_KEYS.COURSE_MAPPINGS, courseMappings);
  }
  
  initializeGamification() {
    // Badges are already set in constants
    Storage.set(STORAGE_KEYS.GAMIFICATION, DEFAULT_BADGES);
    
    // Initialize user badges and points
    const userBadges = {
      'student_1': [
        { ...DEFAULT_BADGES[0], earnedAt: '2023-09-02' },
        { ...DEFAULT_BADGES[1], earnedAt: '2023-11-15' }
      ],
      'student_2': [
        { ...DEFAULT_BADGES[0], earnedAt: '2023-10-16' }
      ],
      'student_4': [
        { ...DEFAULT_BADGES[0], earnedAt: '2022-06-21' },
        { ...DEFAULT_BADGES[1], earnedAt: '2023-01-10' },
        { ...DEFAULT_BADGES[2], earnedAt: '2023-09-15' }
      ]
    };
    
    const userPoints = {
      'student_1': 250,
      'student_2': 180,
      'student_3': 0,
      'student_4': 580
    };
    
    Storage.set(STORAGE_KEYS.USER_BADGES, userBadges);
    Storage.set(STORAGE_KEYS.USER_POINTS, userPoints);
    
    // Create some demo notifications
    const notifications = [
      {
        id: 'notif_1',
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Badge Guadagnato!',
        message: 'Hai guadagnato il badge "Prima Lezione"',
        date: '2023-09-02T19:30:00Z',
        read: true,
        targetRole: USER_ROLES.STUDENT,
        data: { studentId: 'student_1', badgeId: 'first_class' }
      },
      {
        id: 'notif_2',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Nuova Richiesta Iscrizione',
        message: 'Francesco Russo ha richiesto l\'iscrizione',
        date: '2024-01-05T14:22:00Z',
        read: false,
        targetRole: USER_ROLES.ADMIN,
        data: { studentId: 'student_3' }
      },
      {
        id: 'notif_3',
        type: NOTIFICATION_TYPES.REMINDER,
        title: 'Promemoria Lezione',
        message: 'Hai una lezione privata domani alle 18:00',
        date: new Date().toISOString(),
        read: false,
        targetRole: USER_ROLES.STUDENT,
        data: { studentId: 'student_1', bookingId: 'booking_1' }
      }
    ];
    
    Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  
  // Reset to demo data
  resetToDemo() {
    // Clear all data
    Storage.clear();
    
    // Reinitialize
    this.initialized = false;
    this.initializeDemoData();
    
    Toast.show('Dati demo ripristinati', 'success');
  }
  
  // Generate random data for testing
  generateRandomStudent() {
    const firstNames = ['Luigi', 'Anna', 'Giuseppe', 'Maria', 'Antonio', 'Rosa', 'Giovanni', 'Teresa'];
    const lastNames = ['Bianchi', 'Verdi', 'Russo', 'Ferrari', 'Romano', 'Colombo', 'Ricci', 'Marino'];
    const cities = ['Napoli', 'Salerno', 'Caserta', 'Avellino', 'Benevento'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    return {
      id: StringHelpers.generateId('student'),
      firstName: firstName,
      lastName: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `3${NumberHelpers.random(10, 99)} ${NumberHelpers.random(1000000, 9999999)}`,
      password: btoa('password123'),
      birthDate: `${NumberHelpers.random(1970, 2005)}-${String(NumberHelpers.random(1, 12)).padStart(2, '0')}-${String(NumberHelpers.random(1, 28)).padStart(2, '0')}`,
      birthPlace: city,
      fiscalCode: this.generateRandomFiscalCode(),
      address: `Via ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${NumberHelpers.random(1, 200)}`,
      city: city,
      postalCode: String(NumberHelpers.random(80000, 84999)),
      status: STUDENT_STATUS.PENDING,
      registrationDate: new Date().toISOString(),
      courses: [],
      subscriptions: [],
      points: 0,
      badges: [],
      notes: ''
    };
  }
  
  generateRandomFiscalCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let code = '';
    // 6 letters
    for (let i = 0; i < 6; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
    // 2 numbers
    code += numbers[Math.floor(Math.random() * numbers.length)];
    code += numbers[Math.floor(Math.random() * numbers.length)];
    // 1 letter
    code += letters[Math.floor(Math.random() * letters.length)];
    // 2 numbers
    code += numbers[Math.floor(Math.random() * numbers.length)];
    code += numbers[Math.floor(Math.random() * numbers.length)];
    // 1 letter
    code += letters[Math.floor(Math.random() * letters.length)];
    // 3 numbers
    code += numbers[Math.floor(Math.random() * numbers.length)];
    code += numbers[Math.floor(Math.random() * numbers.length)];
    code += numbers[Math.floor(Math.random() * numbers.length)];
    // 1 letter
    code += letters[Math.floor(Math.random() * letters.length)];
    
    return code;
  }
}

// Create global instance
window.DemoService = new DemoService();