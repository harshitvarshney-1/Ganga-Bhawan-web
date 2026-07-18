import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../../infra/auth/auth.api';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import Loader from '../../../shared/components/atoms/Loader/Loader';
import LogoIcon from "@/shared/components/atoms/Logo/LogoIcon";
import NavBar from '../../../shared/components/organisms/NavBar/NavBar';
import LampLogin from './LampLogin';

export default function Login() {
  const navigate = useNavigate();
  const [isLampOn, setIsLampOn] = useState(false);
  const setAuth = useSetAtom(authAtom);
  const setUser = useSetAtom(userAtom);
  const [loginType, setLoginType] = useState('tenant');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (auth.isAuthenticated && auth.token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(user.role === 'admin' ? '/admin-dashboard' : '/tenant-dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await loginAPI(formData.email, formData.password, loginType);
      setAuth({ token: result.token, isAuthenticated: true });
      setUser(result.user);
      navigate(result.user.role === 'admin' ? '/admin-dashboard' : '/tenant-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col lg:flex-row ${isLampOn ? 'bg-background' : 'bg-background/95'}`}>
      <NavBar />
      {loading && <Loader text="LOGGING IN" />}
      
      {/* Left side: Lamp */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 pt-20 lg:pt-0">
         <LampLogin onToggle={setIsLampOn} />
      </div>

      {/* Right side: Login Form */}
      <div className={`flex-1 w-full flex items-center justify-center p-6 lg:p-12 relative z-10 mt-10 lg:mt-0 lg:border-l border-border transition-all duration-1000 ${isLampOn ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-10'}`}>
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg transition-all duration-700 bg-primary/10 text-primary ${isLampOn ? 'shadow-primary/20' : ''}`}>
              <LogoIcon size={40} />
            </div>
            <h1 className="text-2xl font-bold text-foreground transition-colors duration-700">Welcome Back</h1>
            <p className="text-[14px] mt-1 text-muted-foreground transition-colors">Sign in to your account</p>
          </div>

          <div className={`rounded-xl border p-6 shadow-2xl backdrop-blur-xl transition-all duration-700 bg-card border-border ${isLampOn ? 'shadow-primary/10' : 'shadow-sm'}`}>
            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-lg bg-muted transition-colors duration-700">
              {['tenant', 'admin'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setLoginType(type); setFormData({ email: '', password: '' }); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-colors capitalize ${
                    loginType === type
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type} Login
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-[13px] p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-foreground transition-colors">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-md border text-[13px] focus:outline-none focus:ring-2 transition-colors bg-background text-foreground border-input placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-foreground transition-colors">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-md border text-[13px] pr-10 focus:outline-none focus:ring-2 transition-colors bg-background text-foreground border-input placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition text-sm"
                  >
                    {showPassword ? '🔒' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-2.5 rounded-md transition-all disabled:opacity-50 text-[13px] mt-2 bg-primary text-primary-foreground hover:bg-primary/90 ${isLampOn ? 'shadow-lg shadow-primary/30 opacity-100' : 'opacity-90'}`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-[12px] text-center mt-5 text-muted-foreground transition-colors">
              Don't have an account?{' '}
              <a href="/register" className="font-medium hover:underline text-primary transition-colors">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
