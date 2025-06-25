// Validators - Boricua Dance Studio

class Validators {
  // Email validation
  static isValidEmail(email) {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }
  
  // Phone validation
  static isValidPhone(phone) {
    return VALIDATION_PATTERNS.PHONE.test(phone);
  }
  
  // Fiscal code validation (Italian)
  static isValidFiscalCode(code) {
    if (!code || code.length !== 16) return false;
    return VALIDATION_PATTERNS.FISCAL_CODE.test(code);
  }
  
  // Postal code validation (Italian)
  static isValidPostalCode(code) {
    return VALIDATION_PATTERNS.POSTAL_CODE.test(code);
  }
  
  // Password validation
  static isValidPassword(password) {
    return VALIDATION_PATTERNS.PASSWORD.test(password);
  }
  
  // Date validation
  static isValidDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  }
  
  // Age validation
  static isValidAge(birthDate, minAge = 0, maxAge = 120) {
    if (!this.isValidDate(birthDate)) return false;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= minAge && age <= maxAge;
  }
  
  // Required field validation
  static isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }
  
  // Min length validation
  static hasMinLength(value, minLength) {
    if (!value) return false;
    return value.length >= minLength;
  }
  
  // Max length validation
  static hasMaxLength(value, maxLength) {
    if (!value) return true;
    return value.length <= maxLength;
  }
  
  // Number range validation
  static isInRange(value, min, max) {
    const num = Number(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  }
  
  // URL validation
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // IBAN validation (simplified)
  static isValidIBAN(iban) {
    if (!iban) return false;
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    
    // Italian IBAN format: IT + 2 check digits + 1 letter + 10 digits + 12 alphanumeric
    if (cleaned.length !== 27) return false;
    if (!cleaned.startsWith('IT')) return false;
    
    return /^IT\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/.test(cleaned);
  }
  
  // Credit card validation (Luhn algorithm)
  static isValidCreditCard(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  // Time validation (HH:MM format)
  static isValidTime(time) {
    const pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return pattern.test(time);
  }
  
  // File validation
  static isValidFile(file, options = {}) {
    const { maxSize, allowedTypes } = options;
    
    if (maxSize && file.size > maxSize) {
      return { valid: false, error: `File troppo grande. Massimo ${maxSize / 1024 / 1024}MB` };
    }
    
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo di file non permesso' };
    }
    
    return { valid: true };
  }
  
  // Form validation
  static validateForm(formData, rules) {
    const errors = {};
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = formData[field];
      const fieldErrors = [];
      
      // Required
      if (fieldRules.required && !this.isRequired(value)) {
        fieldErrors.push(fieldRules.requiredMessage || 'Campo obbligatorio');
      }
      
      // Email
      if (fieldRules.email && value && !this.isValidEmail(value)) {
        fieldErrors.push(fieldRules.emailMessage || 'Email non valida');
      }
      
      // Phone
      if (fieldRules.phone && value && !this.isValidPhone(value)) {
        fieldErrors.push(fieldRules.phoneMessage || 'Numero di telefono non valido');
      }
      
      // Fiscal code
      if (fieldRules.fiscalCode && value && !this.isValidFiscalCode(value)) {
        fieldErrors.push(fieldRules.fiscalCodeMessage || 'Codice fiscale non valido');
      }
      
      // Min length
      if (fieldRules.minLength && value && !this.hasMinLength(value, fieldRules.minLength)) {
        fieldErrors.push(fieldRules.minLengthMessage || `Minimo ${fieldRules.minLength} caratteri`);
      }
      
      // Max length
      if (fieldRules.maxLength && value && !this.hasMaxLength(value, fieldRules.maxLength)) {
        fieldErrors.push(fieldRules.maxLengthMessage || `Massimo ${fieldRules.maxLength} caratteri`);
      }
      
      // Pattern
      if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
        fieldErrors.push(fieldRules.patternMessage || 'Formato non valido');
      }
      
      // Custom validator
      if (fieldRules.custom && value) {
        const customError = fieldRules.custom(value, formData);
        if (customError) fieldErrors.push(customError);
      }
      
      // Matching fields (e.g., password confirmation)
      if (fieldRules.matches && value !== formData[fieldRules.matches]) {
        fieldErrors.push(fieldRules.matchesMessage || 'I campi non corrispondono');
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Display form errors
  static displayFormErrors(form, errors) {
    // Clear existing errors
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    
    form.querySelectorAll('.error').forEach(el => {
      el.classList.remove('error');
    });
    
    // Display new errors
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      const input = form.elements[field];
      if (input) {
        input.classList.add('error');
        
        // Find or create error element
        let errorEl = input.parentElement.querySelector('.form-error');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'form-error';
          input.parentElement.appendChild(errorEl);
        }
        
        errorEl.textContent = fieldErrors[0]; // Show first error
        errorEl.style.display = 'block';
      }
    });
  }
  
  // Student registration validation rules
  static getStudentValidationRules() {
    return {
      firstName: {
        required: true,
        requiredMessage: 'Nome obbligatorio',
        minLength: 2,
        minLengthMessage: 'Nome troppo corto'
      },
      lastName: {
        required: true,
        requiredMessage: 'Cognome obbligatorio',
        minLength: 2,
        minLengthMessage: 'Cognome troppo corto'
      },
      email: {
        required: true,
        requiredMessage: 'Email obbligatoria',
        email: true
      },
      phone: {
        required: true,
        requiredMessage: 'Telefono obbligatorio',
        phone: true
      },
      birthDate: {
        required: true,
        requiredMessage: 'Data di nascita obbligatoria',
        custom: (value) => {
          if (!this.isValidAge(value, 5, 100)) {
            return 'Età non valida (minimo 5 anni)';
          }
          return null;
        }
      },
      fiscalCode: {
        required: true,
        requiredMessage: 'Codice fiscale obbligatorio',
        fiscalCode: true
      },
      address: {
        required: true,
        requiredMessage: 'Indirizzo obbligatorio'
      },
      city: {
        required: true,
        requiredMessage: 'Città obbligatoria'
      },
      postalCode: {
        required: true,
        requiredMessage: 'CAP obbligatorio',
        pattern: VALIDATION_PATTERNS.POSTAL_CODE,
        patternMessage: 'CAP non valido (5 cifre)'
      },
      password: {
        required: true,
        requiredMessage: 'Password obbligatoria',
        minLength: 6,
        minLengthMessage: 'Password minimo 6 caratteri'
      },
      confirmPassword: {
        required: true,
        requiredMessage: 'Conferma password obbligatoria',
        matches: 'password',
        matchesMessage: 'Le password non corrispondono'
      }
    };
  }
  
  // Course validation rules
  static getCourseValidationRules() {
    return {
      name: {
        required: true,
        requiredMessage: 'Nome corso obbligatorio',
        minLength: 3,
        minLengthMessage: 'Nome troppo corto'
      },
      description: {
        required: true,
        requiredMessage: 'Descrizione obbligatoria',
        minLength: 10,
        minLengthMessage: 'Descrizione troppo corta'
      },
      teacherId: {
        required: true,
        requiredMessage: 'Seleziona un maestro'
      },
      startDate: {
        required: true,
        requiredMessage: 'Data inizio obbligatoria',
        custom: (value) => {
          if (new Date(value) < new Date()) {
            return 'La data di inizio non può essere nel passato';
          }
          return null;
        }
      },
      endDate: {
        required: true,
        requiredMessage: 'Data fine obbligatoria',
        custom: (value, formData) => {
          if (new Date(value) <= new Date(formData.startDate)) {
            return 'La data di fine deve essere dopo la data di inizio';
          }
          return null;
        }
      },
      maxStudents: {
        required: true,
        requiredMessage: 'Numero massimo studenti obbligatorio',
        custom: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 50) {
            return 'Numero studenti deve essere tra 1 e 50';
          }
          return null;
        }
      },
      price: {
        required: true,
        requiredMessage: 'Prezzo obbligatorio',
        custom: (value) => {
          const num = parseFloat(value);
          if (isNaN(num) || num < 0) {
            return 'Prezzo non valido';
          }
          return null;
        }
      }
    };
  }
  
  // Booking validation rules
  static getBookingValidationRules() {
    return {
      date: {
        required: true,
        requiredMessage: 'Data obbligatoria',
        custom: (value) => {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            return 'Non puoi prenotare nel passato';
          }
          
          // Max 3 months in advance
          const maxDate = new Date();
          maxDate.setMonth(maxDate.getMonth() + 3);
          
          if (selectedDate > maxDate) {
            return 'Puoi prenotare massimo 3 mesi in anticipo';
          }
          
          return null;
        }
      },
      time: {
        required: true,
        requiredMessage: 'Orario obbligatorio',
        custom: (value) => {
          if (!this.isValidTime(value)) {
            return 'Orario non valido';
          }
          
          const [hours] = value.split(':').map(Number);
          if (hours < 8 || hours > 22) {
            return 'Orario deve essere tra 08:00 e 22:00';
          }
          
          return null;
        }
      },
      teacherId: {
        required: true,
        requiredMessage: 'Seleziona un maestro'
      },
      duration: {
        required: true,
        requiredMessage: 'Seleziona la durata',
        custom: (value) => {
          const validDurations = [30, 60, 90, 120];
          if (!validDurations.includes(parseInt(value))) {
            return 'Durata non valida';
          }
          return null;
        }
      }
    };
  }
}

// Export validators
window.Validators = Validators;