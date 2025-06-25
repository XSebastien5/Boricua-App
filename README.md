# 🎭 Boricua Dance Studio - Web App

Una Progressive Web App (PWA) completa per la gestione di una scuola di ballo caraibico, sviluppata con tecnologie web moderne e un'architettura modulare.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-ready-orange.svg)

## 🌟 Caratteristiche Principali

### 🔐 Sistema Multi-Ruolo
- **Admin**: Gestione completa della scuola
- **Maestri**: Gestione corsi e lezioni private
- **Studenti**: Prenotazioni e monitoraggio progressi

### 📱 Progressive Web App
- ✅ Installabile su dispositivi mobili e desktop
- ✅ Funzionamento offline
- ✅ Notifiche push
- ✅ Sincronizzazione automatica
- ✅ Responsive design

### 🎯 Funzionalità Core

#### Per Amministratori
- 📊 Dashboard con statistiche in tempo reale
- 👥 Gestione studenti con approvazione iscrizioni
- 👨‍🏫 Gestione maestri e assegnazione corsi
- 📚 Creazione e gestione corsi
- 💰 Monitoraggio pagamenti e fatturazione
- 📅 Calendario generale eventi
- 📢 Sistema comunicazioni e promozioni
- 📈 Report e analytics
- 💾 Backup e restore dati

#### Per Maestri
- 📅 Calendario personale
- 👥 Visualizzazione propri studenti
- 📚 Gestione corsi assegnati
- 📝 Conferma/rifiuto prenotazioni
- 📍 Course mapping (progressi studenti)
- 📱 Scanner QR per presenze

#### Per Studenti
- 📱 QR Code personale per check-in
- 📅 Prenotazione lezioni private
- 📚 Iscrizione corsi
- 💳 Storico pagamenti
- 🏆 Sistema gamification (punti e badge)
- 📊 Monitoraggio progressi
- 🔔 Notifiche personalizzate

### 🏆 Sistema Gamification
- **Punti**: Guadagnati per presenze, completamento corsi, referral
- **Badge**: 4 livelli (Bronze, Silver, Gold, Platinum)
- **Leaderboard**: Classifica studenti
- **Achievements**: Obiettivi sbloccabili
- **Livelli**: Sistema di progressione

### 💾 Gestione Dati
- **Backup automatico**: Programmabile (orario, giornaliero, settimanale)
- **Export/Import**: CSV, JSON
- **Cloud sync**: Integrazione Google Drive/Dropbox (mock)
- **Offline mode**: Funzionamento senza connessione

## 🚀 Installazione

### Requisiti
- Web server (Apache, Nginx, o anche Python SimpleHTTPServer)
- Browser moderno con supporto PWA
- HTTPS per funzionalità complete (notifiche, installazione)

### Setup Locale

1. **Clona il repository**
```bash
git clone https://github.com/XSebastien5/boricua-dance-studio.git
cd boricua-dance-studio
```

2. **Avvia un server locale**

Con Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Con Node.js:
```bash
npx http-server -p 8000
```

3. **Accedi all'app**
```
http://localhost:8000
```

## 📁 Struttura Progetto

```
boricua-dance-studio/
│
├── index.html              # Entry point
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
│
├── assets/                # Risorse statiche
│   ├── icons/            # Icone app (multiple risoluzioni)
│   ├── images/           # Immagini
│   └── logo.png          # Logo principale
│
├── css/                   # Stili
│   ├── variables.css     # Variabili CSS (tema dark)
│   ├── base.css          # Stili base
│   ├── components.css    # Componenti UI
│   ├── layout.css        # Layout
│   ├── animations.css    # Animazioni
│   └── special-components.css
│
├── js/                    # JavaScript
│   ├── config/
│   │   └── constants.js  # Costanti globali
│   │
│   ├── utils/            # Utilità
│   │   ├── storage.js    # Gestione localStorage
│   │   ├── helpers.js    # Helper functions
│   │   └── validators.js # Validazione form
│   │
│   ├── services/         # Servizi
│   │   ├── auth.service.js        # Autenticazione
│   │   ├── notification.service.js # Notifiche
│   │   ├── backup.service.js      # Backup/Restore
│   │   ├── demo.service.js        # Dati demo
│   │   ├── gamification.service.js # Gamification
│   │   ├── calendar.service.js    # Calendario
│   │   └── qr.service.js          # QR Code
│   │
│   ├── components/       # Componenti UI
│   │   ├── sidebar.js    # Menu laterale
│   │   ├── toast.js      # Notifiche toast
│   │   ├── modal.js      # Modali
│   │   ├── calendar.js   # Calendario
│   │   └── qr-scanner.js # Scanner QR
│   │
│   ├── pages/            # Pagine
│   │   ├── admin/        # Pagine admin
│   │   ├── teacher/      # Pagine maestro
│   │   └── student/      # Pagine studente
│   │
│   ├── router.js         # Sistema routing
│   └── app.js           # Controller principale
│
└── data/
    └── demo-data.json    # Dati demo
```

## 🔑 Utenti Demo

| Ruolo | Email | Password | Descrizione |
|-------|-------|----------|-------------|
| Admin | admin@boricua.com | admin123 | Accesso completo al sistema |
| Maestro | maestro@boricua.com | maestro123 | Gestione corsi e studenti |
| Studente | allievo@boricua.com | allievo123 | Prenotazioni e corsi |

## 🛠️ Tecnologie Utilizzate

- **Frontend**: Vanilla JavaScript (ES6+)
- **Stili**: CSS3 con Custom Properties
- **Storage**: LocalStorage con backup
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Material Icons
- **Font**: Poppins (Google Fonts)
- **Build**: Nessun bundler richiesto

## 📱 Funzionalità PWA

### Service Worker
- Cache offline di tutte le risorse statiche
- Sincronizzazione in background
- Gestione aggiornamenti

### Installazione
1. Visita il sito su HTTPS
2. Clicca su "Installa App" nel browser
3. L'app sarà disponibile come applicazione nativa

### Notifiche Push
- Richiedi permessi al primo accesso
- Notifiche per:
  - Conferma prenotazioni
  - Promemoria lezioni
  - Comunicazioni scuola
  - Achievement sbloccati

## 🔧 Configurazione

### Tema
L'app utilizza un tema dark di default. Le variabili CSS sono in `css/variables.css`:

```css
--color-primary: #2196F3;
--color-secondary: #F44336;
--bg-primary: #0d1117;
--text-primary: #f0f6fc;
```

### Storage
Configurazione in `js/config/constants.js`:

```javascript
const APP_CONFIG = {
  name: 'Boricua Dance Studio',
  version: '1.0.0',
  storagePrefix: 'boricua_'
};
```

## 📊 Moduli Implementati

### ✅ Completati
- Sistema autenticazione multi-ruolo
- Gestione studenti (CRUD completo)
- Gestione corsi e iscrizioni
- Sistema prenotazioni lezioni private
- Gestione pagamenti e fatturazione
- Calendario con multiple viste
- Sistema gamification completo
- Backup/Restore automatico
- Notifiche push e in-app
- QR Code per presenze
- Course mapping
- Dashboard con statistiche

### 🚧 In Sviluppo
- Tutte le pagine per Admin, 
- Report PDF avanzati
- Integrazione calendario Google

## 🌐 Deployment

### Requisiti Produzione
- HTTPS obbligatorio
- Headers PWA corretti
- Compressione gzip

### Deploy su Netlify
```bash
# Build non richiesta
netlify deploy --dir=. --prod
```

### Deploy su Vercel
```bash
vercel --prod
```

## 🤝 Contribuire

1. Fork del progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👥 Team

- **Developer**: [Il tuo nome]
- **Design**: Material Design inspired
- **Testing**: Community driven

## 📞 Supporto

- Email: info@boricuadancestudio.it
- Documentation: [Wiki](https://github.com/XSebastien5/boricua-dance-studio/wiki)
- Issues: [GitHub Issues](https://github.com/XSebastien5/boricua-dance-studio/issues)

---

<p align="center">Made with ❤️ for Boricua Dance Studio</p>