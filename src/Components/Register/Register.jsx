import { useState, useEffect } from 'react';
import { registerTenant } from "../../services/api.js";
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    dateOfBirth: '',
    gender: '',
    permanentAddress: '',
    aadhaarNumber: '',
  });
  
  const [files, setFiles] = useState({
    aadhaarDocument: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to home if user presses back button or if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If already logged in, redirect to appropriate dashboard
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/tenant-dashboard', { replace: true });
      }
    }

    // Handle browser back button - replace current history entry
    const handlePopState = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    
    // Replace current history entry so back button goes to home
    window.history.replaceState(null, '', '/');
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation
    if (!files.aadhaarDocument) {
      setError('Please upload your Aadhaar document');
      setLoading(false);
      return;
    }

    try {
      // Create FormData object
      const data = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Append files
      if (files.aadhaarDocument) {
        data.append('aadhaarDocument', files.aadhaarDocument);
      }

      // Call API
      const result = await registerTenant(data);
      
      alert(result.message);
      navigate('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">
          Tenant Registration Form
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-300 mb-2">Full Name (as per ID)</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="your@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Create a strong password"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-300 mb-2">Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="10-digit number"
            />
          </div>

          {/* Father's Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Father's name"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Father's Phone No.</label>
              <input
                type="tel"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="10-digit number"
              />
            </div>
          </div>

          {/* Mother's Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Mother's Name</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Mother's name"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Mother's Phone No.</label>
              <input
                type="tel"
                name="motherPhone"
                value={formData.motherPhone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="10-digit number"
              />
            </div>
          </div>

          {/* DOB and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <label className="block text-gray-300 mb-2">Permanent Address</label>
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              required
              rows="3"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your complete address"
            />
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="block text-gray-300 mb-2">Aadhaar Card Number</label>
            <input
              type="text"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{12}"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="12-digit Aadhaar number"
            />
          </div>

          {/* Aadhaar Upload */}
          <div>
            <label className="block text-gray-300 mb-2">Upload Aadhaar Document (PDF or Photo)</label>
            <div className="flex gap-4">
              <input
                type="file"
                name="aadhaarDocument"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                required
                className="hidden"
                id="aadhaarDocument"
              />
              <label
                htmlFor="aadhaarDocument"
                className="flex-1 bg-cyan-600 text-white px-4 py-3 rounded hover:bg-cyan-500 transition cursor-pointer text-center font-semibold"
              >
                📎 Choose File
              </label>
              {files.aadhaarDocument && (
                <span className="flex-1 bg-gray-700 text-white px-4 py-3 rounded text-center truncate">
                  {files.aadhaarDocument.name}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 text-gray-900 font-bold py-3 rounded hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-cyan-400 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}