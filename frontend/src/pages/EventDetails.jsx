import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [interested, setInterested] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true); // ← ADD

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data);
        setCount(res.data.interestedUsers.length);
        if (user) {
          // ✅ FIX: compare string versions of both IDs
          setInterested(
            res.data.interestedUsers.some(
              (uid) => uid.toString() === user._id.toString()
            )
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // ← ADD
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await API.delete(`/events/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleInterest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await API.put(`/events/${id}/interest`);
      setInterested(res.data.isInterested);
      setCount(res.data.interestedCount);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (!event) return <p className="p-8">Event not found.</p>;

  const imageUrl = event.image
    ? `http://localhost:5000${event.image}`
    : 'https://via.placeholder.com/800x300?text=No+Image';

  // ✅ FIX: toString() on both sides so MongoDB ObjectId vs string always matches
  const isOwner = user && event.createdBy._id.toString() === user._id.toString();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <img src={imageUrl} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{event.category}</span>
      <h1 className="text-3xl font-bold mt-2">{event.title}</h1>
      <p className="text-gray-600 mt-2">{event.description}</p>
      <p className="text-gray-500 mt-4">📅 {new Date(event.date).toLocaleDateString()}</p>
      <p className="text-gray-500">📍 {event.location}</p>
      <p className="text-gray-500">👤 Organized by {event.createdBy.name}</p>

      <button
        onClick={handleInterest}
        className={`mt-4 px-4 py-2 rounded text-white ${
          interested ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {interested ? '✓ Interested' : 'Mark Interested'} ({count})
      </button>

      {isOwner && (
        <div className="mt-6 flex gap-4">
          <Link
            to={`/edit-event/${event._id}`}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default EventDetails;