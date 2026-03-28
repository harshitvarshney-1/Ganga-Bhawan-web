import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authAtom, userAtom } from './shared/hooks/store/auth.atom';

import Home from './modules/home/Home';
import Login from './modules/auth/Login/Login';
import Register from './modules/auth/Register/Register';
import AdminDashboard from './modules/admin/AdminDashboard';
import TenantDashboard from './modules/tenant/TenantDashboard';

// Protected Route Component using Jotai in-memory state
const ProtectedRoute = ({ children, requiredRole }) => {
  const authState = useAtomValue(authAtom);
  const userState = useAtomValue(userAtom);

  if (!authState.isAuthenticated || !authState.token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userState.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const authState = useAtomValue(authAtom);
  const userState = useAtomValue(userAtom);

  if (authState.isAuthenticated && authState.token) {
    const redirectPath = userState.role === 'admin' ? '/admin-dashboard' : '/tenant-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tenant-dashboard" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;