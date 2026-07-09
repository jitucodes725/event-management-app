import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiTrash2, FiFilter } from 'react-icons/fi';
import API from '../api/axios';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';
import { formatDateShort } from '../utils/dateFormat';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  approved: 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  rejected: 'bg-red-900/40 text-red-300 border-red-700',
};

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/events?status=${filter}`);
      setEvents(res.data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/events/${id}/approve`);
      toast.success('Event approved!');
      fetchEvents();
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/admin/events/${id}/reject`);
      toast.success('Event rejected');
      fetchEvents();
    } catch { toast.error('Failed to reject'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this event?')) return;
    try {
      await API.delete(`/admin/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Manage Events</h1>
            <p className="text-gray-400 text-sm mt-1">Approve, reject, or delete events</p>
          </div>
          <Link to="/admin/dashboard" className="px-4 py-2 rounded-xl bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition">← Dashboard</Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${filter === s ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : events.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No events found for "{filter}"</div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((ev, i) => (
              <motion.div
                key={ev._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* Image */}
                {ev.image ? (
                  <img src={`http://localhost:5000${ev.image}`} alt={ev.title} className="w-full md:w-24 h-20 object-cover rounded-xl" />
                ) : (
                  <div className="w-full md:w-24 h-20 bg-gray-800 rounded-xl flex items-center justify-center text-3xl">📅</div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{ev.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-base truncate">{ev.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">by {ev.createdBy?.name} • {formatDateShort(ev.date)} • {ev.location}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ev.status !== 'approved' && (
                    <button onClick={() => handleApprove(ev._id)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-900/40 text-emerald-300 border border-emerald-700 text-sm hover:bg-emerald-900/70 transition">
                      <FiCheck size={14} /> Approve
                    </button>
                  )}
                  {ev.status !== 'rejected' && (
                    <button onClick={() => handleReject(ev._id)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-yellow-900/40 text-yellow-300 border border-yellow-700 text-sm hover:bg-yellow-900/70 transition">
                      <FiX size={14} /> Reject
                    </button>
                  )}
                  <button onClick={() => handleDelete(ev._id)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-900/40 text-red-300 border border-red-700 text-sm hover:bg-red-900/70 transition">
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEvents;