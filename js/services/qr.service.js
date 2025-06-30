// QR Service - Boricua Dance Studio

class QRService {
  constructor(services) {
    this.toast = services.toast;
    this.modal = services.modal;
    this.gamificationService = services.gamification;
    this.scanner = null;
    this.isScanning = false;
  }
  
  // Generate QR code for student
  generateStudentQR(studentId) {
    // Create QR data with timestamp to prevent reuse
    const timestamp = Date.now();
    const data = {
      type: 'student_attendance',
      studentId: studentId,
      timestamp: timestamp,
      expires: timestamp + (5 * 60 * 1000) // 5 minutes expiry
    };
    
    const qrData = btoa(JSON.stringify(data));
    
    // In a real app, would use a QR library like qrcode.js
    // For now, create a mock QR visualization
    return this.createMockQR(qrData);
  }
  
  // Create mock QR visualization
  createMockQR(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    
    // Create QR pattern (simplified)
    const moduleSize = 5;
    const modules = 40;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate pseudo-random pattern based on data
    const hash = this.simpleHash(data);
    const pattern = this.generatePattern(hash, modules);
    
    // Draw modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add position markers
    this.drawPositionMarker(ctx, 0, 0, moduleSize);
    this.drawPositionMarker(ctx, (modules - 7) * moduleSize, 0, moduleSize);
    this.drawPositionMarker(ctx, 0, (modules - 7) * moduleSize, moduleSize);
    
    return canvas;
  }
  
  // Simple hash function
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  // Generate QR pattern
  generatePattern(seed, size) {
    const pattern = [];
    let random = seed;
    
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        random = (random * 1103515245 + 12345) & 0x7fffffff;
        pattern[i][j] = (random % 100) < 50;
      }
    }
    
    return pattern;
  }
  
  // Draw position marker
  drawPositionMarker(ctx, x, y, moduleSize) {
    // Outer square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    
    // Inner white square
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    
    // Center black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  }
  
  // Initialize QR scanner
  async initializeScanner(videoElement, onScanSuccess, onScanError) {
    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      videoElement.srcObject = stream;
      this.isScanning = true;
      
      // Start scanning loop
      this.scanLoop(videoElement, onScanSuccess, onScanError);
      
      return {
        success: true,
        stream: stream
      };
      
    } catch (error) {
      console.error('Error initializing scanner:', error);
      
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Permesso camera negato'
        };
      } else if (error.name === 'NotFoundError') {
        return {
          success: false,
          error: 'Camera non trovata'
        };
      } else {
        return {
          success: false,
          error: 'Errore nell\'inizializzazione della camera'
        };
      }
    }
  }
  
  // Scanning loop
  scanLoop(videoElement, onScanSuccess, onScanError) {
    if (!this.isScanning) return;
    
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    if (canvas.width === 0 || canvas.height === 0) {
      // Video not ready yet
      requestAnimationFrame(() => this.scanLoop(videoElement, onScanSuccess, onScanError));
      return;
    }
    
    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Mock QR detection (in real app, would use jsQR or similar)
    const mockDetection = this.mockDetectQR(canvas, ctx);
    
    if (mockDetection) {
      this.handleScanResult(mockDetection, onScanSuccess, onScanError);
    }
    
    // Continue scanning
    requestAnimationFrame(() => this.scanLoop(videoElement, onScanSuccess, onScanError));
  }
  
  // Mock QR detection (for demo)
  mockDetectQR(canvas, ctx) {
    // In real app, would use QR detection library
    // For demo, simulate detection after 3 seconds
    if (!this.scanStartTime) {
      this.scanStartTime = Date.now();
    }
    
    if (Date.now() - this.scanStartTime > 3000) {
      // Reset timer
      this.scanStartTime = null;
      
      // Return mock data
      const mockStudent = Storage.get(STORAGE_KEYS.STUDENTS)?.[0];
      if (mockStudent) {
        const data = {
          type: 'student_attendance',
          studentId: mockStudent.id,
          timestamp: Date.now(),
          expires: Date.now() + (5 * 60 * 1000)
        };
        
        return btoa(JSON.stringify(data));
      }
    }
    
    return null;
  }
  
  // Handle scan result
  handleScanResult(qrData, onScanSuccess, onScanError) {
    try {
      // Decode QR data
      const decoded = JSON.parse(atob(qrData));
      
      // Validate QR data
      if (!decoded.type || decoded.type !== 'student_attendance') {
        throw new Error('QR non valido');
      }
      
      // Check expiry
      if (decoded.expires && decoded.expires < Date.now()) {
        throw new Error('QR scaduto');
      }
      
      // Get student info
      const student = ArrayHelpers.findById(
        Storage.get(STORAGE_KEYS.STUDENTS) || [], 
        decoded.studentId
      );
      
      if (!student) {
        throw new Error('Studente non trovato');
      }
      
      // Success
      this.stopScanning();
      onScanSuccess({
        studentId: decoded.studentId,
        student: student,
        timestamp: decoded.timestamp
      });
      
    } catch (error) {
      console.error('Error processing QR:', error);
      onScanError(error.message || 'Errore nella lettura del QR');
    }
  }
  
  // Stop scanning
  stopScanning() {
    this.isScanning = false;
    this.scanStartTime = null;
  }
  
  // Close scanner
  closeScanner(videoElement) {
    this.stopScanning();
    
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      videoElement.srcObject = null;
    }
  }
  
  // Register attendance with QR
  async registerAttendance(scanResult, courseId) {
    try {
      const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE) || [];
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already registered today for this course
      const existingAttendance = attendance.find(a => 
        a.studentId === scanResult.studentId &&
        a.courseId === courseId &&
        a.date === today
      );
      
      if (existingAttendance) {
        return {
          success: false,
          message: 'Presenza già registrata per oggi'
        };
      }
      
      // Create attendance record
      const newAttendance = {
        id: StringHelpers.generateId('att'),
        studentId: scanResult.studentId,
        courseId: courseId,
        date: today,
        time: DateHelpers.formatDate(new Date(), 'time'),
        present: true,
        checkedInAt: new Date().toISOString(),
        method: 'qr_code'
      };
      
      attendance.push(newAttendance);
      Storage.set(STORAGE_KEYS.ATTENDANCE, attendance);
      
      // Award attendance points
      this.gamificationService.awardAttendancePoints(scanResult.studentId);
      
      // Check for badges
      this.gamificationService.checkBadges(scanResult.studentId);
      
      return {
        success: true,
        attendance: newAttendance,
        student: scanResult.student
      };
      
    } catch (error) {
      console.error('Error registering attendance:', error);
      return {
        success: false,
        message: 'Errore nella registrazione della presenza'
      };
    }
  }
  
  // Generate bulk QR codes for event
  generateEventQRs(eventId) {
    const event = ArrayHelpers.findById(
      Storage.get(STORAGE_KEYS.EVENTS) || [], 
      eventId
    );
    
    if (!event) return null;
    
    const qrCodes = [];
    
    event.registeredParticipants.forEach(studentId => {
      const data = {
        type: 'event_checkin',
        eventId: eventId,
        studentId: studentId,
        timestamp: Date.now()
      };
      
      qrCodes.push({
        studentId: studentId,
        qrData: btoa(JSON.stringify(data)),
        canvas: this.createMockQR(btoa(JSON.stringify(data)))
      });
    });
    
    return qrCodes;
  }
  
  // Generate teacher QR for quick access
  generateTeacherQR(teacherId) {
    const data = {
      type: 'teacher_access',
      teacherId: teacherId,
      timestamp: Date.now()
    };
    
    return this.createMockQR(btoa(JSON.stringify(data)));
  }
  
  // Create QR scanner modal
  createScannerModal(options = {}) {
    const content = `
      <div class="qr-scanner-container">
        <video id="qr-video" class="qr-video" autoplay playsinline></video>
        <div class="qr-scanner-overlay">
          <div class="qr-scanner-frame">
            <div class="qr-scanner-corner tl"></div>
            <div class="qr-scanner-corner tr"></div>
            <div class="qr-scanner-corner bl"></div>
            <div class="qr-scanner-corner br"></div>
            <div class="qr-scan-line"></div>
          </div>
          <p class="qr-scanner-instruction">Inquadra il codice QR</p>
        </div>
      </div>
    `;
    
    const modal = this.modal.create({
      title: options.title || 'Scansiona QR Code',
      content: content,
      size: 'medium',
      customClass: 'qr-scanner-modal',
      onOpen: async (modalEl) => {
        const video = modalEl.querySelector('#qr-video');
        
        const result = await this.initializeScanner(
          video,
          (scanResult) => {
            // Success callback
            if (options.onScan) {
              options.onScan(scanResult);
            }
            this.modal.close();
          },
          (error) => {
            // Error callback
            this.toast.show(error, 'error');
          }
        );
        
        if (!result.success) {
          this.toast.show(result.error, 'error');
          this.modal.close();
        }
      },
      onClose: () => {
        const video = document.getElementById('qr-video');
        if (video) {
          this.closeScanner(video);
        }
      },
      actions: [
        {
          text: 'Chiudi',
          class: 'btn-ghost',
          onClick: () => true
        }
      ]
    });
    
    return modal;
  }
  
  // Export QR as image
  exportQRAsImage(canvas, filename = 'qr-code.png') {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
  
  // Print QR codes
  printQRCodes(qrCodes) {
    const printWindow = window.open('', '_blank');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - Boricua Dance Studio</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .qr-item {
            text-align: center;
            padding: 20px;
            border: 1px solid #ddd;
            break-inside: avoid;
          }
          .qr-item canvas {
            margin: 10px auto;
          }
          .student-name {
            font-weight: bold;
            margin-top: 10px;
          }
          @media print {
            .qr-item {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <h1>QR Codes Presenza - Boricua Dance Studio</h1>
        <div class="qr-grid">
          ${qrCodes.map(qr => {
            const student = ArrayHelpers.findById(
              Storage.get(STORAGE_KEYS.STUDENTS) || [], 
              qr.studentId
            );
            return `
              <div class="qr-item">
                <img src="${qr.canvas.toDataURL()}" width="150" height="150">
                <div class="student-name">${student?.firstName} ${student?.lastName}</div>
              </div>
            `;
          }).join('')}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}

// No global instance