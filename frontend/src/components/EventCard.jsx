import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiHeart } from 'react-icons/fi';
import { formatDateShort, isUpcoming } from '../utils/dateFormat.js';

const CATEGORY_COLORS = {
  Music: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Sports: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Business: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Art: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function EventCard({ event }) {
  const imageUrl = event.image
    ? `http://localhost:5000${event.image}`
    : null;

  const upcoming = isUpcoming(event.date);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/events/${event._id}`}
        className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        {/* Image or Placeholder */}
        {imageUrl ? (
          <img src={imageUrl} alt={event.title} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">📅</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">No image available</span>
          </div>
        )}

        <div className="p-4">
          {/* Category + Upcoming badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other}`}>
              {event.category}
            </span>
            {upcoming && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Upcoming
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {event.description}
          </p>

          {/* Date + Location + Interested */}
          <div className="flex flex-col gap-1 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <FiCalendar size={12} /> {formatDateShort(event.date)}
            </span>
            <span className="flex items-center gap-1">
              <FiMapPin size={12} /> {event.location}
            </span>
          </div>

          {/* Interested count */}
          {event.bookedCount > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-purple-500 dark:text-purple-400 font-medium">
              <FiHeart size={12} />
              {event.bookedCount} reserved
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default EventCard;