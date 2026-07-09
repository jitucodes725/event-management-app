import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiUsers, FiCalendar, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import API from '../api/axios';
import Spinner from '../components/Spinner';

const COLORS = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#6b7280'];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-extrabold">{value}</p>
      </div>
    </motion.div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Spinner /></div>;

  const userGrowthData = stats.userGrowth.map(d => ({
    name: months[d._id.month - 1],
    Users: d.count,
  }));

  const eventGrowthData = stats.eventGrowth.map(d => ({
    name: months[d._id.month - 1],
    Events: d.count,
  }));

  const categoryData = stats.categoryStats.map(d => ({
    name: d._id,
    value: d.count,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of EventHub</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/events" className="px-4 py-2 rounded-xl bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition">Manage Events</Link>
            <Link to="/admin/users" className="px-4 py-2 rounded-xl bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition">Manage Users</Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<FiUsers className="text-white" size={22} />} label="Total Users" value={stats.totalUsers} color="bg-purple-600" />
          <StatCard icon={<FiCalendar className="text-white" size={22} />} label="Total Events" value={stats.totalEvents} color="bg-pink-500" />
          <StatCard icon={<FiClock className="text-white" size={22} />} label="Pending" value={stats.pendingEvents} color="bg-yellow-500" />
          <StatCard icon={<FiCheckCircle className="text-white" size={22} />} label="Approved" value={stats.approvedEvents} color="bg-emerald-500" />
          <StatCard icon={<FiXCircle className="text-white" size={22} />} label="Rejected" value={stats.rejectedEvents} color="bg-red-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">User Growth (6 months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={userGrowthData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: 12 }} />
                <Bar dataKey="Users" fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Event Growth (6 months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={eventGrowthData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: 12 }} />
                <Bar dataKey="Events" fill="#ec4899" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold mb-4">Events by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;