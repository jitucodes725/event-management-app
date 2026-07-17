import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import API from '../api/axios';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-800"
      >
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
              If an account exists for <strong className="text-gray-700 dark:text-gray-300">{email}</strong>, a password reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline text-sm">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-1 text-sm text-gray-400 hover:text-purple-600 transition mb-6">
              <FiArrowLeft size={14} /> Back to Login
            </Link>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl flex items-center justify-center mb-4">
              <FiMail className="text-purple-600 dark:text-purple-400" size={22} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Forgot password?</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              No worries. Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default ForgotPassword;