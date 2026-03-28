# 🏢 Ganga Bhawan – Modern Tenant & Admin Portal

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

A premium, full-stack property management solution designed for seamless tenant onboarding, automated financial tracking, and secure document verification. Built with a focus on high-end aesthetics and "bullet-proof" reliability.

---

## ✨ Key Features

### 👤 For Tenants
- **Smart Registration**: Multi-part onboarding with Aadhaar front/back and profile photo verification.
- **Interactive Payments**: Desktop-grade payment schedule grid with status tracking (Paid, Pending, Overdue).
- **Advanced Booking**: Pre-pay for future months with one-click advanced booking.
- **Document Vault**: View and download uploaded documents anytime from a secure profile.
- **Mobile-First Design**: Fully responsive UI optimized for property management on the go.

### 🛠️ For Admin
- **Document Verification**: Real-time Aadhaar photo viewer with side-by-side comparison.
- **1-Click Approvals**: Approve or reject payment receipts directly from your **Email Inbox** using secure tokens.
- **Tenant CRM**: Disable, enable, or reset tenant accounts with a professional management interface.
- **Financial Analytics**: Overview metrics tiles for total registrations, pending reviews, and monthly growth.

---

## 🚀 Technology Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion (Animations), Lucide Icons.
- **Backend**: Node.js, Express, JWT Authentication, Multer.
- **Database**: MongoDB (Mongoose ODM).
- **Cloud Storage**: Cloudinary (Reliable temp-file based upload strategy with exponential backoff).
- **Messaging**: Nodemailer with rich HTML templates.

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/harshitvarshney-1/Ganga-Bhawan-web.git
cd Ganga-Bhawan-web
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
API_URL=http://localhost:5000/api
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_admin_email
EMAIL_PASS=your_app_password
```

### 3. Install Dependencies
```bash
# Install Server dependencies
cd server && npm install

# Install Client dependencies
cd ../client && npm install
```

### 4. Run Development Servers
```bash
# Start Backend (from server directory)
npm start

# Start Frontend (from client directory)
npm run dev
```

---

## 📸 Component Screenshots

> [!TIP]
> This project uses a mobile-first responsive strategy. Grids and navbars automatically adapt to provide a premium container-based experience on both Extra-Small (mobile) and Extra-Large (monitor) screens.

---

## ⚖️ License & Contact
Developed with ❤️ for **Ganga Bhawan (Hariom)**. All rights reserved. For support or custom property management solutions, contact through the admin portal.
