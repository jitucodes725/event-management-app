import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';

function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({ email: '', phoneNumber: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const validate = () => {
    const e = {};
    if (loginMethod === 'email') {
      if (!formData.email) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    } else {
      if (!formData.phoneNumber) e.phoneNumber = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phoneNumber)) e.phoneNumber = 'Phone number must be exactly 10 digits';
    }
    if (!formData.password) e.password = 'Password is required';
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

    const payload = {
      password: formData.password,
      ...(loginMethod === 'email' ? { email: formData.email } : { phoneNumber: formData.phoneNumber }),
    };

    try {
      const res = await API.post('/auth/login', payload);
      login(res.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-800"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Sign in to your account</p>

        {/* Login Method Toggle */}
        <div className="flex gap-3 mb-6 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => { setLoginMethod('email'); setErrors({}); }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition ${
              loginMethod === 'email'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('phone'); setErrors({}); }}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition ${
              loginMethod === 'phone'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Phone Number
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {loginMethod === 'email' ? (
            <div>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          ) : (
            <div>
              <input type="text" name="phoneNumber" placeholder="Phone Number (10 digits)" value={formData.phoneNumber} onChange={handleChange} className={inputClass('phoneNumber')} />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
          )}
          
          <div>
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputClass('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Forgot password link */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;