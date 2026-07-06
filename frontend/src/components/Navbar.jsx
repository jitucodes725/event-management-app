import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">EventHub</Link>
      <div className="space-x-4">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Events</Link>
        {user ? (
          <>
            <Link to="/my-events" className="text-gray-700 hover:text-blue-600">My Events</Link>
            <Link to="/create-event" className="bg-green-600 text-white px-4 py-2 rounded">+ Create</Link>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;