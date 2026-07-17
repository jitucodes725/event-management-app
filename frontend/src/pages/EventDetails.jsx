import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiExternalLink,
  FiTag,
} from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate, isUpcoming } from '../utils/dateFormat';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';
import CommentSection from '../components/CommentSection';
import CapacityBar from '../components/CapacityBar';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [count, setCount] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);

  const getCoords = (locationStr) => {
    const parts = locationStr?.split(',').map(Number);
    if (parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts;
    return null;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const promises = [API.get(`/events/${id}`)];
        if (user) promises.push(API.get(`/tickets/check/${id}`));
        const results = await Promise.all(promises);

        const eventData = results[0].data;
        setEvent(eventData);
        setCount(eventData.bookedCount || 0);
        setIsFull((eventData.bookedCount || 0) >= eventData.capacity);

        if (user) {
          if (results[1]) setHasTicket(results[1].data.hasTicket);
        }
      } catch {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user, toast]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete event');
    }
  };


  if (loading) return <Spinner />;
  if (!event) return <p className="p-8 text-gray-500">Event not found.</p>;

  const imageUrl = event.image ? `http://localhost:5000${event.image}` : null;
  const isOwner = user && event.createdBy._id.toString() === user._id.toString();
  const coords = getCoords(event.location);

  const googleMapsUrl = coords
    ? `https://www.google.com/maps?q=${coords[0]},${coords[1]}`
    : `https://www.google.com/maps?q=${encodeURIComponent(event.location)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-purple-600 transition mb-6"
        >
          <FiArrowLeft /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* Image */}
          {imageUrl ? (
            <img src={imageUrl} alt={event.title} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex flex-col items-center justify-center">
              <span className="text-5xl mb-2">📅</span>
              <span className="text-xs text-gray-400">No image available</span>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {event.category}
              </span>
              {isUpcoming(event.date) && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Upcoming
                </span>
              )}
              {isFull && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  🔴 Full
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
              {event.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {event.description}
            </p>

            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-2">
                <FiCalendar className="text-purple-400" /> {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-2">
                <FiMapPin className="text-purple-400" /> {event.location}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-purple-500 hover:text-purple-700 flex items-center gap-0.5 text-xs"
                >
                  <FiExternalLink size={11} /> Google Maps
                </a>
              </span>
              <span className="flex items-center gap-2">
                <FiUser className="text-purple-400" /> Organized by{' '}
                <strong className="text-gray-700 dark:text-gray-200">
                  {event.createdBy.name}
                </strong>
              </span>
            </div>

            {/* Capacity Bar */}
            <CapacityBar capacity={event.capacity} interestedCount={count} />

            {/* Map */}
            {coords && (
              <div className="rounded-xl overflow-hidden mt-4 mb-4 border border-gray-200 dark:border-gray-700">
                <MapContainer
                  center={coords}
                  zoom={13}
                  style={{ height: '200px', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={coords} />
                </MapContainer>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              {/* Book Ticket button — show if approved and not owner */}
              {event.status === 'approved' && !isOwner && (
                <Link
                  to={`/book-ticket/${event._id}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
                    hasTicket
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                      : isFull
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed pointer-events-none'
                      : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow'
                  }`}
                >
                  <FiTag size={15} />
                  {isFull ? 'Event Full' : hasTicket ? 'View Ticket' : 'Book Ticket'}
                </Link>
              )}

              {/* Owner actions */}
              {isOwner && (
                <>
                  <Link
                    to={`/edit-event/${event._id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 transition"
                  >
                    <FiEdit2 /> Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </>
              )}
            </div>

            {/* Divider */}
            <hr className="my-8 border-gray-100 dark:border-gray-800" />

            {/* Comment Section */}
            <CommentSection eventId={id} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EventDetails;