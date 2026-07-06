import { useEffect, useState } from 'react';
import API from '../api/axios';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // ← ADD THIS

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // ← ADD THIS
      try {
        const res = await API.get('/events', {
          params: { search, category, page: currentPage, limit: 6 },
        });
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // ← ADD THIS
      }
    };

    const timeout = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timeout);
  }, [search, category, currentPage]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Discover Events</h1>
      <SearchBar
        search={search}
        setSearch={(val) => { setSearch(val); setCurrentPage(1); }}
        category={category}
        setCategory={(val) => { setCategory(val); setCurrentPage(1); }}
      />

      {/* ↓ ADD THIS loading check */}
      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Dashboard;