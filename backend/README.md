# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/ganga-bhawan

# JWT Secret Key (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port (Optional, defaults to 5000)
PORT=5000
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on your system

3. Create `.env` file with the variables above

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new tenant
- `POST /api/auth/login` - Login (tenant or admin)

### Tenant Routes (Protected)
- `GET /api/tenant/profile` - Get tenant profile

### Admin Routes (Protected)
- `GET /api/admin/pending-tenants` - Get all pending tenants
- `GET /api/admin/approved-tenants` - Get all approved tenants
- `POST /api/admin/approve-tenant/:id` - Approve a tenant
- `DELETE /api/admin/reject-tenant/:id` - Reject/Delete a tenant

## Notes

- The `uploads` directory is automatically created for storing Aadhaar documents
- All protected routes require a Bearer token in the Authorization header
- Tenant accounts require admin approval before they can login

