# 🏢 Ganga Bhawan — Hostel Management System

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

**A full-stack hostel management platform with tenant self-service, admin controls, and automated financial tracking.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Environment Variables](#-environment-variables) · [License](#-license)

</div>

---

## 📌 Overview

Ganga Bhawan is a production-grade property management web application built for **Ganga Bhawan Hostel (Hariom)**. It provides a dual-portal system — one for tenants and one for administrators — enabling seamless onboarding, secure document management, transparent rent tracking, and email-based payment approvals with zero manual overhead.

---

## ✨ Features

### 👤 Tenant Portal
| Feature | Description |
|---|---|
| **Smart Registration** | Multi-step onboarding: Aadhaar (front & back) + profile photo upload |
| **Payment Dashboard** | Interactive monthly payment grid with Paid / Pending / Overdue status |
| **Advanced Booking** | Pre-pay for upcoming months in advance with a single click |
| **Manual Payments** | Submit offline (cash) payments that get routed for admin approval |
| **Document Vault** | Secure access to uploaded Aadhaar and personal documents at any time |
| **Email Notifications** | Automated confirmation emails on payment submission and approval |
| **Dark Mode** | Full light/dark theme with system preference detection |

### 🛠️ Admin Portal
| Feature | Description |
|---|---|
| **Document Verification** | Side-by-side Aadhaar viewer for real-time identity checks |
| **Email-Based Approvals** | Approve or reject payments directly from inbox via secure one-click tokens |
| **Manual Payment Recording** | Record cash payments on behalf of tenants with notes |
| **Tenant CRM** | Enable, disable, or reset tenant accounts with full audit visibility |
| **Transaction History** | View all payments with mode (Online / Cash), amount, and status |
| **Financial Overview** | Dashboard tiles for total tenants, pending reviews, and monthly collections |
| **Cron-Based Overdue Tracking** | Automated background job flags unpaid rents as overdue |

---

## 🚀 Tech Stack

### Frontend
- **React.js** — Component-based SPA architecture
- **Tailwind CSS** — Utility-first responsive styling with OKLCH color system
- **Framer Motion** — Smooth page transitions and micro-animations
- **Lucide React** — Consistent icon library
- **Vite** — Fast development bundler and HMR

### Backend
- **Node.js + Express** — RESTful API server (ES Modules)
- **MongoDB + Mongoose** — Document database with typed schemas
- **JWT** — Stateless auth with secure token handling
- **Multer** — Multipart file upload processing
- **Cloudinary** — Cloud image storage with temp-file strategy + exponential backoff retry
- **Nodemailer + Gmail OAuth2** — Rich HTML transactional emails
- **node-cron** — Scheduled jobs for overdue rent flagging
- **express-rate-limit** — Brute-force and abuse protection

---

## 📁 Project Structure

```
Ganga-Bhawan-web/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── modules/
│       │   ├── admin/          # Admin portal pages & components
│       │   ├── tenant/         # Tenant portal pages & components
│       │   ├── auth/           # Login & registration flows
│       │   ├── home/           # Public landing page
│       │   └── splash/         # Splash / loading screen
│       ├── shared/             # Shared UI components (Navbar, ThemeToggle, etc.)
│       ├── services/           # Axios API call wrappers
│       ├── lib/                # Utility functions
│       └── routes/             # React Router configuration
│
└── server/                     # Node.js + Express backend
    └── src/
        ├── controllers/        # Route handler logic
        ├── models/             # Mongoose schemas
        ├── routes/             # Express route definitions
        ├── middleware/         # Auth, rate-limit, error middleware
        └── index.js            # App entry point
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js `v18+`
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Cloudinary account
- Gmail account with [OAuth2 or App Password](https://support.google.com/accounts/answer/185833) configured

### 1. Clone the Repository
```bash
git clone https://github.com/harshitvarshney-1/Ganga-Bhawan-web.git
cd Ganga-Bhawan-web
```

### 2. Configure Environment Variables
Create a `.env` file inside the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_uri

# Authentication
JWT_SECRET=your_strong_random_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail OAuth2 or App Password)
EMAIL_USER=your_admin_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# URLs
API_URL=http://localhost:5000/api
CLIENT_URL=http://localhost:5173
```

> **Tip:** A `.env.example` file is provided in `server/` as a reference template.

### 3. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (from server/)
npm run dev        # uses nodemon for hot reload

# Terminal 2 — Frontend (from client/)
npm run dev        # Vite dev server at http://localhost:5173
```

The app will be available at **http://localhost:5173**

---

## 🔐 Security

This project follows security best practices:

- **JWT authentication** with enforced secret via environment variables (no fallback defaults)
- **CORS whitelisting** — only trusted origins accepted
- **Security headers** — `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, `HSTS`, `Referrer-Policy`, `Permissions-Policy`
- **Rate limiting** on authentication endpoints via `express-rate-limit`
- **Input validation** on all file uploads and user-submitted data
- **Cloudinary upload strategy** with temp-file buffering and automatic retry on failure
- **Email approval tokens** — one-time, server-validated tokens for payment actions

---

## 📧 Email Workflow

```
Tenant submits payment receipt
        │
        ▼
Admin receives rich HTML email with payment details
        │
        ▼
Admin clicks "Approve" or "Reject" link in email
        │
        ▼
Server validates one-time token → updates payment status
        │
        ▼
Tenant receives confirmation email with updated status
```

---

## 📱 Responsive Design

| Viewport | Status |
|---|---|
| Mobile (375px) | ✅ Fully responsive — no horizontal scroll |
| Tablet (768px) | ✅ Adaptive grid layout |
| Desktop (1024px+) | ✅ Optimized full-width experience |

---

## ⚖️ License

This project is licensed under a **restricted license**. Developed exclusively for **Ganga Bhawan (Hariom)**. Unauthorized redistribution or commercial use is prohibited. See [LICENSE](./LICENSE) for details.

---

<div align="center">
Built with ❤️ for <strong>Ganga Bhawan</strong> &nbsp;|&nbsp; Maintained by <a href="https://github.com/harshitvarshney-1">Harshit Varshney</a>
</div>
