// Admin Payments Page - Boricua Dance Studio

class AdminPaymentsPage {
  constructor() {
    this.payments = [];
    this.students = [];
    this.subscriptions = [];
    this.currentFilter = 'all';
    this.dateRange = 'month';
    this.searchTerm = '';
  }

  async render() {
    this.payments = Storage.get(STORAGE_KEYS.PAYMENTS) || [];
    this.students = Storage.get(STORAGE_KEYS.STUDENTS) || [];
    this.subscriptions = Storage.get(STORAGE_KEYS.SUBSCRIPTIONS) || [];
    
    const stats = this.calculateStats();
    
    return `
      <div class="payments-page">
        <!-- Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">Gestione Pagamenti</h1>
            <p class="page-subtitle">Monitora entrate e pagamenti</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" onclick="adminPaymentsPage.addManualPayment()">
              <span class="material-icons">add</span>
              Registra Pagamento
            </button>
            <button class="btn btn-outline" onclick="adminPaymentsPage.exportPayments()">
              <span class="material-icons">download</span>
              Esporta
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="payment-stats">
          <div class="stat-card">
            <div class="stat-icon success">
              <span class="material-icons">euro</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Entrate Questo Mese</div>
              <div class="stat-value">${NumberHelpers.formatCurrency(stats.monthRevenue)}</div>
              <div class="stat-change ${stats.monthChange >= 0 ? 'positive' : 'negative'}">
                <span class="material-icons">${stats.monthChange >= 0 ? 'trending_up' : 'trending_down'}</span>
                ${Math.abs(stats.monthChange).toFixed(1)}% vs mese scorso
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon primary">
              <span class="material-icons">calendar_today</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Entrate Oggi</div>
              <div class="stat-value">${NumberHelpers.formatCurrency(stats.todayRevenue)}</div>
              <div class="stat-details">${stats.todayCount} pagamenti</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon warning">
              <span class="material-icons">pending</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">In Sospeso</div>
              <div class="stat-value">${NumberHelpers.formatCurrency(stats.pendingAmount)}</div>
              <div class="stat-details">${stats.pendingCount} pagamenti</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon secondary">
              <span class="material-icons">groups</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Abbonamenti Attivi</div>
              <div class="stat-value">${stats.activeSubscriptions}</div>
              <div class="stat-details">su ${this.students.length} studenti</div>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="card mt-3">
          <div class="card-header">
            <h3 class="card-title">Andamento Entrate</h3>
            <div class="chart-controls">
              <button class="chart-btn ${this.dateRange === 'week' ? 'active' : ''}" 
                      onclick="adminPaymentsPage.changeDateRange('week')">
                Settimana
              </button>
              <button class="chart-btn ${this.dateRange === 'month' ? 'active' : ''}" 
                      onclick="adminPaymentsPage.changeDateRange('month')">
                Mese
              </button>
              <button class="chart-btn ${this.dateRange === 'year' ? 'active' : ''}" 
                      onclick="adminPaymentsPage.changeDateRange('year')">
                Anno
              </button>
            </div>
          </div>
          <div class="card-body">
            <div id="revenue-chart" class="chart-container">
              ${this.renderRevenueChart()}
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar mt-3">
          <div class="search-box">
            <span class="material-icons">search</span>
            <input type="text" 
                   placeholder="Cerca per studente, importo o descrizione..." 
                   class="search-input"
                   value="${this.searchTerm}"
                   onkeyup="adminPaymentsPage.handleSearch(event)">
          </div>
          
          <div class="filter-buttons">
            <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                    onclick="adminPaymentsPage.filterPayments('all')">
              Tutti
            </button>
            <button class="filter-btn ${this.currentFilter === 'completed' ? 'active' : ''}" 
                    onclick="adminPaymentsPage.filterPayments('completed')">
              Completati
            </button>
            <button class="filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}" 
                    onclick="adminPaymentsPage.filterPayments('pending')">
              In Sospeso
            </button>
            <button class="filter-btn ${this.currentFilter === 'failed' ? 'active' : ''}" 
                    onclick="adminPaymentsPage.filterPayments('failed')">
              Falliti
            </button>
          </div>
          
          <div class="date-filter">
            <input type="date" id="filter-start-date" onchange="adminPaymentsPage.applyDateFilter()">
            <span>-</span>
            <input type="date" id="filter-end-date" onchange="adminPaymentsPage.applyDateFilter()">
          </div>
        </div>

        <!-- Payments Table -->
        <div class="table-container mt-3">
          <table class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Studente</th>
                <th>Tipo</th>
                <th>Descrizione</th>
                <th>Metodo</th>
                <th>Importo</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderPaymentsTable()}
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="payments-summary mt-3">
          <div class="summary-item">
            <span>Totale Visualizzato:</span>
            <strong>${NumberHelpers.formatCurrency(this.getFilteredTotal())}</strong>
          </div>
          <div class="summary-item">
            <span>Pagamenti:</span>
            <strong>${this.getFilteredPayments().length}</strong>
          </div>
        </div>
      </div>
    `;
  }

  renderRevenueChart() {
    const data = this.getChartData();
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 200;
    
    return `
      <div class="revenue-chart">
        <div class="chart-bars">
          ${data.map(item => {
            const height = (item.value / maxValue) * chartHeight;
            return `
              <div class="chart-bar-wrapper">
                <div class="chart-bar" 
                     style="height: ${height}px"
                     title="${NumberHelpers.formatCurrency(item.value)}">
                  <span class="bar-value">${this.formatChartValue(item.value)}</span>
                </div>
                <span class="bar-label">${item.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderPaymentsTable() {
    const payments = this.getFilteredPayments();
    
    if (payments.length === 0) {
      return '<tr><td colspan="8" class="text-center text-secondary">Nessun pagamento trovato</td></tr>';
    }
    
    return payments.map(payment => {
      const student = this.students.find(s => s.id === payment.studentId);
      
      return `
        <tr>
          <td>
            <div class="date-cell">
              <div>${DateHelpers.formatDate(payment.date)}</div>
              <div class="text-sm text-secondary">${DateHelpers.formatDate(payment.date, 'time')}</div>
            </div>
          </td>
          <td>
            ${student ? `
              <div class="user-cell">
                <div class="avatar avatar-sm">
                  ${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}
                </div>
                <div>
                  <div class="font-medium">${student.firstName} ${student.lastName}</div>
                  <div class="text-sm text-secondary">${student.email}</div>
                </div>
              </div>
            ` : '<span class="text-secondary">Studente non trovato</span>'}
          </td>
          <td>
            <span class="payment-type-badge ${payment.type}">
              ${this.getPaymentTypeLabel(payment.type)}
            </span>
          </td>
          <td>${payment.description || '-'}</td>
          <td>
            <span class="payment-method">
              <span class="material-icons">${this.getPaymentMethodIcon(payment.method)}</span>
              ${this.getPaymentMethodLabel(payment.method)}
            </span>
          </td>
          <td class="font-medium">${NumberHelpers.formatCurrency(payment.amount)}</td>
          <td>
            <span class="status-indicator status-${payment.status}">
              ${this.getStatusLabel(payment.status)}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="icon-btn" onclick="adminPaymentsPage.viewPayment('${payment.id}')" title="Dettagli">
                <span class="material-icons">visibility</span>
              </button>
              ${payment.invoice ? `
                <button class="icon-btn" onclick="adminPaymentsPage.downloadInvoice('${payment.invoice}')" title="Scarica Fattura">
                  <span class="material-icons">receipt</span>
                </button>
              ` : ''}
              ${payment.status === PAYMENT_STATUS.PENDING ? `
                <button class="icon-btn text-success" onclick="adminPaymentsPage.confirmPayment('${payment.id}')" title="Conferma">
                  <span class="material-icons">check_circle</span>
                </button>
                <button class="icon-btn text-danger" onclick="adminPaymentsPage.cancelPayment('${payment.id}')" title="Annulla">
                  <span class="material-icons">cancel</span>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Stats calculations

  calculateStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // This month revenue
    const monthRevenue = this.payments
      .filter(p => 
        p.status === PAYMENT_STATUS.COMPLETED &&
        new Date(p.date) >= startOfMonth
      )
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Last month revenue
    const lastMonthRevenue = this.payments
      .filter(p => 
        p.status === PAYMENT_STATUS.COMPLETED &&
        new Date(p.date) >= startOfLastMonth &&
        new Date(p.date) <= endOfLastMonth
      )
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Today revenue
    const todayPayments = this.payments.filter(p => 
      p.status === PAYMENT_STATUS.COMPLETED &&
      new Date(p.date).toDateString() === today.toDateString()
    );
    
    // Pending
    const pendingPayments = this.payments.filter(p => p.status === PAYMENT_STATUS.PENDING);
    
    // Active subscriptions
    const activeSubscriptions = this.subscriptions.filter(s => 
      s.status === 'active' &&
      new Date(s.endDate) > now
    ).length;
    
    return {
      monthRevenue,
      monthChange: lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      todayRevenue: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      todayCount: todayPayments.length,
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pendingPayments.length,
      activeSubscriptions
    };
  }

  getChartData() {
    const data = [];
    const now = new Date();
    
    switch (this.dateRange) {
      case 'week':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayRevenue = this.getRevenueForDate(date);
          data.push({
            label: DateHelpers.getDayName(date).substring(0, 3),
            value: dayRevenue
          });
        }
        break;
        
      case 'month':
        // Last 30 days grouped by week
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() - (i * 7));
          
          const weekRevenue = this.getRevenueForPeriod(weekStart, weekEnd);
          data.push({
            label: `Sett ${4 - i}`,
            value: weekRevenue
          });
        }
        break;
        
      case 'year':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthRevenue = this.getRevenueForMonth(date);
          data.push({
            label: DateHelpers.getMonthName(date).substring(0, 3),
            value: monthRevenue
          });
        }
        break;
    }
    
    return data;
  }

  getRevenueForDate(date) {
    return this.payments
      .filter(p => 
        p.status === PAYMENT_STATUS.COMPLETED &&
        new Date(p.date).toDateString() === date.toDateString()
      )
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getRevenueForPeriod(startDate, endDate) {
    return this.payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return p.status === PAYMENT_STATUS.COMPLETED &&
               paymentDate >= startDate &&
               paymentDate <= endDate;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getRevenueForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return this.payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return p.status === PAYMENT_STATUS.COMPLETED &&
               paymentDate.getFullYear() === year &&
               paymentDate.getMonth() === month;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  formatChartValue(value) {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}k`;
    }
    return `€${value}`;
  }

  // Filters

  getFilteredPayments() {
    let filtered = [...this.payments];
    
    // Status filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.currentFilter);
    }
    
    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => {
        const student = this.students.find(s => s.id === p.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : '';
        
        return studentName.includes(search) ||
               p.description?.toLowerCase().includes(search) ||
               p.amount.toString().includes(search) ||
               p.invoice?.toLowerCase().includes(search);
      });
    }
    
    // Date filter
    const startDate = document.getElementById('filter-start-date')?.value;
    const endDate = document.getElementById('filter-end-date')?.value;
    
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
  }

  getFilteredTotal() {
    return this.getFilteredPayments()
      .filter(p => p.status === PAYMENT_STATUS.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  // Actions

  handleSearch(event) {
    this.searchTerm = event.target.value;
    this.updateTable();
  }

  filterPayments(filter) {
    this.currentFilter = filter;
    this.updateTable();
    
    // Update UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  applyDateFilter() {
    this.updateTable();
  }

  changeDateRange(range) {
    this.dateRange = range;
    
    // Update chart
    const chartContainer = document.getElementById('revenue-chart');
    if (chartContainer) {
      chartContainer.innerHTML = this.renderRevenueChart();
    }
    
    // Update buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  updateTable() {
    const tbody = document.querySelector('.table tbody');
    if (tbody) {
      tbody.innerHTML = this.renderPaymentsTable();
    }
    
    // Update summary
    const summaryElements = document.querySelectorAll('.payments-summary strong');
    if (summaryElements.length >= 2) {
      summaryElements[0].textContent = NumberHelpers.formatCurrency(this.getFilteredTotal());
      summaryElements[1].textContent = this.getFilteredPayments().length;
    }
  }

  async addManualPayment() {
    const studentOptions = this.students
      .filter(s => s.status === STUDENT_STATUS.ACTIVE)
      .map(s => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName}`
      }));
    
    Modal.form({
      title: 'Registra Pagamento Manuale',
      size: 'medium',
      fields: [
        {
          name: 'studentId',
          label: 'Studente',
          type: 'select',
          options: studentOptions,
          required: true
        },
        {
          name: 'type',
          label: 'Tipo',
          type: 'select',
          options: [
            { value: 'subscription', label: 'Abbonamento' },
            { value: 'booking', label: 'Lezione Privata' },
            { value: 'other', label: 'Altro' }
          ],
          required: true
        },
        {
          name: 'amount',
          label: 'Importo (€)',
          type: 'number',
          min: 0,
          step: 0.01,
          required: true
        },
        {
          name: 'method',
          label: 'Metodo di Pagamento',
          type: 'select',
          options: [
            { value: 'cash', label: 'Contanti' },
            { value: 'credit_card', label: 'Carta di Credito' },
            { value: 'bank_transfer', label: 'Bonifico' },
            { value: 'other', label: 'Altro' }
          ],
          required: true
        },
        {
          name: 'description',
          label: 'Descrizione',
          type: 'text',
          required: true
        },
        {
          name: 'date',
          label: 'Data',
          type: 'date',
          value: new Date().toISOString().split('T')[0],
          required: true
        }
      ],
      onSubmit: (formData) => {
        const newPayment = {
          id: StringHelpers.generateId('payment'),
          ...formData,
          amount: parseFloat(formData.amount),
          status: PAYMENT_STATUS.COMPLETED,
          invoice: this.generateInvoiceNumber()
        };
        
        this.payments.push(newPayment);
        Storage.set(STORAGE_KEYS.PAYMENTS, this.payments);
        
        Toast.show('Pagamento registrato con successo', 'success');
        this.render().then(html => {
          document.getElementById('page-content').innerHTML = html;
        });
      }
    });
  }

  viewPayment(paymentId) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const student = this.students.find(s => s.id === payment.studentId);
    
    const content = `
      <div class="payment-details">
        <div class="detail-section">
          <h4>Informazioni Pagamento</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID Transazione:</label>
              <span>${payment.id}</span>
            </div>
            <div class="detail-item">
              <label>Data:</label>
              <span>${DateHelpers.formatDate(payment.date, 'datetime')}</span>
            </div>
            <div class="detail-item">
              <label>Importo:</label>
              <span class="font-medium">${NumberHelpers.formatCurrency(payment.amount)}</span>
            </div>
            <div class="detail-item">
              <label>Stato:</label>
              <span class="status-indicator status-${payment.status}">
                ${this.getStatusLabel(payment.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Studente</h4>
          ${student ? `
            <div class="student-info">
              <div class="avatar">
                ${StringHelpers.getInitials(student.firstName + ' ' + student.lastName)}
              </div>
              <div>
                <p class="font-medium">${student.firstName} ${student.lastName}</p>
                <p class="text-secondary">${student.email}</p>
                <p class="text-secondary">${student.phone}</p>
              </div>
            </div>
          ` : '<p class="text-secondary">Studente non trovato</p>'}
        </div>
        
        <div class="detail-section">
          <h4>Dettagli</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Tipo:</label>
              <span>${this.getPaymentTypeLabel(payment.type)}</span>
            </div>
            <div class="detail-item">
              <label>Metodo:</label>
              <span>${this.getPaymentMethodLabel(payment.method)}</span>
            </div>
            <div class="detail-item">
              <label>Descrizione:</label>
              <span>${payment.description || '-'}</span>
            </div>
            <div class="detail-item">
              <label>Fattura:</label>
              <span>${payment.invoice || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    Modal.create({
      title: 'Dettagli Pagamento',
      content: content,
      size: 'medium',
      actions: [
        {
          text: 'Chiudi',
          class: 'btn-primary',
          onClick: () => true
        }
      ]
    });
  }

  async confirmPayment(paymentId) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    payment.status = PAYMENT_STATUS.COMPLETED;
    Storage.set(STORAGE_KEYS.PAYMENTS, this.payments);
    
    Toast.show('Pagamento confermato', 'success');
    this.updateTable();
  }

  async cancelPayment(paymentId) {
    const confirmed = await Modal.confirm({
      title: 'Annulla Pagamento',
      message: 'Sei sicuro di voler annullare questo pagamento?',
      confirmText: 'Annulla Pagamento',
      confirmClass: 'btn-danger'
    });
    
    if (confirmed) {
      const payment = this.payments.find(p => p.id === paymentId);
      if (payment) {
        payment.status = PAYMENT_STATUS.FAILED;
        Storage.set(STORAGE_KEYS.PAYMENTS, this.payments);
        
        Toast.show('Pagamento annullato', 'info');
        this.updateTable();
      }
    }
  }

  downloadInvoice(invoiceNumber) {
    Toast.show('Download fattura in sviluppo', 'info');
  }

  exportPayments() {
    Modal.form({
      title: 'Esporta Pagamenti',
      fields: [
        {
          name: 'format',
          label: 'Formato',
          type: 'select',
          options: [
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
            { value: 'pdf', label: 'PDF Report' }
          ],
          required: true
        },
        {
          name: 'period',
          label: 'Periodo',
          type: 'select',
          options: [
            { value: 'current', label: 'Filtri Correnti' },
            { value: 'month', label: 'Questo Mese' },
            { value: 'lastMonth', label: 'Mese Scorso' },
            { value: 'year', label: 'Questo Anno' },
            { value: 'all', label: 'Tutti' }
          ],
          required: true
        }
      ],
      onSubmit: (formData) => {
        if (formData.format === 'csv') {
          BackupService.exportCollectionAsCSV(STORAGE_KEYS.PAYMENTS, `pagamenti-${formData.period}`);
        } else {
          Toast.show(`Export ${formData.format} in sviluppo`, 'info');
        }
      }
    });
  }

  // Utility methods

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const count = this.payments.filter(p => 
      p.invoice && p.invoice.startsWith(`INV-${year}-`)
    ).length + 1;
    
    return `INV-${year}-${String(count).padStart(3, '0')}`;
  }

  getPaymentTypeLabel(type) {
    const labels = {
      'subscription': 'Abbonamento',
      'booking': 'Lezione Privata',
      'other': 'Altro'
    };
    return labels[type] || type;
  }

  getPaymentMethodLabel(method) {
    const labels = {
      'cash': 'Contanti',
      'credit_card': 'Carta di Credito',
      'bank_transfer': 'Bonifico',
      'other': 'Altro'
    };
    return labels[method] || method;
  }

  getPaymentMethodIcon(method) {
    const icons = {
      'cash': 'euro',
      'credit_card': 'credit_card',
      'bank_transfer': 'account_balance',
      'other': 'payment'
    };
    return icons[method] || 'payment';
  }

  getStatusLabel(status) {
    const labels = {
      [PAYMENT_STATUS.PENDING]: 'In Sospeso',
      [PAYMENT_STATUS.COMPLETED]: 'Completato',
      [PAYMENT_STATUS.FAILED]: 'Fallito',
      [PAYMENT_STATUS.REFUNDED]: 'Rimborsato'
    };
    return labels[status] || status;
  }
}

// Create global instance
window.adminPaymentsPage = new AdminPaymentsPage();