import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiMail, FiUser } from 'react-icons/fi';
import API from '../api/axios';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their events?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Manage Users</h1>
            <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
          </div>
          <Link to="/admin/dashboard" className="px-4 py-2 rounded-xl bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition">← Dashboard</Link>
        </div>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
        />

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No users found</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((user, i) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-center gap-4"
              >
                {user.profilePic ? (
                  <img src={`http://localhost:5000${user.profilePic}`} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1"><FiMail size={12} /> {user.email}</p>
                  {user.bio && <p className="text-gray-500 text-xs mt-0.5 truncate">{user.bio}</p>}
                </div>

                <div className="text-gray-500 text-xs text-right hidden md:block">
                  <p>Joined</p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-900/40 text-red-300 border border-red-700 text-sm hover:bg-red-900/70 transition flex-shrink-0"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;