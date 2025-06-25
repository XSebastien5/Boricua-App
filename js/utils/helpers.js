// Helper Functions - Boricua Dance Studio

// Date and Time Helpers
const DateHelpers = {
  // Format date to Italian format
  formatDate(date, format = 'short') {
    if (!date) return '';
    
    const d = new Date(date);
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString('it-IT');
      
      case 'long':
        return d.toLocaleDateString('it-IT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      case 'time':
        return d.toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'datetime':
        return `${this.formatDate(d, 'short')} ${this.formatDate(d, 'time')}`;
      
      case 'relative':
        return this.getRelativeTime(d);
      
      default:
        return d.toLocaleDateString('it-IT');
    }
  },
  
  // Get relative time (e.g., "2 ore fa", "domani")
  getRelativeTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = d - now;
    const absDiff = Math.abs(diff);
    
    // Past or future
    const isPast = diff < 0;
    
    // Less than a minute
    if (absDiff < 60 * 1000) {
      return isPast ? 'proprio ora' : 'tra poco';
    }
    
    // Less than an hour
    if (absDiff < 60 * 60 * 1000) {
      const minutes = Math.floor(absDiff / (60 * 1000));
      return isPast 
        ? `${minutes} minut${minutes === 1 ? 'o' : 'i'} fa`
        : `tra ${minutes} minut${minutes === 1 ? 'o' : 'i'}`;
    }
    
    // Less than a day
    if (absDiff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(absDiff / (60 * 60 * 1000));
      return isPast
        ? `${hours} or${hours === 1 ? 'a' : 'e'} fa`
        : `tra ${hours} or${hours === 1 ? 'a' : 'e'}`;
    }
    
    // Less than a week
    if (absDiff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
      if (days === 1) {
        return isPast ? 'ieri' : 'domani';
      }
      return isPast
        ? `${days} giorni fa`
        : `tra ${days} giorni`;
    }
    
    // Default to formatted date
    return this.formatDate(d, 'short');
  },
  
  // Get week number
  getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },
  
  // Get days in month
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },
  
  // Add days to date
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  // Check if date is today
  isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  },
  
  // Check if date is in the past
  isPast(date) {
    return new Date(date) < new Date();
  },
  
  // Get Italian day name
  getDayName(date) {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return days[new Date(date).getDay()];
  },
  
  // Get Italian month name
  getMonthName(date) {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[new Date(date).getMonth()];
  }
};

// String Helpers
const StringHelpers = {
  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  // Title case
  titleCase(str) {
    if (!str) return '';
    return str.split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  },
  
  // Truncate string
  truncate(str, length = 50, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },
  
  // Generate random ID
  generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  },
  
  // Format fiscal code
  formatFiscalCode(code) {
    if (!code) return '';
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  },
  
  // Format phone number
  formatPhone(phone) {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as Italian phone number
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  },
  
  // Get initials
  getInitials(name) {
    if (!name) return '';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },
  
  // Slugify
  slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

// Number Helpers
const NumberHelpers = {
  // Format currency
  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Format percentage
  formatPercentage(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  },
  
  // Format number with separators
  formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num);
  },
  
  // Round to decimals
  round(num, decimals = 2) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
  
  // Calculate percentage
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return (value / total) * 100;
  },
  
  // Get random number between min and max
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// Array Helpers
const ArrayHelpers = {
  // Group by key
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  },
  
  // Sort by key
  sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  // Get unique values
  unique(array, key) {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  },
  
  // Chunk array
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  // Find by ID
  findById(array, id) {
    return array.find(item => item.id === id);
  },
  
  // Remove by ID
  removeById(array, id) {
    return array.filter(item => item.id !== id);
  },
  
  // Update by ID
  updateById(array, id, updates) {
    return array.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
  }
};

// DOM Helpers
const DOMHelpers = {
  // Create element with attributes
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on')) {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  // Add event listener with delegation
  delegate(element, eventType, selector, handler) {
    element.addEventListener(eventType, function(event) {
      const targetElement = event.target.closest(selector);
      if (targetElement && element.contains(targetElement)) {
        handler.call(targetElement, event);
      }
    });
  },
  
  // Animate element
  animate(element, keyframes, options = {}) {
    const defaults = {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards'
    };
    
    return element.animate(keyframes, { ...defaults, ...options });
  },
  
  // Scroll to element
  scrollTo(element, options = {}) {
    const defaults = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };
    
    element.scrollIntoView({ ...defaults, ...options });
  }
};

// Form Helpers
const FormHelpers = {
  // Get form data as object
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (e.g., checkboxes)
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }
    
    return data;
  },
  
  // Set form values
  setFormData(form, data) {
    Object.entries(data).forEach(([key, value]) => {
      const input = form.elements[key];
      
      if (input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = value === true || value === input.value;
        } else {
          input.value = value;
        }
      }
    });
  },
  
  // Reset form with animation
  resetForm(form) {
    form.reset();
    
    // Clear any error messages
    form.querySelectorAll('.form-error').forEach(error => {
      error.textContent = '';
    });
    
    // Remove error classes
    form.querySelectorAll('.error').forEach(element => {
      element.classList.remove('error');
    });
  },
  
  // Validate single field
  validateField(field, rules) {
    const value = field.value.trim();
    const errors = [];
    
    if (rules.required && !value) {
      errors.push('Questo campo è obbligatorio');
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimo ${rules.minLength} caratteri`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Massimo ${rules.maxLength} caratteri`);
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.message || 'Formato non valido');
    }
    
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) errors.push(customError);
    }
    
    return errors;
  }
};

// Export helpers
window.DateHelpers = DateHelpers;
window.StringHelpers = StringHelpers;
window.NumberHelpers = NumberHelpers;
window.ArrayHelpers = ArrayHelpers;
window.DOMHelpers = DOMHelpers;
window.FormHelpers = FormHelpers;