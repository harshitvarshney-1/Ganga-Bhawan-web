import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar/Sidebar';
import Profile from './Profile/Profile';
import Details from './Details/Details';
import Payment from './Payment/Payment';
import { authAtom, userAtom } from '../../shared/hooks/store/auth.atom';
import { useAtom, useSetAtom } from 'jotai';
import { API_URL } from '../../infra/config';
import { getTenantProfileAPI } from '../../infra/tenant/tenant.api';
import Loader from '../../shared/components/atoms/Loader/Loader';

const TenantDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ token: null, isAuthenticated: false });
    sessionStorage.setItem('hasShownSplash', 'true');
    navigate('/login');
  };

  useEffect(() => {
    fetchUserProfile();

    let offlineTimer = null;
    const OFFLINE_LOGOUT_TIME = 150000;

    const handleOnline = () => {
      if (offlineTimer) { clearTimeout(offlineTimer); offlineTimer = null; }
    };

    const handleOffline = () => {
      offlineTimer = setTimeout(() => {
        if (!navigator.onLine) {
          alert('⚠️ You have been offline for more than 2 minutes. Logging out for security...');
          handleLogout();
        }
      }, OFFLINE_LOGOUT_TIME);
    };

    if (!navigator.onLine) handleOffline();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (offlineTimer) clearTimeout(offlineTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = auth.token;
      const data = await getTenantProfileAPI(token);
      setUserData(data);
      if (data.profilePicture) {
        if (data.profilePicture.startsWith('data:') || data.profilePicture.startsWith('http')) {
          setProfilePicturePreview(data.profilePicture);
        } else {
          setProfilePicturePreview(`${API_URL.replace('/api', '')}/${data.profilePicture}`);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!profilePicture) { alert('Please select a photo first'); return; }
    setSaving(true);
    try {
      const token = auth.token;
      const formDataToSend = new FormData();
      formDataToSend.append('profilePicture', profilePicture);
      const response = await fetch(`${API_URL}/tenant/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        setProfilePicture(null);
        if (data.user.profilePicture) {
          if (data.user.profilePicture.startsWith('data:') || data.user.profilePicture.startsWith('http')) {
            setProfilePicturePreview(data.user.profilePicture);
          } else {
            setProfilePicturePreview(`${API_URL.replace('/api', '')}/${data.user.profilePicture}`);
          }
        }
        alert('✅ Profile photo updated successfully!');
      } else {
        alert(data.error || 'Failed to update photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Error updating photo');
    } finally {
      setSaving(false);
    }
  };

  const sectionTitle = {
    profile: 'My Profile',
    details: 'Personal Details',
    payment: 'Payments & Dues',
  };

  if (loading) return <Loader text="LOADING TENANT PORTAL" />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userData={userData}
        profilePicturePreview={profilePicturePreview}
        handleProfilePictureChange={handleProfilePictureChange}
        handleSavePhoto={handleSavePhoto}
        saving={saving}
        profilePicture={profilePicture}
        handleLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content — floating card */}
      <div className="flex-1 min-w-0 lg:ml-56 flex flex-col lg:p-2 h-full">
        <div className="flex-1 flex flex-col lg:rounded-xl lg:border lg:border-border bg-card overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 lg:px-8 h-[44px] flex items-center justify-between shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen
              ? <X className="w-4 h-4 text-foreground" />
              : <Menu className="w-4 h-4 text-foreground" />
            }
          </button>

          <div className="hidden lg:block">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Tenant Portal</p>
            <h2 className="text-[13px] font-semibold text-foreground">{sectionTitle[activeSection]}</h2>
          </div>

          {/* Mobile title */}
          <h1 className="lg:hidden text-[13px] font-semibold text-foreground">
            Tenant Portal
          </h1>

          {/* User badge */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right">
              <p className="text-[13px] font-medium text-foreground truncate max-w-[140px] leading-none">{userData?.fullName}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[140px] mt-0.5">{userData?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
              {userData?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeSection === 'profile' && <Profile userData={userData} />}
              {activeSection === 'details' && <Details userData={userData} />}
              {activeSection === 'payment' && <Payment />}
            </motion.div>
          </AnimatePresence>
        </main>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
