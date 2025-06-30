class LoginPage {
  constructor() {
    this.services = null;
  }

  init(services) {
    this.services = services;
    this.addEventListeners();
  }

  render() {
    return `
      <div class="login-page">
        <div class="login-container">
          <div class="login-card card">
            <div class="login-header">
              <img src="assets/logo.png" alt="Boricua Dance Studio" class="login-logo">
              <h1 class="login-title">Boricua Dance Studio</h1>
              <p class="login-subtitle">Accedi al tuo account</p>
            </div>
            
            <form id="login-form" class="login-form">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" class="form-control" 
                       placeholder="nome@esempio.com" required>
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" class="form-control" 
                       placeholder="••••••••" required>
              </div>
              
              <div class="form-group">
                <label class="checkbox">
                  <input type="checkbox" id="remember-me">
                  <span>Ricordami</span>
                </label>
              </div>
              
              <button type="submit" class="btn btn-primary btn-block">
                Accedi
              </button>
              
              <div class="login-links">
                <a href="#" data-action="forgot-password">Password dimenticata?</a>
                <a href="#" data-action="register">Registrati</a>
              </div>
            </form>
            
            <div class="demo-users">
              <p class="text-center text-secondary mb-2">Utenti Demo:</p>
              <div class="demo-buttons">
                <button class="btn btn-outline btn-sm" data-action="demo-login" data-role="admin">
                  Admin
                </button>
                <button class="btn btn-outline btn-sm" data-action="demo-login" data-role="teacher">
                  Maestro
                </button>
                <button class="btn btn-outline btn-sm" data-action="demo-login" data-role="student">
                  Allievo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    const pageContent = document.getElementById('page-content');
    pageContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;

      const actionName = action.dataset.action;
      const actionRole = action.dataset.role;

      switch (actionName) {
        case 'forgot-password':
          this.services.router.navigate(ROUTES.FORGOT_PASSWORD);
          break;
        case 'register':
          this.services.router.navigate(ROUTES.REGISTER);
          break;
        case 'demo-login':
          this.loginAsDemo(actionRole);
          break;
      }
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleLogin();
      });
    }
  }

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await this.services.auth.login(email, password);
    
    if (result.success) {
      this.services.toast.show('Login effettuato con successo!', 'success');
      window.app.currentUser = result.user;
      window.app.updateUIForUser();
      window.app.routeByRole();
    } else {
      this.services.toast.show(result.message || 'Credenziali non valide', 'error');
    }
  }

  loginAsDemo(role) {
    this.services.auth.loginAsDemo(role);
  }
}