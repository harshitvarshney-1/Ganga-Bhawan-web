# Cloudinary Architecture & Setup Guide

This project uses a **Direct Signed Upload** architecture for handling images. This is the industry-standard approach for applications deployed on platforms like Vercel.

---

## 🚀 1. Why Direct Upload?

In traditional apps, files go: `Client -> Your Server -> Cloudinary`.
**The Problem:** Vercel serverless functions have a timeout (usually 10-60 seconds). Uploading large images through your server often triggers a **504 Gateway Timeout**.

**The Solution:** We use `Client -> Cloudinary`. 
The files never touch your backend, making it impossible for your server to crash or timeout during an upload.

---

## 🛠️ 2. The Step-by-Step Flow

### Step A: Signature Request (Security)
When a user selects a file in `Register.jsx`:
1.  The Frontend calls `POST /api/cloudinary/sign` on our backend.
2.  Our Backend uses the `CLOUDINARY_API_SECRET` to create a cryptographically signed "permission ticket".
3.  This ticket tells Cloudinary exactly which folder the user is allowed to upload to.

### Step B: Client-Side Compression
Before uploading, the frontend uses `browser-image-compression`:
- Target size: ~0.8 MB.
- This ensures fast uploads even on slow 4G/3G connections.

### Step C: Direct Upload
1.  The Frontend sends the **File + Signature + API Key** directly to `https://api.cloudinary.com/v1_1/`.
2.  Cloudinary verifies the signature and accepts the file.
3.  Cloudinary returns a `secure_url`.

### Step D: Final Registration
When the user clicks "Register Now":
- Only the **Image URL** (text) is sent to our backend.
- This request is tiny and completes in milliseconds.

---

## 📁 3. Key Components in the Code

### 🖥️ Frontend: [Register.jsx](file:///d:/Coding/GitHub/Projects/Ganga-Bhawan-web/client/src/Components/Register/Register.jsx)
Look for the `uploadToCloudinaryDirect` function. It handles the API call to our backend for the signature and the `axios.post` to Cloudinary.

### ⚙️ Backend Controller: [sign.controller.js](file:///d:/Coding/GitHub/Projects/Ganga-Bhawan-web/server/src/controllers/cloudinary/sign.controller.js)
This file generates the signature. It uses your `API_SECRET` but **never exposes it to the browser**.

### 🔧 Cloudinary Config: [cloudinary.js](file:///d:/Coding/GitHub/Projects/Ganga-Bhawan-web/server/src/infra/cloudinary.js)
Initializes the Cloudinary SDK with your credentials.

---

## 🔑 4. Required Environment Variables

### Server (`server/.env`)
```env
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000  # For local
# OR
VITE_API_BASE_URL=https://your-backend.vercel.app  # For production
```

---

## ✅ 5. Advantages of this Setup
1.  **Zero Backend Load**: Your server doesn't use CPU or RAM for image processing.
2.  **No Timeouts**: Works perfectly on Vercel's free tier.
3.  **Better UX**: Users see immediate feedback (Upload Progress) during selection.
4.  **Secure**: No one can upload to your Cloudinary without a signature from your backend.
