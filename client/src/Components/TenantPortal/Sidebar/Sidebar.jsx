import React from 'react';

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  userData, 
  profilePicturePreview, 
  handleProfilePictureChange,
  handleSavePhoto,
  saving,
  profilePicture,
  handleLogout 
}) => {
  return (
    <div className="w-72 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 text-foreground h-full flex flex-col shadow-2xl">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-3xl font-bold border-4 border-cyan-300 shadow-lg">
                  {userData?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Always show camera icon for photo upload */}
              <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 rounded-full p-2 cursor-pointer shadow-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-xl font-semibold text-center">{userData?.fullName}</h2>
            <p className="text-sm text-muted-foreground text-center mt-1">{userData?.email}</p>
            <span className="mt-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
              {userData?.isApproved ? '✓ Approved' : '⏳ Pending'}
            </span>
            
            {/* Save Photo Button - shown when photo is selected */}
            {profilePicture && (
              <button
                onClick={handleSavePhoto}
                disabled={saving}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-foreground rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Photo
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
              activeSection === 'profile'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-slate-700 hover:text-foreground'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </div>
          </button>

          <button
            onClick={() => setActiveSection('details')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
              activeSection === 'details'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-slate-700 hover:text-foreground'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Details
            </div>
          </button>

          <button
            onClick={() => setActiveSection('payment')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
              activeSection === 'payment'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-slate-700 hover:text-foreground'
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment
            </div>
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-foreground px-4 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

