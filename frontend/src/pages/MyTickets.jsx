import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiMapPin, FiTag } from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';
import { formatDateShort } from '../utils/dateFormat';
import { generateEventPass } from '../utils/generatePass';

function MyTickets() {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    API.get('/tickets/my-tickets')
      .then((res) => setTickets(res.data))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (ticket) => {
    setDownloading(ticket._id);
    try {
      const fullTicket = {
        ...ticket,
        user: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
        },
      };
      await generateEventPass(fullTicket);
      toast.success('Pass downloaded!');
    } catch {
      toast.error('Failed to generate pass');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors px-4 md:px-8 py-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Tickets</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            All your booked event passes
          </p>
        </div>

        {loading ? (
          <Spinner />
        ) : tickets.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🎟️</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No tickets yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Browse events and book your first ticket!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tickets.map((ticket, i) => {
              const ev = ticket.event;
              const imageUrl = ev?.image ? `http://localhost:5000${ev.image}` : null;

              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  {/* Event image */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={ev?.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          ticket.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(ticket.bookingDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Event name */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-1">
                      {ev?.title || 'Event Unavailable'}
                    </h3>

                    {/* Details */}
                    <div className="flex flex-col gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={11} className="text-purple-400" />
                        {ev?.date ? formatDateShort(ev.date) : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin size={11} className="text-purple-400" />
                        {ev?.location || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiTag size={11} className="text-purple-400" />
                        Ticket ID: <span className="font-mono font-semibold text-gray-600 dark:text-gray-300 ml-1">{ticket.ticketId}</span>
                      </span>
                    </div>

                    {/* Download button */}
                    <button
                      onClick={() => handleDownload(ticket)}
                      disabled={downloading === ticket._id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      <FiDownload size={14} />
                      {downloading === ticket._id ? 'Generating...' : 'Download Pass'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default MyTickets;