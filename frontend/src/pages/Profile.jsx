import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiLock, FiSave } from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';

function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profileData, setProfileData] = useState({ name: '', bio: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get('/auth/profile').then((res) => {
      setProfileData({ name: res.data.name, bio: res.data.bio || '' });
      if (res.data.profilePic) setPicPreview(`http://localhost:5000${res.data.profilePic}`);
    }).finally(() => setFetching(false));
  }, []);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) { setProfilePic(file); setPicPreview(URL.createObjectURL(file)); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const data = new FormData();
      data.append('name', profileData.name);
      data.append('bio', profileData.bio);
      if (profilePic) data.append('profilePic', profilePic);
      const res = await API.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoadingProfile(false);
    }
  };

  const validatePw = () => {
    const e = {};
    if (!passwordData.currentPassword) e.currentPassword = 'Required';
    if (!passwordData.newPassword) e.newPassword = 'Required';
    else if (passwordData.newPassword.length < 6) e.newPassword = 'Min 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const v = validatePw();
    if (Object.keys(v).length) return setPwErrors(v);
    setLoadingPw(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoadingPw(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${pwErrors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition`;

  if (fetching) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors px-4 py-10">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
        >
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Your Profile</h2>

          {/* Profile picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {picPreview ? (
                <img src={picPreview} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 dark:border-purple-800" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-200 dark:border-purple-800">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-purple-700 transition shadow">
                <FiCamera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click the camera to change photo</p>
          </div>

          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Short bio (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
            <p className="text-sm text-gray-400 dark:text-gray-500">Email: <span className="font-medium text-gray-600 dark:text-gray-300">{user?.email}</span></p>
            <button
              type="submit"
              disabled={loadingProfile}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              <FiSave /> {loadingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <FiLock className="text-purple-500" />
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <input type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputClass('currentPassword')} />
              {pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div>
              <input type="password" placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputClass('newPassword')} />
              {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <input type="password" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputClass('confirmPassword')} />
              {pwErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={loadingPw}
              className="flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-gray-700 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              <FiLock /> {loadingPw ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;