import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import API from '../api/axios';
import EventCard from '../components/EventCard';
import Spinner from '../components/Spinner';

const STATUS_INFO = {
  pending: { icon: <FiClock className="text-yellow-400" />, label: 'Pending approval', color: 'text-yellow-400' },
  approved: { icon: <FiCheckCircle className="text-emerald-400" />, label: 'Approved', color: 'text-emerald-400' },
  rejected: { icon: <FiXCircle className="text-red-400" />, label: 'Rejected by admin', color: 'text-red-400' },
};

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/events/my-events')
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Events</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Events you've created (including pending & rejected)</p>
        </div>
        <Link to="/create-event" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
          + Create New
        </Link>
      </div>

      {loading ? <Spinner /> : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🗂️</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No events yet</p>
          <Link to="/create-event" className="inline-block mt-4 text-purple-600 dark:text-purple-400 font-semibold hover:underline">
            Create your first event →
          </Link>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => {
            const statusInfo = STATUS_INFO[event.status];
            return (
              <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${statusInfo.color}`}>
                  {statusInfo.icon} {statusInfo.label}
                </div>
                <EventCard event={event} />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default MyEvents;