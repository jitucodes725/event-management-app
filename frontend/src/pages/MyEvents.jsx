import { useEffect, useState } from 'react';
import API from '../api/axios';
import EventCard from '../components/EventCard';

function MyEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await API.get('/events/my-events');
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyEvents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">You haven't created any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyEvents;