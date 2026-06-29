import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../../infra/auth/auth.api';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import Loader from '../../../shared/components/atoms/Loader/Loader';
import LogoIcon from "@/shared/components/atoms/Logo/LogoIcon";
import NavBar from '../../../shared/components/organisms/NavBar/NavBar';

export default function Login() {
  const navigate = useNavigate();
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
    <>
      <NavBar />
      {loading && <Loader text="LOGGING IN" />}
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 shadow-lg text-primary">
              <LogoIcon size={40} />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Ganga Bhawan</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Sign in to your account</p>
          </div>



          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-muted rounded-lg">
              {['tenant', 'admin'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setLoginType(type); setFormData({ email: '', password: '' }); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-colors capitalize ${
                    loginType === type
                      ? 'bg-card text-foreground shadow-sm'
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-background text-foreground px-3 py-2 rounded-md border border-border focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-[13px] placeholder:text-muted-foreground"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-background text-foreground px-3 py-2 rounded-md border border-border focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-[13px] placeholder:text-muted-foreground pr-10"
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
                className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50 text-[13px] mt-1"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-[12px] text-muted-foreground text-center mt-4">
              Don't have an account?{' '}
              <a href="/register" className="text-primary hover:underline font-medium">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
