import { atom } from 'jotai';

// Auth State - Stores the access token in memory
export const authAtom = atom({
  token: null,
  isAuthenticated: false,
});

// User State - Stores the user profile/role
export const userAtom = atom({
  id: null,
  name: null,
  email: null,
  role: null, // e.g., 'admin', 'tenant'
});
