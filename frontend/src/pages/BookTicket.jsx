import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDownload,
  FiX,
  FiCheck,
  FiArrowLeft,
} from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';
import { formatDate } from '../utils/dateFormat';
import { generateEventPass } from '../utils/generatePass';

function BookTicket() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, checkRes] = await Promise.all([
          API.get(`/events/${eventId}`),
          API.get(`/tickets/check/${eventId}`),
        ]);
        setEvent(eventRes.data);
        setConfirmedCount(eventRes.data.bookedCount || 0);
        if (checkRes.data.hasTicket) {
          setAlreadyBooked(true);
          setTicket(checkRes.data.ticket);
        }
      } catch {
        toast.error('Failed to load event details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const res = await API.post(`/tickets/book/${eventId}`);
      setTicket(res.data);
      setBooked(true);
      toast.success('Ticket booked! Downloading your pass...');
      await generateEventPass(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleDownloadAgain = async () => {
    if (!ticket) return;
    try {
      const fullTicket = {
        ...ticket,
        user: { name: user.name, email: user.email, phoneNumber: user.phoneNumber },
        event,
      };
      await generateEventPass(fullTicket);
      toast.success('Pass downloaded!');
    } catch {
      toast.error('Failed to generate pass');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <Spinner />
    </div>
  );

  if (!event) return null;

  const imageUrl = event.image ? `http://localhost:5000${event.image}` : null;
  const remaining = event.capacity - (confirmedCount || 0);
  const isFull = remaining <= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-10 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-purple-600 transition mb-6"
        >
          <FiArrowLeft /> Back to Event
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* Event poster */}
          {imageUrl ? (
            <img src={imageUrl} alt={event.title} className="w-full h-52 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <span className="text-5xl">📅</span>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Category badge */}
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              {event.category}
            </span>

            {/* Event title */}
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-3 mb-2">
              {event.title}
            </h1>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              {event.description}
            </p>

            {/* Details */}
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-2">
                <FiCalendar className="text-purple-400" />
                {formatDate(event.date)} at{' '}
                {new Date(event.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-2">
                <FiMapPin className="text-purple-400" /> {event.location}
              </span>
              <span className="flex items-center gap-2">
                <FiUsers className="text-purple-400" />
                {isFull ? (
                  <span className="text-red-500 font-semibold">No seats available</span>
                ) : (
                  <span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {remaining}
                    </span>{' '}
                    seat{remaining !== 1 ? 's' : ''} remaining out of {event.capacity}
                  </span>
                )}
              </span>
            </div>

            {/* Capacity bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isFull ? 'bg-red-500' : remaining < event.capacity * 0.25 ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(((event.capacity - remaining) / event.capacity) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {Math.round(((event.capacity - remaining) / event.capacity) * 100)}% filled
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800 mb-6" />

            {/* States */}
            {booked || alreadyBooked ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck size={30} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {booked ? 'Booking Confirmed!' : 'Already Booked'}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {booked
                    ? 'Your event pass has been downloaded automatically.'
                    : 'You already have a ticket for this event.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleDownloadAgain}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition"
                  >
                    <FiDownload size={15} /> Download Pass
                  </button>
                  <button
                    onClick={() => navigate('/my-tickets')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    View My Tickets
                  </button>
                </div>
              </div>
            ) : isFull ? (
              <div className="text-center">
                <p className="text-red-500 font-semibold mb-4">
                  🔴 This event is full. No seats available.
                </p>
                <button
                  onClick={() => navigate(`/events/${eventId}`)}
                  className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 transition"
                >
                  Back to Event
                </button>
              </div>
            ) : (
              <>
                {/* Confirmation message */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium text-center">
                    🎟️ Do you want to reserve your seat for this event?
                  </p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 text-center mt-1">
                    A PDF event pass will be downloaded automatically after booking.
                  </p>
                </div>

                {/* Booking info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Booking for:</p>
                  <p>👤 {user?.name}</p>
                  <p>✉️ {user?.email}</p>
                  {user?.phoneNumber && <p>📞 {user?.phoneNumber}</p>}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                  >
                    {booking ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <FiCheck size={16} /> Book Ticket
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/events/${eventId}`)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    <FiX size={16} /> Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BookTicket;