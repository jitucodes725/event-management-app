import { Link } from 'react-router-dom';

function EventCard({ event }) {
  const imageUrl = event.image
    ? `http://localhost:5000${event.image}`
    : 'https://via.placeholder.com/400x200?text=No+Image';

  return (
    <Link to={`/events/${event._id}`} className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden block">
      <img src={imageUrl} alt={event.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{event.category}</span>
        <h3 className="text-xl font-semibold mt-2">{event.title}</h3>
        <p className="text-gray-600 mt-1 line-clamp-2">{event.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          📅 {new Date(event.date).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">📍 {event.location}</p>
      </div>
    </Link>
  );
}

export default EventCard;