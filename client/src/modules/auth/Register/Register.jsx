import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { registerTenantAPI } from '../../../infra/auth/auth.api';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import Loader from '../../../shared/components/atoms/Loader/Loader';

export default function Register() {
  const navigate = useNavigate();
  const authState = useAtomValue(authAtom);
  const userState = useAtomValue(userAtom);
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
    aadhaarFront: null,
    aadhaarBack: null,
    profilePicture: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Calculate DOB constraints
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = "1995-01-01";
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      if (userState.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/tenant-dashboard', { replace: true });
      }
    }
  }, [navigate, authState, userState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric only validation for specific fields
    const numericFields = ['mobileNumber', 'fatherPhone', 'motherPhone', 'aadhaarNumber'];
    if (numericFields.includes(name)) {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      setFormData({
        ...formData,
        [name]: numericValue,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const { name } = e.target;

    if (file) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedImageTypes.includes(file.type)) {
        setError(`Only JPG and PNG images are allowed for ${name === 'profilePicture' ? 'profile photo' : 'Aadhaar photos'}.`);
        e.target.value = ''; // Reset file input
        return;
      }
    }

    setError('');
    setFiles({
      ...files,
      [name]: file,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Email Validation Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // DOB Validation (18 years check)
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const ageLimit = new Date();
      ageLimit.setFullYear(ageLimit.getFullYear() - 18);
      
      if (dob > ageLimit) {
        setError('Tenant must be at least 18 years old.');
        setLoading(false);
        return;
      }
      
      if (dob < new Date(minDate)) {
        setError('Date of Birth cannot be earlier than 1995.');
        setLoading(false);
        return;
      }
    }

    try {
      // Create FormData object
      const data = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Append files
      if (files.aadhaarFront) {
        data.append('aadhaarFront', files.aadhaarFront);
      }
      if (files.aadhaarBack) {
        data.append('aadhaarBack', files.aadhaarBack);
      }
      if (files.profilePicture) {
        data.append('profilePicture', files.profilePicture);
      }

      // Call API
      const result = await registerTenantAPI(data);
      
      alert(result.message);
      navigate('/login', { replace: true });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {loading && <Loader text="REGISTERING" />}
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
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8 p-4 bg-gray-700/30 rounded-2xl border border-gray-600">
            <div className="w-24 h-24 rounded-full bg-gray-600 mb-3 flex items-center justify-center overflow-hidden border-2 border-cyan-400/30">
              {files.profilePicture ? (
                <img src={URL.createObjectURL(files.profilePicture)} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-gray-400">👤</span>
              )}
            </div>
            <label className="block text-gray-300 mb-2 font-bold text-sm">Profile Photo (Required)</label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              accept="image/*"
              required
              className="w-full max-w-xs text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-400/10 file:text-cyan-400 hover:file:bg-cyan-400/20 transition-all"
            />
          </div>

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-12"
                placeholder="Create a strong password"
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
                min={minDate}
                max={eighteenYearsAgo}
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

          {/* Aadhaar Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Aadhaar Front Photo</label>
              <input
                type="file"
                name="aadhaarFront"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <p className="text-gray-400 text-xs mt-1">Upload JPG or PNG photo.</p>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Aadhaar Back Photo</label>
              <input
                type="file"
                name="aadhaarBack"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <p className="text-gray-400 text-xs mt-1">Upload JPG or PNG photo.</p>
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
    </>
  );
}