import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut, FiPlusCircle, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `transition-colors font-medium text-sm ${
      isActive(path)
        ? 'text-purple-600 dark:text-purple-400'
        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
    }`;

  const profilePicUrl = user?.profilePic
    ? `http://localhost:5000${user.profilePic}`
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            EventHub
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <span className="flex items-center gap-1"><FiCalendar size={14} /> Events</span>
          </Link>
          {user && (
            <>
              <Link to="/my-events" className={linkClass('/my-events')}>My Events</Link>
              <Link to="/profile" className={linkClass('/profile')}>
                <span className="flex items-center gap-1"><FiUser size={14} /> Profile</span>
              </Link>
              <Link
                to="/create-event"
                className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                <FiPlusCircle size={15} /> Create
              </Link>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className={linkClass('/login')}>Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">
                Register
              </Link>
            </>
          )}
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Avatar */}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition"
              title="Logout"
            >
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-purple-300" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <FiLogOut size={16} />
            </button>
          )}
        </div>

        {/* Mobile: dark toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pb-4 flex flex-col gap-3"
          >
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700 dark:text-gray-300 font-medium">Events</Link>
            {user ? (
              <>
                <Link to="/my-events" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700 dark:text-gray-300 font-medium">My Events</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700 dark:text-gray-300 font-medium">Profile</Link>
                <Link to="/create-event" onClick={() => setMenuOpen(false)} className="py-2 text-purple-600 font-semibold">+ Create Event</Link>
                <button onClick={handleLogout} className="py-2 text-red-500 text-left font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-gray-700 dark:text-gray-300 font-medium">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 text-purple-600 font-semibold">Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;