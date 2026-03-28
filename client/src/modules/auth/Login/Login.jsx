import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../../infra/auth/auth.api';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import Loader from '../../../shared/components/atoms/Loader/Loader';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);
  const setUser = useSetAtom(userAtom);
  const [loginType, setLoginType] = useState('tenant'); // 'tenant' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    // Redirection is handled by PublicRoute in App.jsx, but we keep this as a secondary guard
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (auth.isAuthenticated && auth.token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/tenant-dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginAPI(formData.email, formData.password, loginType);
      
      // Save to Jotai (Memory Only)
      setAuth({
        token: result.token,
        isAuthenticated: true,
      });
      setUser(result.user);
      
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/tenant-dashboard');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader text="LOGGING IN" />}
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">Login</h2>



        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setLoginType('tenant');
              setFormData({ email: '', password: '' });
              setError('');
            }}
            className={`flex-1 py-2 rounded font-medium transition ${
              loginType === 'tenant'
                ? 'bg-cyan-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tenant Login
          </button>
          <button
            onClick={() => {
              setLoginType('admin');
              setFormData({ email: '', password: '' });
              setError('');
            }}
            className={`flex-1 py-2 rounded font-medium transition ${
              loginType === 'admin'
                ? 'bg-cyan-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Admin Login
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition"
              >
                {showPassword ? (
                  <span title="Hide Password">🔒</span>
                ) : (
                  <span title="Show Password">👁️</span>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 text-gray-900 font-bold py-3 rounded hover:bg-cyan-300 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{' '}
          <a href="/register" className="text-cyan-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
    </>
  );
} 