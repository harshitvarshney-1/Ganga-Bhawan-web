import { atom } from 'jotai';

// Helper to get initial state from localStorage
const getStorageItem = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
};

// Auth State - Persists in localStorage
const initialAuth = getStorageItem('auth', {
  token: null,
  isAuthenticated: false,
});

export const authAtom = atom(
  initialAuth,
  (get, set, update) => {
    set(authAtom, update);
    localStorage.setItem('auth', JSON.stringify(update));
  }
);

// User State - Persists in localStorage
const initialUser = getStorageItem('user', {
  id: null,
  name: null,
  email: null,
  role: null,
});

export const userAtom = atom(
  initialUser,
  (get, set, update) => {
    set(userAtom, update);
    localStorage.setItem('user', JSON.stringify(update));
  }
);
