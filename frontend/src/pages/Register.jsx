import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) return setErrors(v);
    setLoading(true);
    try {
      const res = await API.post('/auth/register', formData);
      login(res.data);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
    } bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-800"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Create account</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Join EventHub today — it's free</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className={inputClass('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} className={inputClass('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <input type="password" name="password" placeholder="Password (min 6 characters)" onChange={handleChange} className={inputClass('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;