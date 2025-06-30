// Gamification Service - Boricua Dance Studio

class GamificationService {
  constructor(services) {
    this.notificationService = services.notification;
    this.badges = [];
    this.init();
  }
  
  init() {
    // Load badges configuration
    this.badges = Storage.get(STORAGE_KEYS.GAMIFICATION) || DEFAULT_BADGES;
  }
  
  // Check and award badges
  checkBadges(studentId) {
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES) || {};
    const studentBadges = userBadges[studentId] || [];
    const earnedBadgeIds = studentBadges.map(b => b.id);
    
    const newBadges = [];
    
    // Check each badge condition
    this.badges.forEach(badge => {
      if (!earnedBadgeIds.includes(badge.id)) {
        if (this.checkBadgeCondition(badge, studentId)) {
          newBadges.push(badge);
        }
      }
    });
    
    // Award new badges
    if (newBadges.length > 0) {
      this.awardBadges(studentId, newBadges);
    }
    
    return newBadges;
  }
  
  checkBadgeCondition(badge, studentId) {
    switch (badge.id) {
      case 'first_class':
        return this.hasAttendedFirstClass(studentId);
      
      case 'perfect_week':
        return this.hasPerfectWeekAttendance(studentId);
      
      case 'dance_master':
        return this.hasCompleted100Classes(studentId);
      
      case 'loyal_student':
        return this.hasOneYearMembership(studentId);
      
      default:
        // Custom badge conditions
        return this.checkCustomCondition(badge, studentId);
    }
  }
  
  hasAttendedFirstClass(studentId) {
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    return attendance.some(a => a.studentId === studentId && a.present);
  }
  
  hasPerfectWeekAttendance(studentId) {
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const student = ArrayHelpers.findById(Storage.get(STORAGE_KEYS.STUDENTS) || [], studentId);
    
    if (!student) return false;
    
    // Get student's courses
    const courses = Storage.get(STORAGE_KEYS.COURSES) || [];
    const studentCourses = courses.filter(c => c.enrolledStudents.includes(studentId));
    
    if (studentCourses.length === 0) return false;
    
    // Check last week attendance
    const oneWeekAgo = DateHelpers.addDays(new Date(), -7);
    const weekAttendance = attendance.filter(a => 
      a.studentId === studentId &&
      new Date(a.date) >= oneWeekAgo &&
      a.present
    );
    
    // Should have attended all scheduled classes in the week
    return weekAttendance.length >= studentCourses.length;
  }
  
  hasCompleted100Classes(studentId) {
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const studentAttendance = attendance.filter(a => 
      a.studentId === studentId && a.present
    );
    
    return studentAttendance.length >= 100;
  }
  
  hasOneYearMembership(studentId) {
    const student = ArrayHelpers.findById(Storage.get(STORAGE_KEYS.STUDENTS) || [], studentId);
    
    if (!student) return false;
    
    const registrationDate = new Date(student.registrationDate);
    const oneYearAgo = DateHelpers.addDays(new Date(), -365);
    
    return registrationDate <= oneYearAgo;
  }
  
  checkCustomCondition(badge, studentId) {
    // Implement custom badge conditions based on badge configuration
    if (badge.condition) {
      return badge.condition(studentId);
    }
    return false;
  }
  
  // Award badges to student
  awardBadges(studentId, badges) {
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES) || {};
    const studentBadges = userBadges[studentId] || [];
    
    badges.forEach(badge => {
      // Add badge with earned date
      studentBadges.push({
        ...badge,
        earnedAt: new Date().toISOString()
      });
      
      // Add points
      this.addPoints(studentId, badge.points);
      
      // Create notification
      this.createBadgeNotification(studentId, badge);
      
      // Show celebration
      this.showBadgeCelebration(badge);
    });
    
    userBadges[studentId] = studentBadges;
    Storage.set(STORAGE_KEYS.USER_BADGES, userBadges);
  }
  
  // Add points to student
  addPoints(studentId, points, reason = '') {
    const userPoints = Storage.get(STORAGE_KEYS.USER_POINTS) || {};
    const currentPoints = userPoints[studentId] || 0;
    
    userPoints[studentId] = currentPoints + points;
    Storage.set(STORAGE_KEYS.USER_POINTS, userPoints);
    
    // Check for level up
    this.checkLevelUp(studentId, currentPoints, userPoints[studentId]);
    
    // Log point transaction
    this.logPointTransaction(studentId, points, reason);
    
    return userPoints[studentId];
  }
  
  // Get student points
  getPoints(studentId) {
    const userPoints = Storage.get(STORAGE_KEYS.USER_POINTS) || {};
    return userPoints[studentId] || 0;
  }
  
  // Get student level based on points
  getLevel(points) {
    const levels = [
      { level: 1, minPoints: 0, name: 'Principiante' },
      { level: 2, minPoints: 100, name: 'Novizio' },
      { level: 3, minPoints: 250, name: 'Intermedio' },
      { level: 4, minPoints: 500, name: 'Avanzato' },
      { level: 5, minPoints: 1000, name: 'Esperto' },
      { level: 6, minPoints: 2000, name: 'Maestro' },
      { level: 7, minPoints: 5000, name: 'Gran Maestro' }
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].minPoints) {
        return levels[i];
      }
    }
    
    return levels[0];
  }
  
  // Check for level up
  checkLevelUp(studentId, oldPoints, newPoints) {
    const oldLevel = this.getLevel(oldPoints);
    const newLevel = this.getLevel(newPoints);
    
    if (newLevel.level > oldLevel.level) {
      // Level up!
      this.createLevelUpNotification(studentId, newLevel);
      this.showLevelUpCelebration(newLevel);
      
      // Award level up bonus
      const bonusPoints = newLevel.level * 50;
      this.addPoints(studentId, bonusPoints, `Level up bonus - ${newLevel.name}`);
    }
  }
  
  // Get leaderboard
  getLeaderboard(options = {}) {
    const userPoints = Storage.get(STORAGE_KEYS.USER_POINTS) || {};
    const students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    
    // Create leaderboard entries
    const leaderboard = students
      .filter(s => s.status === STUDENT_STATUS.ACTIVE)
      .map(student => ({
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        points: userPoints[student.id] || 0,
        level: this.getLevel(userPoints[student.id] || 0),
        badges: this.getStudentBadges(student.id).length
      }))
      .sort((a, b) => b.points - a.points);
    
    // Apply filters
    if (options.period) {
      // Filter by time period (would need point history for accurate filtering)
    }
    
    if (options.limit) {
      return leaderboard.slice(0, options.limit);
    }
    
    return leaderboard;
  }
  
  // Get student badges
  getStudentBadges(studentId) {
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES) || {};
    return userBadges[studentId] || [];
  }
  
  // Get student achievements summary
  getStudentAchievements(studentId) {
    const points = this.getPoints(studentId);
    const level = this.getLevel(points);
    const badges = this.getStudentBadges(studentId);
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    
    const studentAttendance = attendance.filter(a => 
      a.studentId === studentId && a.present
    );
    
    return {
      points: points,
      level: level,
      badges: badges,
      totalClasses: studentAttendance.length,
      nextLevelProgress: this.getNextLevelProgress(points),
      rank: this.getStudentRank(studentId),
      streaks: this.getStudentStreaks(studentId)
    };
  }
  
  // Get progress to next level
  getNextLevelProgress(points) {
    const currentLevel = this.getLevel(points);
    const levels = [100, 250, 500, 1000, 2000, 5000, 10000];
    
    if (currentLevel.level >= levels.length) {
      return { percentage: 100, pointsNeeded: 0 };
    }
    
    const nextLevelPoints = levels[currentLevel.level];
    const previousLevelPoints = currentLevel.level > 0 ? levels[currentLevel.level - 1] : 0;
    const pointsInLevel = points - previousLevelPoints;
    const pointsNeededForLevel = nextLevelPoints - previousLevelPoints;
    
    return {
      percentage: Math.round((pointsInLevel / pointsNeededForLevel) * 100),
      pointsNeeded: nextLevelPoints - points
    };
  }
  
  // Get student rank in leaderboard
  getStudentRank(studentId) {
    const leaderboard = this.getLeaderboard();
    const index = leaderboard.findIndex(entry => entry.studentId === studentId);
    return index === -1 ? null : index + 1;
  }
  
  // Get student streaks
  getStudentStreaks(studentId) {
    const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
    const studentAttendance = attendance
      .filter(a => a.studentId === studentId && a.present)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (studentAttendance.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    // Calculate streaks
    for (let i = 1; i < studentAttendance.length; i++) {
      const prevDate = new Date(studentAttendance[i - 1].date);
      const currDate = new Date(studentAttendance[i].date);
      const daysDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) { // Within a week
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Check if current streak is active
    const lastAttendance = new Date(studentAttendance[0].date);
    const daysSinceLastClass = Math.floor((new Date() - lastAttendance) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastClass <= 7) {
      currentStreak = tempStreak;
    }
    
    return { current: currentStreak, longest: longestStreak };
  }
  
  // Create badge notification
  createBadgeNotification(studentId, badge) {
    this.notificationService.createInAppNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Badge Guadagnato!',
      message: `Hai guadagnato il badge "${badge.name}" - ${badge.description}`,
      targetRole: USER_ROLES.STUDENT,
      data: { studentId, badgeId: badge.id }
    });
  }
  
  // Create level up notification
  createLevelUpNotification(studentId, level) {
    this.notificationService.createInAppNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Level Up!',
      message: `Sei salito al livello ${level.level} - ${level.name}!`,
      targetRole: USER_ROLES.STUDENT,
      data: { studentId, level: level.level }
    });
  }
  
  // Show badge celebration animation
  showBadgeCelebration(badge) {
    // Create celebration overlay
    const celebration = document.createElement('div');
    celebration.className = 'badge-celebration';
    celebration.innerHTML = `
      <div class="badge-celebration-content">
        <div class="gamification-badge badge-${badge.level} badge-unlock">
          <span>${badge.icon}</span>
        </div>
        <h2 class="badge-celebration-title">Badge Guadagnato!</h2>
        <h3 class="badge-celebration-name">${badge.name}</h3>
        <p class="badge-celebration-description">${badge.description}</p>
        <div class="badge-celebration-points">+${badge.points} punti</div>
      </div>
    `;
    
    document.body.appendChild(celebration);
    
    // Trigger animation
    requestAnimationFrame(() => {
      celebration.classList.add('show');
    });
    
    // Remove after animation
    setTimeout(() => {
      celebration.classList.add('hide');
      setTimeout(() => {
        document.body.removeChild(celebration);
      }, 500);
    }, 3000);
    
    // Play sound if available
    this.playSound('badge');
  }
  
  // Show level up celebration
  showLevelUpCelebration(level) {
    const celebration = document.createElement('div');
    celebration.className = 'level-up-celebration';
    celebration.innerHTML = `
      <div class="level-up-content">
        <h1 class="level-up-title">LEVEL UP!</h1>
        <div class="level-up-badge">
          <span class="level-number">${level.level}</span>
        </div>
        <h2 class="level-name">${level.name}</h2>
      </div>
    `;
    
    document.body.appendChild(celebration);
    
    requestAnimationFrame(() => {
      celebration.classList.add('show');
    });
    
    setTimeout(() => {
      celebration.classList.add('hide');
      setTimeout(() => {
        document.body.removeChild(celebration);
      }, 500);
    }, 3000);
    
    // Play sound
    this.playSound('levelup');
  }
  
  // Play celebration sound
  playSound(type) {
    // In a real app, would play audio
    console.log(`Playing ${type} sound`);
  }
  
  // Log point transaction
  logPointTransaction(studentId, points, reason) {
    // In a real app, would store point history for analytics
    console.log(`Points transaction: ${studentId} +${points} (${reason})`);
  }
  
  // Award points for actions
  awardAttendancePoints(studentId) {
    return this.addPoints(studentId, POINTS_CONFIG.ATTENDANCE, 'Presenza in classe');
  }
  
  awardBookingCompletedPoints(studentId) {
    return this.addPoints(studentId, POINTS_CONFIG.BOOKING_COMPLETED, 'Lezione privata completata');
  }
  
  awardCourseCompletedPoints(studentId) {
    return this.addPoints(studentId, POINTS_CONFIG.COURSE_COMPLETED, 'Corso completato');
  }
  
  awardReferralPoints(studentId) {
    return this.addPoints(studentId, POINTS_CONFIG.REFERRAL, 'Referral amico');
  }
  
  awardReviewPoints(studentId) {
    return this.addPoints(studentId, POINTS_CONFIG.REVIEW, 'Recensione lasciata');
  }
  
  // Admin functions
  
  // Create custom badge
  createBadge(badgeData) {
    const newBadge = {
      id: StringHelpers.generateId('badge'),
      ...badgeData,
      custom: true
    };
    
    this.badges.push(newBadge);
    Storage.set(STORAGE_KEYS.GAMIFICATION, this.badges);
    
    return newBadge;
  }
  
  // Update badge
  updateBadge(badgeId, updates) {
    const index = this.badges.findIndex(b => b.id === badgeId);
    
    if (index !== -1) {
      this.badges[index] = { ...this.badges[index], ...updates };
      Storage.set(STORAGE_KEYS.GAMIFICATION, this.badges);
      return true;
    }
    
    return false;
  }
  
  // Delete badge
  deleteBadge(badgeId) {
    // Don't allow deletion of default badges
    const badge = this.badges.find(b => b.id === badgeId);
    if (!badge || !badge.custom) return false;
    
    this.badges = this.badges.filter(b => b.id !== badgeId);
    Storage.set(STORAGE_KEYS.GAMIFICATION, this.badges);
    
    // Remove from all users
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES) || {};
    Object.keys(userBadges).forEach(userId => {
      userBadges[userId] = userBadges[userId].filter(b => b.id !== badgeId);
    });
    Storage.set(STORAGE_KEYS.USER_BADGES, userBadges);
    
    return true;
  }
  
  // Manually award badge
  manuallyAwardBadge(studentId, badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (!badge) return false;
    
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES) || {};
    const studentBadges = userBadges[studentId] || [];
    
    // Check if already has badge
    if (studentBadges.some(b => b.id === badgeId)) {
      return false;
    }
    
    this.awardBadges(studentId, [badge]);
    return true;
  }
  
  // Reset student gamification
  resetStudentGamification(studentId) {
    // Reset points
    const userPoints = Storage.get(STORAGE_KEYS.USER_POINTS) || {};
    delete userPoints[studentId];
    Storage.set(STORAGE_KEYS.USER_POINTS, userPoints);
    
    // Reset badges
    const userBadges = Storage.get(STORAGE_KEYS.USER_BADGES) || {};
    delete userBadges[studentId];
    Storage.set(STORAGE_KEYS.USER_BADGES, userBadges);
    
    return true;
  }
}

// No global instance