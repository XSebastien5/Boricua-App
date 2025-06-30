// Admin Payments Page - Boricua Dance Studio

class AdminPaymentsPage {
  constructor() {
    this.services = null;
    this.payments = [];
    this.students = [];
  }

  init(services) {
    this.services = services;
    this.addEventListeners();
  }

  addEventListeners() {
    const pageContent = document.getElementById('page-content');
    pageContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;

      const actionName = action.dataset.action;
      const actionId = action.dataset.id;

      switch (actionName) {
        case 'add-payment':
          this.addPayment();
          break;
        case 'edit-payment':
          this.editPayment(actionId);
          break;
        case 'delete-payment':
          this.deletePayment(actionId);
          break;
        case 'view-receipt':
          this.viewReceipt(actionId);
          break;
      }
    });
  }

  async render() {
    this.payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    this.students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    const stats = this.calculateStats();

    return `
      <div class="payments-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Pagamenti</h1>
            <p class="page-subtitle">Registra e monitora le transazioni finanziarie</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" data-action="add-payment">
              <span class="material-icons">add_card</span>
              Aggiungi Pagamento
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="payment-stats">
          <div class="stat-card">
            <div class="stat-icon primary"><span class="material-icons">euro_symbol</span></div>
            <div class="stat-content">
              <div class="stat-label">Incasso Totale (Mese)</div>
              <div class="stat-value">€ ${stats.monthlyTotal.toFixed(2)}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success"><span class="material-icons">receipt_long</span></div>
            <div class="stat-content">
              <div class="stat-label">Transazioni (Mese)</div>
              <div class="stat-value">${stats.monthlyCount}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning"><span class="material-icons">pending</span></div>
            <div class="stat-content">
              <div class="stat-label">Pagamenti in Sospeso</div>
              <div class="stat-value">${stats.pending}</div>
            </div>
          </div>
        </div>

        <!-- Payments Table -->
        <div class="table-container mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Allievo</th>
                <th>Importo</th>
                <th>Descrizione</th>
                <th>Data</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody id="payments-table-body">
              ${this.renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTableBody() {
    if (this.payments.length === 0) {
      return `<tr><td colspan="6" class="text-center text-secondary">Nessun pagamento registrato.</td></tr>`;
    }
    // Sort by date descending
    const sortedPayments = [...this.payments].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedPayments.map(payment => this.renderPaymentRow(payment)).join('');
  }

  renderPaymentRow(payment) {
    const student = this.students.find(s => s.id === payment.studentId);
    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar">${student ? StringHelpers.getInitials(student.firstName + ' ' + student.lastName) : '?'}</div>
            <div>
              <div class="font-medium">${student ? `${student.firstName} ${student.lastName}` : 'Allievo non trovato'}</div>
              <div class="text-sm text-secondary">ID: ${payment.studentId}</div>
            </div>
          </div>
        </td>
        <td class="font-medium">€ ${payment.amount.toFixed(2)}</td>
        <td>${payment.description}</td>
        <td>${DateHelpers.formatDate(payment.date)}</td>
        <td>
          <span class="status-indicator status-${payment.status}">
            ${this.getStatusLabel(payment.status)}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn" data-action="view-receipt" data-id="${payment.id}" title="Vedi Ricevuta">
              <span class="material-icons">receipt</span>
            </button>
            <button class="icon-btn" data-action="edit-payment" data-id="${payment.id}" title="Modifica">
              <span class="material-icons">edit</span>
            </button>
            <button class="icon-btn text-danger" data-action="delete-payment" data-id="${payment.id}" title="Elimina">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Actions
  addPayment() {
    this.showPaymentForm();
  }

  editPayment(paymentId) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (payment) {
      this.showPaymentForm(payment);
    }
  }

  async deletePayment(paymentId) {
    const confirmed = await this.services.modal.confirm({
      title: 'Elimina Pagamento',
      message: 'Sei sicuro di voler eliminare questa transazione? Questa azione è irreversibile.',
      confirmText: 'Elimina',
      confirmClass: 'btn-danger'
    });

    if (confirmed) {
      this.payments = this.payments.filter(p => p.id !== paymentId);
      Storage.set(STORAGE_KEYS.PAYMENTS, this.payments);
      this.services.toast.show('Pagamento eliminato con successo.', 'success');
      this.refreshPage();
    }
  }

  viewReceipt(paymentId) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return;
    const student = this.students.find(s => s.id === payment.studentId);

    const content = `
      <div class="receipt-modal">
        <h3>Ricevuta #${payment.id}</h3>
        <p><strong>Data:</strong> ${DateHelpers.formatDateTime(payment.date)}</p>
        <p><strong>Allievo:</strong> ${student ? `${student.firstName} ${student.lastName}` : 'N/D'}</p>
        <hr>
        <table class="receipt-table">
          <tr>
            <td>${payment.description}</td>
            <td class="text-right">€ ${payment.amount.toFixed(2)}</td>
          </tr>
        </table>
        <hr>
        <div class="receipt-total">
          <strong>TOTALE</strong>
          <strong>€ ${payment.amount.toFixed(2)}</strong>
        </div>
        <p class="text-center text-secondary mt-2">Grazie per il tuo pagamento!</p>
      </div>
    `;

    this.services.modal.create({
      title: 'Dettaglio Ricevuta',
      content: content,
      actions: [
        { text: 'Stampa', class: 'btn-outline', onClick: () => this.services.toast.show('Funzione di stampa non disponibile.', 'info') },
        { text: 'Chiudi', class: 'btn-primary', onClick: () => true }
      ]
    });
  }

  showPaymentForm(payment = null) {
    const studentOptions = this.students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }));

    this.services.modal.form({
      title: payment ? 'Modifica Pagamento' : 'Aggiungi Pagamento',
      size: 'large',
      fields: [
        { name: 'studentId', label: 'Allievo', type: 'select', options: studentOptions, value: payment?.studentId || '', required: true },
        { name: 'amount', label: 'Importo (€)', type: 'number', step: '0.01', value: payment?.amount || '', required: true },
        { name: 'description', label: 'Descrizione', value: payment?.description || '', required: true, placeholder: 'Es. Abbonamento Mensile Open' },
        { name: 'date', label: 'Data Pagamento', type: 'date', value: payment ? payment.date.split('T')[0] : new Date().toISOString().split('T')[0], required: true },
        { name: 'status', label: 'Stato', type: 'select', options: Object.values(PAYMENT_STATUS).map(s => ({ value: s, label: this.getStatusLabel(s) })), value: payment?.status || PAYMENT_STATUS.COMPLETED, required: true }
      ],
      onSubmit: (formData) => {
        // Convert amount to number and date to ISO string
        formData.amount = parseFloat(formData.amount);
        formData.date = new Date(formData.date).toISOString();

        if (payment) {
          // Update
          const index = this.payments.findIndex(p => p.id === payment.id);
          this.payments[index] = { ...this.payments[index], ...formData };
          this.services.toast.show('Pagamento aggiornato con successo.', 'success');
        } else {
          // Create
          const newPayment = {
            id: StringHelpers.generateId('pay'),
            ...formData
          };
          this.payments.push(newPayment);
          this.services.toast.show('Pagamento aggiunto con successo.', 'success');
        }
        Storage.set(STORAGE_KEYS.PAYMENTS, this.payments);
        this.refreshPage();
      }
    });
  }

  async refreshPage() {
    // Re-render the main content
    document.getElementById('page-content').innerHTML = await this.render();
  }

  // Helpers
  calculateStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyPayments = this.payments.filter(p => new Date(p.date) >= firstDayOfMonth && p.status === PAYMENT_STATUS.COMPLETED);
    
    return {
      monthlyTotal: monthlyPayments.reduce((sum, p) => sum + p.amount, 0),
      monthlyCount: monthlyPayments.length,
      pending: this.payments.filter(p => p.status === PAYMENT_STATUS.PENDING).length,
    };
  }

  getStatusLabel(status) {
    const labels = {
      [PAYMENT_STATUS.COMPLETED]: 'Completato',
      [PAYMENT_STATUS.PENDING]: 'In Sospeso',
      [PAYMENT_STATUS.REFUNDED]: 'Rimborsato',
      [PAYMENT_STATUS.FAILED]: 'Fallito'
    };
    return labels[status] || status;
  }
}

window.adminPaymentsPage = new AdminPaymentsPage();