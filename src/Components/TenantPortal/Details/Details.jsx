import React from 'react';
import { BASE_URL } from '../../../services/api';

const Details = ({ userData, formData, editing, setEditing, handleInputChange, handleSave, saving }) => {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Personal Details
        </h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Details
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Family Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
            {editing ? (
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{userData?.fatherName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Phone</label>
            <p className="text-lg font-medium text-gray-500">{userData?.fatherPhone || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">This field cannot be edited</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label>
            {editing ? (
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{userData?.motherName || 'N/A'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Phone</label>
            <p className="text-lg font-medium text-gray-500">{userData?.motherPhone || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">This field cannot be edited</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData?.aadhaarFile && (
            <a
              href={userData.aadhaarFile.startsWith('data:') ? userData.aadhaarFile : `${BASE_URL}/${userData.aadhaarFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 hover:from-blue-100 hover:to-cyan-100 transition-all shadow-md w-full"
            >
              <div className="bg-blue-500 rounded-lg p-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Aadhaar Card (Image/PDF)</p>
                <p className="text-sm text-gray-500">View Document</p>
              </div>
              <svg className="w-5 h-5 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}

        </div>
      </div>
    </div>
  );
};

export default Details;

