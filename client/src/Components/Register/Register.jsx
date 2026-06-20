import { useState, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import { API_URL } from '../../../infra/config';
import Loader from '../../../shared/components/atoms/Loader/Loader';
import { AlertCircle, X } from 'lucide-react';

/**
 * Upload a single file directly to Cloudinary (bypasses backend completely).
 * This avoids Vercel's 10-60s serverless function timeout.
 */
const uploadToCloudinaryDirect = async (file, folder, apiBaseUrl, onProgress) => {
  // Step 1 & 2: Parallelize signature request and image compression (saves 1-2s)
  const [signRes, compressedFile] = await Promise.all([
    axios.post(`${apiBaseUrl}/api/cloudinary/sign`, { 
      folder, 
      fileType: file.type 
    }),
    file.type.startsWith('image/') 
      ? imageCompression(file, { 
          maxSizeMB: 0.8, 
          maxWidthOrHeight: 1920, 
          useWebWorker: true,
          fileType: 'image/webp' // WebP is ~30% smaller
        })
      : Promise.resolve(file)
  ]);

  const { signature, timestamp, cloudName, apiKey, folder: signedFolder } = signRes.data;

  // Step 3: Upload directly to Cloudinary with progress tracking
  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', signedFolder);
  formData.append('resource_type', 'auto');

  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    formData,
    { 
      timeout: 300000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    }
  );

  return cloudRes.data.secure_url;
};

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

  const [uploadStatus, setUploadStatus] = useState({
    aadhaarFront: null,   // null | 'uploading' | 'done' | 'error'
    aadhaarBack: null,
    profilePicture: null,
  });

  const [uploadedUrls, setUploadedUrls] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    profilePicture: null,
  });

  const [uploadProgress, setUploadProgress] = useState({
    aadhaarFront: 0,
    aadhaarBack: 0,
    profilePicture: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = "1995-01-01";

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const errorRef = useRef(null);

  // Auto-scroll to error when it occurs
  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  // Redirect if already logged in
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      navigate(userState.role === 'admin' ? '/admin-dashboard' : '/tenant-dashboard', { replace: true });
    }
  }, [navigate, authState, userState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['mobileNumber', 'fatherPhone', 'motherPhone', 'aadhaarNumber'];
    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? value.replace(/\D/g, '') : value,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const { name } = e.target;
    if (!file) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedImageTypes.includes(file.type)) {
      setError(`Only JPG and PNG images are allowed.`);
      e.target.value = '';
      return;
    }

    setError('');
    setFiles(prev => ({ ...prev, [name]: file }));
    setUploadedUrls(prev => ({ ...prev, [name]: null }));
    setUploadStatus(prev => ({ ...prev, [name]: 'uploading' }));

    // Determine folder
    const folderMap = {
      aadhaarFront: 'aadhaar_cards',
      aadhaarBack: 'aadhaar_cards',
      profilePicture: 'profile_photos',
    };

    try {
      console.log(`[Upload] Uploading ${name} directly to Cloudinary...`);
      const url = await uploadToCloudinaryDirect(file, folderMap[name], apiBaseUrl, (progress) => {
        setUploadProgress(prev => ({ ...prev, [name]: progress }));
      });
      console.log(`[Upload] ✅ ${name} done: ${url}`);
      setUploadedUrls(prev => ({ ...prev, [name]: url }));
      setUploadStatus(prev => ({ ...prev, [name]: 'done' }));
    } catch (err) {
      console.error(`[Upload] ❌ ${name} failed:`, err.message);
      setUploadStatus(prev => ({ ...prev, [name]: 'error' }));
      setError(`Failed to upload ${name}. Please try selecting the file again.`);
    }
  };

  const handleRetryUpload = (name) => {
    // Reset and prompt user to reselect
    setUploadStatus(prev => ({ ...prev, [name]: null }));
    setUploadedUrls(prev => ({ ...prev, [name]: null }));
    document.getElementById(`file-${name}`).click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // DOB Validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const ageLimit = new Date();
      ageLimit.setFullYear(ageLimit.getFullYear() - 18);
      if (dob > ageLimit) { setError('Tenant must be at least 18 years old.'); return; }
      if (dob < new Date(minDate)) { setError('Date of Birth cannot be earlier than 1995.'); return; }
    }

    // Ensure all files are uploaded
    if (!uploadedUrls.aadhaarFront || !uploadedUrls.aadhaarBack || !uploadedUrls.profilePicture) {
      setError('Please wait for all documents to finish uploading before submitting.');
      return;
    }

    // Check for any upload errors
    if (uploadStatus.aadhaarFront === 'error' || uploadStatus.aadhaarBack === 'error' || uploadStatus.profilePicture === 'error') {
      setError('Some documents failed to upload. Please retry the failed ones before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Just send JSON — no file handling needed on backend!
      const response = await axios.post(`${apiBaseUrl}/api/auth/register`, {
        ...formData,
        aadhaarFrontUrl: uploadedUrls.aadhaarFront,
        aadhaarBackUrl: uploadedUrls.aadhaarBack,
        profilePictureUrl: uploadedUrls.profilePicture,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000, // 30 seconds is plenty — just saving to DB
      });

      alert(response.data.message);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, name) => {
    if (status === 'uploading') {
      const progress = uploadProgress[name] || 0;
      return (
        <span className="text-yellow-400 text-xs ml-2 inline-flex items-center gap-1">
          <span className="animate-pulse">⏳</span>
          {progress}%
        </span>
      );
    }
    if (status === 'done') return <span className="text-green-400 text-xs ml-2">✅ Uploaded</span>;
    if (status === 'error') return <span className="text-red-400 text-xs ml-2">❌ Failed</span>;
    return null;
  };

  return (
    <>
      {loading && <Loader text="REGISTERING" />}
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-background rounded-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">
          Tenant Registration Form
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div
              ref={errorRef}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-lg shadow-red-900/20"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-bold text-sm mb-1">Registration Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 transition-colors p-1"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8 p-4 bg-gray-700/30 rounded-2xl border border-gray-600">
            <div className="w-24 h-24 rounded-full bg-gray-600 mb-3 flex items-center justify-center overflow-hidden border-2 border-cyan-400/30">
              {files.profilePicture ? (
                <img src={URL.createObjectURL(files.profilePicture)} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-muted-foreground">👤</span>
              )}
            </div>
            <label className="block text-muted-foreground mb-2 font-bold text-sm">
              Profile Photo (Required)
              {getStatusIcon(uploadStatus.profilePicture, 'profilePicture')}
            </label>
            <input
              id="file-profilePicture"
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              accept="image/*"
              required
              className="w-full max-w-xs text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-400/10 file:text-cyan-400 hover:file:bg-cyan-400/20 transition-all"
            />
            {uploadStatus.profilePicture === 'error' && (
              <button type="button" onClick={() => handleRetryUpload('profilePicture')} className="text-cyan-400 text-xs mt-2 underline">
                Retry Upload
              </button>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-muted-foreground mb-2">Full Name (as per ID)</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
              className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your full name" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-muted-foreground mb-2">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="your@email.com" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-muted-foreground mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 pr-12"
                placeholder="Create a strong password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-400 transition">
                {showPassword ? <span title="Hide">🔒</span> : <span title="Show">👁️</span>}
              </button>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-muted-foreground mb-2">Mobile Number</label>
            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required pattern="[0-9]{10}"
              className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="10-digit number" />
          </div>

          {/* Father's Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-2">Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Father's name" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-2">Father's Phone No.</label>
              <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} pattern="[0-9]{10}"
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="10-digit number" />
            </div>
          </div>

          {/* Mother's Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-2">Mother's Name</label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange}
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Mother's name" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-2">Mother's Phone No.</label>
              <input type="tel" name="motherPhone" value={formData.motherPhone} onChange={handleChange} pattern="[0-9]{10}"
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="10-digit number" />
            </div>
          </div>

          {/* DOB and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-2">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required
                min={minDate} max={eighteenYearsAgo}
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <label className="block text-muted-foreground mb-2">Permanent Address</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} required rows="3"
              className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your complete address" />
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="block text-muted-foreground mb-2">Aadhaar Card Number</label>
            <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required pattern="[0-9]{12}"
              className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="12-digit Aadhaar number" />
          </div>

          {/* Aadhaar Upload Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-muted-foreground mb-2">
                Aadhaar Front Photo
                {getStatusIcon(uploadStatus.aadhaarFront, 'aadhaarFront')}
              </label>
              <input
                id="file-aadhaarFront"
                type="file"
                name="aadhaarFront"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {uploadStatus.aadhaarFront === 'error' && (
                <button type="button" onClick={() => handleRetryUpload('aadhaarFront')} className="text-cyan-400 text-xs mt-1 underline">
                  Retry Upload
                </button>
              )}
              <p className="text-muted-foreground text-xs mt-1">Upload JPG or PNG photo. Uploaded immediately on selection.</p>
            </div>
            <div>
              <label className="block text-muted-foreground mb-2">
                Aadhaar Back Photo
                {getStatusIcon(uploadStatus.aadhaarBack, 'aadhaarBack')}
              </label>
              <input
                id="file-aadhaarBack"
                type="file"
                name="aadhaarBack"
                onChange={handleFileChange}
                accept="image/*"
                required
                className="w-full bg-gray-700 text-foreground px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {uploadStatus.aadhaarBack === 'error' && (
                <button type="button" onClick={() => handleRetryUpload('aadhaarBack')} className="text-cyan-400 text-xs mt-1 underline">
                  Retry Upload
                </button>
              )}
              <p className="text-muted-foreground text-xs mt-1">Upload JPG or PNG photo. Uploaded immediately on selection.</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploadStatus.aadhaarFront === 'uploading' || uploadStatus.aadhaarBack === 'uploading' || uploadStatus.profilePicture === 'uploading'}
            className="w-full bg-cyan-400 text-foreground font-bold py-3 rounded hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 
             (uploadStatus.aadhaarFront === 'uploading' || uploadStatus.aadhaarBack === 'uploading' || uploadStatus.profilePicture === 'uploading')
              ? 'Uploading Documents...' : 'Register Now'}
          </button>
        </form>

        <p className="text-muted-foreground text-center mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-cyan-400 hover:underline">Login here</a>
        </p>
      </div>
    </div>
    </>
  );
}