// Modal Component - Boricua Dance Studio

class ModalComponent {
  constructor() {
    this.container = document.getElementById('modal-container');
    this.activeModal = null;
    this.init();
  }
  
  init() {
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });
  }
  
  create(options = {}) {
    const defaults = {
      title: '',
      content: '',
      size: 'medium', // small, medium, large, full
      closable: true,
      backdrop: true,
      keyboard: true,
      animation: true,
      actions: [],
      onOpen: null,
      onClose: null,
      customClass: ''
    };
    
    const config = { ...defaults, ...options };
    
    // Create modal elements
    const modalWrapper = this.createModalElement(config);
    
    // Add to container
    if (this.container) {
      this.container.appendChild(modalWrapper);
      this.container.classList.add('active');
    }
    
    // Store reference
    this.activeModal = {
      element: modalWrapper,
      config: config
    };
    
    // Trigger animation
    if (config.animation) {
      requestAnimationFrame(() => {
        modalWrapper.querySelector('.modal').classList.add('show');
      });
    }
    
    // Setup focus trap
    this.setupFocusTrap(modalWrapper);
    
    // Call onOpen callback
    if (config.onOpen) {
      config.onOpen(modalWrapper);
    }
    
    return modalWrapper;
  }
  
  createModalElement(config) {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    if (config.backdrop) {
      backdrop.addEventListener('click', () => {
        if (config.closable) {
          this.close();
        }
      });
    }
    
    // Modal
    const modal = document.createElement('div');
    modal.className = `modal modal-${config.size} ${config.customClass}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (config.title) {
      modal.setAttribute('aria-labelledby', 'modal-title');
    }
    
    // Header
    if (config.title || config.closable) {
      const header = document.createElement('div');
      header.className = 'modal-header';
      
      if (config.title) {
        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.id = 'modal-title';
        title.textContent = config.title;
        header.appendChild(title);
      }
      
      if (config.closable) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', 'Chiudi');
        closeBtn.innerHTML = '<span class="material-icons">close</span>';
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
      }
      
      modal.appendChild(header);
    }
    
    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    if (typeof config.content === 'string') {
      body.innerHTML = config.content;
    } else if (config.content instanceof Element) {
      body.appendChild(config.content);
    }
    
    modal.appendChild(body);
    
    // Footer with actions
    if (config.actions && config.actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      
      config.actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = `btn ${action.class || 'btn-primary'}`;
        btn.textContent = action.text;
        
        if (action.onClick) {
          btn.addEventListener('click', () => {
            const result = action.onClick(modal);
            if (result !== false) {
              this.close();
            }
          });
        }
        
        footer.appendChild(btn);
      });
      
      modal.appendChild(footer);
    }
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-wrapper';
    wrapper.appendChild(backdrop);
    wrapper.appendChild(modal);
    
    return wrapper;
  }
  
  close() {
    if (!this.activeModal) return;
    
    const { element, config } = this.activeModal;
    
    // Call onClose callback
    if (config.onClose) {
      const result = config.onClose(element);
      if (result === false) return; // Prevent closing
    }
    
    // Remove animation
    const modal = element.querySelector('.modal');
    if (modal && config.animation) {
      modal.classList.remove('show');
      modal.classList.add('closing');
    }
    
    // Remove after animation
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      // Hide container
      if (this.container && this.container.children.length === 0) {
        this.container.classList.remove('active');
      }
      
      this.activeModal = null;
      this.removeFocusTrap();
    }, config.animation ? 300 : 0);
  }
  
  // Convenience methods
  
  alert(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    return this.create({
      title: options.title || 'Attenzione',
      content: `<p>${options.message}</p>`,
      size: 'small',
      actions: [
        {
          text: options.okText || 'OK',
          class: 'btn-primary',
          onClick: options.onOk
        }
      ]
    });
  }
  
  confirm(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    return new Promise((resolve) => {
      this.create({
        title: options.title || 'Conferma',
        content: `<p>${options.message}</p>`,
        size: 'small',
        closable: false,
        actions: [
          {
            text: options.cancelText || 'Annulla',
            class: 'btn-ghost',
            onClick: () => {
              resolve(false);
              return true;
            }
          },
          {
            text: options.confirmText || 'Conferma',
            class: options.confirmClass || 'btn-primary',
            onClick: () => {
              resolve(true);
              return true;
            }
          }
        ]
      });
    });
  }
  
  prompt(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    const inputId = 'modal-prompt-input';
    
    return new Promise((resolve) => {
      const content = `
        <p>${options.message}</p>
        <div class="form-group">
          <input type="${options.type || 'text'}" 
                 id="${inputId}" 
                 class="form-control" 
                 placeholder="${options.placeholder || ''}"
                 value="${options.defaultValue || ''}">
        </div>
      `;
      
      const modal = this.create({
        title: options.title || 'Input',
        content: content,
        size: 'small',
        closable: false,
        onOpen: (modalEl) => {
          // Focus input
          const input = modalEl.querySelector(`#${inputId}`);
          if (input) {
            input.focus();
            input.select();
          }
        },
        actions: [
          {
            text: options.cancelText || 'Annulla',
            class: 'btn-ghost',
            onClick: () => {
              resolve(null);
              return true;
            }
          },
          {
            text: options.okText || 'OK',
            class: 'btn-primary',
            onClick: (modalEl) => {
              const input = modalEl.querySelector(`#${inputId}`);
              const value = input ? input.value : '';
              resolve(value);
              return true;
            }
          }
        ]
      });
      
      // Submit on enter
      const input = modal.querySelector(`#${inputId}`);
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            resolve(input.value);
            this.close();
          }
        });
      }
    });
  }
  
  // Show loading modal
  loading(message = 'Caricamento...') {
    const content = `
      <div class="text-center">
        <div class="spinner mb-3"></div>
        <p>${message}</p>
      </div>
    `;
    
    const modal = this.create({
      content: content,
      size: 'small',
      closable: false,
      backdrop: 'static',
      customClass: 'modal-loading'
    });
    
    return {
      update: (newMessage) => {
        const p = modal.querySelector('p');
        if (p) p.textContent = newMessage;
      },
      close: () => this.close()
    };
  }
  
  // Show form modal
  form(options) {
    const formId = 'modal-form';
    
    return new Promise((resolve, reject) => {
      const content = `
        <form id="${formId}" class="modal-form">
          ${options.fields.map(field => this.createFormField(field)).join('')}
        </form>
      `;
      
      this.create({
        title: options.title,
        content: content,
        size: options.size || 'medium',
        onOpen: (modalEl) => {
          // Initialize form
          const form = modalEl.querySelector(`#${formId}`);
          if (form && options.onInit) {
            options.onInit(form);
          }
          
          // Focus first input
          const firstInput = form?.querySelector('input, select, textarea');
          if (firstInput) {
            firstInput.focus();
          }
        },
        actions: [
          {
            text: options.cancelText || 'Annulla',
            class: 'btn-ghost',
            onClick: () => {
              resolve(null);
              return true;
            }
          },
          {
            text: options.submitText || 'Salva',
            class: 'btn-primary',
            onClick: (modalEl) => {
              const form = modalEl.querySelector(`#${formId}`);
              if (!form) return true;
              
              // Get form data
              const formData = FormHelpers.getFormData(form);
              
              // Validate if rules provided
              if (options.validationRules) {
                const validation = Validators.validateForm(formData, options.validationRules);
                
                if (!validation.isValid) {
                  Validators.displayFormErrors(form, validation.errors);
                  return false; // Keep modal open
                }
              }
              
              // Call submit handler
              if (options.onSubmit) {
                const result = options.onSubmit(formData, form);
                if (result === false) return false;
                
                if (result instanceof Promise) {
                  result.then(() => {
                    resolve(formData);
                    this.close();
                  }).catch((error) => {
                    reject(error);
                  });
                  return false;
                }
              }
              
              resolve(formData);
              return true;
            }
          }
        ]
      });
    });
  }
  
  createFormField(field) {
    const fieldHtml = {
      text: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <input type="text" 
                 id="${field.name}" 
                 name="${field.name}" 
                 class="form-control"
                 placeholder="${field.placeholder || ''}"
                 value="${field.value || ''}"
                 ${field.required ? 'required' : ''}>
          <div class="form-error"></div>
        </div>
      `,
      
      email: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <input type="email" 
                 id="${field.name}" 
                 name="${field.name}" 
                 class="form-control"
                 placeholder="${field.placeholder || ''}"
                 value="${field.value || ''}"
                 ${field.required ? 'required' : ''}>
          <div class="form-error"></div>
        </div>
      `,
      
      password: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <input type="password" 
                 id="${field.name}" 
                 name="${field.name}" 
                 class="form-control"
                 placeholder="${field.placeholder || ''}"
                 ${field.required ? 'required' : ''}>
          <div class="form-error"></div>
        </div>
      `,
      
      number: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <input type="number" 
                 id="${field.name}" 
                 name="${field.name}" 
                 class="form-control"
                 placeholder="${field.placeholder || ''}"
                 value="${field.value || ''}"
                 min="${field.min || ''}"
                 max="${field.max || ''}"
                 step="${field.step || ''}"
                 ${field.required ? 'required' : ''}>
          <div class="form-error"></div>
        </div>
      `,
      
      date: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <input type="date" 
                 id="${field.name}" 
                 name="${field.name}" 
                 class="form-control"
                 value="${field.value || ''}"
                 min="${field.min || ''}"
                 max="${field.max || ''}"
                 ${field.required ? 'required' : ''}>
          <div class="form-error"></div>
        </div>
      `,
      
      time: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <input type="time" 
                 id="${field.name}" 
                 name="${field.name}" 
                 class="form-control"
                 value="${field.value || ''}"
                 ${field.required ? 'required' : ''}>
          <div class="form-error"></div>
        </div>
      `,
      
      select: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <div class="select-wrapper">
            <select id="${field.name}" 
                    name="${field.name}" 
                    class="form-control"
                    ${field.required ? 'required' : ''}>
              ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
              ${field.options.map(opt => `
                <option value="${opt.value}" ${field.value === opt.value ? 'selected' : ''}>
                  ${opt.label}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-error"></div>
        </div>
      `,
      
      textarea: `
        <div class="form-group">
          <label for="${field.name}">${field.label}</label>
          <textarea id="${field.name}" 
                    name="${field.name}" 
                    class="form-control"
                    rows="${field.rows || 3}"
                    placeholder="${field.placeholder || ''}"
                    ${field.required ? 'required' : ''}>${field.value || ''}</textarea>
          <div class="form-error"></div>
        </div>
      `,
      
      checkbox: `
        <div class="form-group">
          <label class="checkbox">
            <input type="checkbox" 
                   id="${field.name}" 
                   name="${field.name}"
                   value="${field.value || 'true'}"
                   ${field.checked ? 'checked' : ''}>
            <span>${field.label}</span>
          </label>
        </div>
      `,
      
      radio: `
        <div class="form-group">
          <label>${field.label}</label>
          ${field.options.map((opt, index) => `
            <label class="radio">
              <input type="radio" 
                     name="${field.name}"
                     value="${opt.value}"
                     ${field.value === opt.value || (index === 0 && !field.value) ? 'checked' : ''}>
              <span>${opt.label}</span>
            </label>
          `).join('')}
        </div>
      `
    };
    
    return fieldHtml[field.type] || fieldHtml.text;
  }
  
  // Setup focus trap
  setupFocusTrap(modalEl) {
    const focusableElements = modalEl.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.trapFocusHandler = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', this.trapFocusHandler);
    
    // Focus first focusable element
    setTimeout(() => {
      firstElement.focus();
    }, 100);
  }
  
  removeFocusTrap() {
    if (this.trapFocusHandler) {
      document.removeEventListener('keydown', this.trapFocusHandler);
      this.trapFocusHandler = null;
    }
  }
  
  // Check if modal is open
  isOpen() {
    return this.activeModal !== null;
  }
}

// Create global instance
window.Modal = new ModalComponent();