// Toast Component - Boricua Dance Studio

class ToastComponent {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = [];
    this.toastIdCounter = 0;
  }
  
  show(message, type = 'info', duration = 3000) {
    const toast = this.create(message, type, duration);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
    
    return toast;
  }
  
  create(message, type, duration) {
    const id = `toast_${this.toastIdCounter++}`;
    
    const toastElement = document.createElement('div');
    toastElement.id = id;
    toastElement.className = `toast ${type} slide-in-right`;
    
    const icon = this.getIcon(type);
    
    toastElement.innerHTML = `
      <span class="material-icons toast-icon">${icon}</span>
      <div class="toast-content">
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close" onclick="Toast.remove('${id}')">
        <span class="material-icons">close</span>
      </button>
    `;
    
    if (this.container) {
      this.container.appendChild(toastElement);
    }
    
    const toast = {
      id,
      element: toastElement,
      type,
      message,
      duration
    };
    
    this.toasts.push(toast);
    
    return toast;
  }
  
  getIcon(type) {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    
    return icons[type] || 'info';
  }
  
  remove(toastId) {
    const index = this.toasts.findIndex(t => t.id === toastId);
    
    if (index !== -1) {
      const toast = this.toasts[index];
      
      // Add fade out animation
      toast.element.classList.add('fade-out');
      
      // Remove after animation
      setTimeout(() => {
        if (toast.element.parentNode) {
          toast.element.parentNode.removeChild(toast.element);
        }
        this.toasts.splice(index, 1);
      }, 300);
    }
  }
  
  // Convenience methods
  
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }
  
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }
  
  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }
  
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
  
  // Loading toast (no auto-remove)
  loading(message) {
    const toast = this.create(message, 'info', 0);
    
    // Add loading spinner
    const iconElement = toast.element.querySelector('.toast-icon');
    if (iconElement) {
      iconElement.innerHTML = '<div class="spinner-small"></div>';
    }
    
    // Return object with update and close methods
    return {
      update: (newMessage) => {
        const messageElement = toast.element.querySelector('.toast-message');
        if (messageElement) {
          messageElement.textContent = newMessage;
        }
      },
      close: () => {
        this.remove(toast.id);
      }
    };
  }
  
  // Clear all toasts
  clear() {
    this.toasts.forEach(toast => {
      this.remove(toast.id);
    });
  }
  
  // Promise-based toast
  promise(promise, messages) {
    const loading = this.loading(messages.loading || 'Caricamento...');
    
    return promise
      .then(result => {
        loading.close();
        this.success(messages.success || 'Operazione completata');
        return result;
      })
      .catch(error => {
        loading.close();
        this.error(messages.error || 'Errore durante l\'operazione');
        throw error;
      });
  }
}

// CSS for spinner-small (add to special-components.css or create inline)
const style = document.createElement('style');
style.textContent = `
  /* Toast animations */
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
  
  /* Spinner for loading toast */
  .spinner-small {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  /* Toast specific styles */
  .toast {
    animation: slideInRight 0.3s ease-out;
  }
  
  .toast.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
  
  .toast-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 4px;
    margin-left: var(--spacing-sm);
    opacity: 0.7;
    transition: opacity var(--transition-fast);
  }
  
  .toast-close:hover {
    opacity: 1;
  }
  
  /* Toast type variations */
  .toast.success {
    background-color: var(--bg-card);
    border-left: 4px solid var(--status-active);
  }
  
  .toast.error {
    background-color: var(--bg-card);
    border-left: 4px solid var(--text-danger);
  }
  
  .toast.warning {
    background-color: var(--bg-card);
    border-left: 4px solid var(--status-pending);
  }
  
  .toast.info {
    background-color: var(--bg-card);
    border-left: 4px solid var(--color-primary);
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .toast-container {
      top: var(--spacing-md);
      right: var(--spacing-md);
      left: var(--spacing-md);
    }
    
    .toast {
      min-width: auto;
      width: 100%;
    }
  }
`;
document.head.appendChild(style);

// Create global instance
window.Toast = new ToastComponent();