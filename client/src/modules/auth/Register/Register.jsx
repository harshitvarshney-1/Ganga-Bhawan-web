import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { registerTenantAPI } from '../../../infra/auth/auth.api';
import { uploadToCloudinaryDirect } from '../../../infra/cloudinary';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import Loader from '../../../shared/components/atoms/Loader/Loader';
import LogoIcon from "../../../shared/components/atoms/Logo";

export default function Register() {
  const navigate = useNavigate();
  const authState = useAtomValue(authAtom);
  const userState = useAtomValue(userAtom);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', mobileNumber: '',
    fatherName: '', fatherPhone: '', motherName: '', motherPhone: '',
    dateOfBirth: '', gender: '', permanentAddress: '', aadhaarNumber: '',
  });

  const [files, setFiles] = useState({ aadhaarFront: null, aadhaarBack: null, profilePicture: null });
  const [uploadStatus, setUploadStatus] = useState({ aadhaarFront: null, aadhaarBack: null, profilePicture: null });
  const [uploadedUrls, setUploadedUrls] = useState({ aadhaarFront: null, aadhaarBack: null, profilePicture: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = "1995-01-01";

  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      navigate(userState.role === 'admin' ? '/admin-dashboard' : '/tenant-dashboard', { replace: true });
    }
  }, [navigate, authState, userState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['mobileNumber', 'fatherPhone', 'motherPhone', 'aadhaarNumber'];
    setFormData({ ...formData, [name]: numericFields.includes(name) ? value.replace(/\D/g, '') : value });
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

    const folderMap = { aadhaarFront: 'aadhaar_cards', aadhaarBack: 'aadhaar_cards', profilePicture: 'profile_photos' };

    try {
      const url = await uploadToCloudinaryDirect(file, folderMap[name]);
      setUploadedUrls(prev => ({ ...prev, [name]: url }));
      setUploadStatus(prev => ({ ...prev, [name]: 'done' }));
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, [name]: 'error' }));
      setError(`Failed to upload ${name === 'profilePicture' ? 'profile photo' : 'Aadhaar photo'}. Please try again.`);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'uploading') return <span className="text-amber-500 text-[11px] ml-1.5 font-medium">⏳ Uploading...</span>;
    if (status === 'done') return <span className="text-emerald-500 text-[11px] ml-1.5 font-medium">✅ Uploaded</span>;
    if (status === 'error') return <span className="text-destructive text-[11px] ml-1.5 font-medium">❌ Failed</span>;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) { setError('Please enter a valid email address.'); setLoading(false); return; }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const ageLimit = new Date(); ageLimit.setFullYear(ageLimit.getFullYear() - 18);
      if (dob > ageLimit) { setError('Tenant must be at least 18 years old.'); setLoading(false); return; }
      if (dob < new Date(minDate)) { setError('Date of Birth cannot be earlier than 1995.'); setLoading(false); return; }
    }

    if (!uploadedUrls.aadhaarFront || !uploadedUrls.aadhaarBack || !uploadedUrls.profilePicture) {
      setError('Please wait for all documents to finish uploading.'); setLoading(false); return;
    }
    if (uploadStatus.aadhaarFront === 'error' || uploadStatus.aadhaarBack === 'error' || uploadStatus.profilePicture === 'error') {
      setError('Some documents failed to upload. Please re-select the failed files.'); setLoading(false); return;
    }

    try {
      const result = await registerTenantAPI({
        ...formData,
        aadhaarFrontUrl: uploadedUrls.aadhaarFront,
        aadhaarBackUrl: uploadedUrls.aadhaarBack,
        profilePictureUrl: uploadedUrls.profilePicture,
      });
      alert(result.message);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-background text-foreground px-3 py-2 rounded-md border border-border focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-[13px] placeholder:text-muted-foreground";
  const labelClass = "block text-[13px] font-medium text-foreground mb-1.5";

  return (
    <>
      {loading && <Loader text="REGISTERING" />}
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 shadow-lg text-primary"><LogoIcon size={40} /></div>
            <h1 className="text-lg font-semibold text-foreground">Ganga Bhawan</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Create your tenant account</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-[15px] font-semibold text-foreground mb-5">Tenant Registration</h2>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-[13px] p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-2 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="w-20 h-20 rounded-xl bg-accent mb-3 flex items-center justify-center overflow-hidden border border-border">
                  {files.profilePicture ? (
                    <img src={URL.createObjectURL(files.profilePicture)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-muted-foreground">👤</span>
                  )}
                </div>
                <label className={`${labelClass} text-center`}>
                  Profile Photo (Required)
                  {getStatusBadge(uploadStatus.profilePicture)}
                </label>
                <input
                  type="file" name="profilePicture" onChange={handleFileChange} accept="image/*" required
                  className="w-full max-w-xs text-[12px] text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              {/* Full Name */}
              <div><label className={labelClass}>Full Name (as per ID)</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass} placeholder="Enter your full name" /></div>

              {/* Email */}
              <div><label className={labelClass}>Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="your@email.com" /></div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className={`${inputClass} pr-10`} placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition text-sm">
                    {showPassword ? '🔒' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div><label className={labelClass}>Mobile Number</label><input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required pattern="[0-9]{10}" className={inputClass} placeholder="10-digit number" /></div>

              {/* Father & Mother */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Father's Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required className={inputClass} placeholder="Father's name" /></div>
                <div><label className={labelClass}>Father's Phone</label><input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} pattern="[0-9]{10}" className={inputClass} placeholder="10-digit number" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Mother's Name</label><input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className={inputClass} placeholder="Mother's name" /></div>
                <div><label className={labelClass}>Mother's Phone</label><input type="tel" name="motherPhone" value={formData.motherPhone} onChange={handleChange} pattern="[0-9]{10}" className={inputClass} placeholder="10-digit number" /></div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required min={minDate} max={eighteenYearsAgo} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required className={inputClass}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div><label className={labelClass}>Permanent Address</label><textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} required rows="3" className={inputClass} placeholder="Enter your complete address" /></div>

              {/* Aadhaar Number */}
              <div><label className={labelClass}>Aadhaar Card Number</label><input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required pattern="[0-9]{12}" className={inputClass} placeholder="12-digit Aadhaar number" /></div>

              {/* Aadhaar Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Aadhaar Front{getStatusBadge(uploadStatus.aadhaarFront)}</label>
                  <input type="file" name="aadhaarFront" onChange={handleFileChange} accept="image/*" required className={inputClass} />
                  <p className="text-muted-foreground text-[11px] mt-1">Upload JPG or PNG photo.</p>
                </div>
                <div>
                  <label className={labelClass}>Aadhaar Back{getStatusBadge(uploadStatus.aadhaarBack)}</label>
                  <input type="file" name="aadhaarBack" onChange={handleFileChange} accept="image/*" required className={inputClass} />
                  <p className="text-muted-foreground text-[11px] mt-1">Upload JPG or PNG photo.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadStatus.aadhaarFront === 'uploading' || uploadStatus.aadhaarBack === 'uploading' || uploadStatus.profilePicture === 'uploading'}
                className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-[13px] mt-1"
              >
                {loading ? 'Registering...' :
                 (uploadStatus.aadhaarFront === 'uploading' || uploadStatus.aadhaarBack === 'uploading' || uploadStatus.profilePicture === 'uploading')
                  ? 'Uploading Documents...' : 'Register Now'}
              </button>
            </form>

            <p className="text-[12px] text-muted-foreground text-center mt-4">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
