import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';

function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      if (!res.data.isAdmin) {
        toast.error('Access denied. Admin only.');
        return;
      }
      login(res.data);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-800"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <FiShield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Admin Login</h2>
          <p className="text-gray-400 text-sm mt-1">EventHub Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" /> : 'Sign In as Admin'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminLogin;