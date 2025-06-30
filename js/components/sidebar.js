// Sidebar Component - Boricua Dance Studio

class SidebarComponent {
  constructor(app) {
    this.app = app;
    this.sidebar = document.getElementById('sidebar');
    this.overlay = document.getElementById('sidebar-overlay');
    this.nav = document.getElementById('sidebar-nav');
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    // Setup event listeners
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Handle swipe gestures on mobile
    this.setupSwipeGestures();
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    if (!this.sidebar) return;
    
    this.sidebar.classList.add('active');
    this.overlay?.classList.add('active');
    this.isOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    this.setupFocusTrap();
  }
  
  close() {
    if (!this.sidebar) return;
    
    this.sidebar.classList.remove('active');
    this.overlay?.classList.remove('active');
    this.isOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove focus trap
    this.removeFocusTrap();
  }
  
  loadMenu(userRole) {
    if (!this.nav) return;
    
    const menuItems = MENU_ITEMS[userRole] || [];
    this.nav.innerHTML = '';
    
    menuItems.forEach(item => {
      if (item.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'nav-separator';
        this.nav.appendChild(separator);
      } else {
        const navItem = this.createNavItem(item);
        this.nav.appendChild(navItem);
      }
    });
    
    // Add event listeners to nav items
    this.nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('href');
        if (route && this.app?.router) {
          this.app.router.navigate(route);
          // Close sidebar on mobile
          if (window.innerWidth < 768) {
            this.close();
          }
        }
      });
    });
  }
  
  createNavItem(item) {
    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = item.route;
    
    // Check if active
    if (this.app?.router?.currentRoute === item.route) {
      a.classList.add('active');
    }
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = item.icon;
    
    // Label
    const label = document.createElement('span');
    label.textContent = item.label;
    
    a.appendChild(icon);
    a.appendChild(label);
    
    return a;
  }
  
  setupSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Detect swipe from left edge to open
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
    
    const handleSwipe = () => {
      // Swipe right from left edge
      if (touchStartX < 50 && touchEndX > touchStartX + 50) {
        this.open();
      }
      
      // Swipe left on sidebar
      if (this.isOpen && touchEndX < touchStartX - 50) {
        this.close();
      }
    };
    
    this.handleSwipe = handleSwipe;
  }
  
  setupFocusTrap() {
    const focusableElements = this.sidebar.querySelectorAll(
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
    
    // Focus first element
    firstElement.focus();
  }
  
  removeFocusTrap() {
    if (this.trapFocusHandler) {
      document.removeEventListener('keydown', this.trapFocusHandler);
      this.trapFocusHandler = null;
    }
  }
  
  updateActiveItem(route) {
    // Remove all active classes
    this.nav?.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current route
    const activeItem = this.nav?.querySelector(`.nav-item[href="${route}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
  
  // Show notification badge on menu item
  showBadge(route, count) {
    const navItem = this.nav?.querySelector(`.nav-item[href="${route}"]`);
    if (!navItem) return;
    
    // Remove existing badge
    const existingBadge = navItem.querySelector('.nav-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'nav-badge';
      badge.textContent = count > 99 ? '99+' : count;
      navItem.appendChild(badge);
    }
  }
  
  // Collapse/expand for desktop mode
  toggleCollapse() {
    this.sidebar?.classList.toggle('collapsed');
    
    // Save preference
    const isCollapsed = this.sidebar?.classList.contains('collapsed');
    const settings = Storage.get(STORAGE_KEYS.SETTINGS) || {};
    settings.sidebarCollapsed = isCollapsed;
    Storage.set(STORAGE_KEYS.SETTINGS, settings);
  }
  
  // Initialize collapsed state from settings
  initializeCollapsedState() {
    const settings = Storage.get(STORAGE_KEYS.SETTINGS) || {};
    if (settings.sidebarCollapsed && window.innerWidth >= 768) {
      this.sidebar?.classList.add('collapsed');
    }
  }
}

// No global instance