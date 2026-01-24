import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Profile from './Profile/Profile';
import Details from './Details/Details';
import Payment from './Payment/Payment';
import { BASE_URL } from '../../services/api';

const TenantDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    fetchUserProfile();
    
    // Offline detection and auto-logout after 2-3 minutes
    let offlineTimer = null;
    const OFFLINE_LOGOUT_TIME = 150000; // 2.5 minutes (150 seconds)
    
    const handleOnline = () => {
      // Clear timer if user comes back online
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        offlineTimer = null;
      }
    };
    
    const handleOffline = () => {
      // Start timer when user goes offline
      offlineTimer = setTimeout(() => {
        // Check if still offline after timeout
        if (!navigator.onLine) {
          alert('⚠️ You have been offline for more than 2 minutes. Logging out for security...');
          handleLogout();
        }
      }, OFFLINE_LOGOUT_TIME);
    };
    
    // Check initial online status
    if (!navigator.onLine) {
      handleOffline();
    }
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      if (offlineTimer) {
        clearTimeout(offlineTimer);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/tenant/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(data);
      // No need to set formData as fields are read-only
      if (data.profilePicture) {
        if (data.profilePicture.startsWith('data:') || data.profilePicture.startsWith('http')) {
          setProfilePicturePreview(data.profilePicture);
        } else {
          setProfilePicturePreview(`${BASE_URL}/${data.profilePicture}`);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  // Removed handleInputChange - fields are now read-only

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!profilePicture) {
      alert('Please select a photo first');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Only append profile picture
      formDataToSend.append('profilePicture', profilePicture);

      const response = await fetch(`${BASE_URL}/api/tenant/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
            setProfilePicturePreview(`${BASE_URL}/${data.user.profilePicture}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static transform transition-transform duration-300 ease-in-out z-50 h-full top-0 left-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={(section) => {
            setActiveSection(section);
            setIsMobileMenuOpen(false);
          }}
          userData={userData}
          profilePicturePreview={profilePicturePreview}
          handleProfilePictureChange={handleProfilePictureChange}
          handleSavePhoto={handleSavePhoto}
          saving={saving}
          profilePicture={profilePicture}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white shadow-md p-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Tenant Portal
          </h1>
        </div>
        <div className="p-4 lg:p-8">
          {activeSection === 'profile' && (
            <Profile
              userData={userData}
            />
          )}
          {activeSection === 'details' && (
            <Details
              userData={userData}
            />
          )}
          {activeSection === 'payment' && <Payment />}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
