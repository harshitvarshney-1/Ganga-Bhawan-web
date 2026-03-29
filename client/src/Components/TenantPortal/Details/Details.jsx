import React from 'react';
import { BASE_URL } from '../../../services/api';

const Details = ({ userData }) => {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Personal Details
        </h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-semibold text-amber-700">Details Locked</span>
        </div>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Father's Name
            </label>
            <p className="text-lg font-medium text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">{userData?.fatherName}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Father's Phone
            </label>
            <p className="text-lg font-medium text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">{userData?.fatherPhone || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Mother's Name
            </label>
            <p className="text-lg font-medium text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">{userData?.motherName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Mother's Phone
            </label>
            <p className="text-lg font-medium text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">{userData?.motherPhone || 'N/A'}</p>
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
              href={`${BASE_URL}/api/admin/tenant-aadhaar/${userData._id}?token=${localStorage.getItem('token')}`}
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

