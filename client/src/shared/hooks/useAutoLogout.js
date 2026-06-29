import { useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { authAtom, userAtom } from './store/auth.atom';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

export const useAutoLogout = (timeout = TIMEOUT_MS) => {
  const setAuth = useSetAtom(authAtom);
  const setUser = useSetAtom(userAtom);
  const authState = useAtomValue(authAtom);
  const navigate = useNavigate();

  useEffect(() => {
    // Only run if the user is authenticated
    if (!authState?.isAuthenticated) return;

    let timeoutId;

    const performLogout = () => {
      // Clear jotai states
      setAuth({ token: null, isAuthenticated: false });
      setUser({ id: null, name: null, email: null, role: null });
      
      // Clear any raw local storage that might be used by old api files
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      
      // Redirect to login page
      navigate('/login', { replace: true });
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(performLogout, timeout);
    };

    // Initialize timer on mount
    resetTimer();

    // List of events that represent user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Attach listeners to window
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [authState?.isAuthenticated, navigate, setAuth, setUser, timeout]);
};
