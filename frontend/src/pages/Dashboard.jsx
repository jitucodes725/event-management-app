import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api/axios';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const welcomeShown = useRef(false);

  // Show welcome popup once per Dashboard load
  useEffect(() => {
    if (user && !welcomeShown.current) {
      welcomeShown.current = true;
      const greetings = [
        `👋 Welcome back, ${user.name}!`,
        `🎉 Welcome back, ${user.name}! Hope you're having a great day!`,
        `✨ Good to see you, ${user.name}!`,
      ];
      const message = greetings[Math.floor(Math.random() * greetings.length)];
      setTimeout(() => {
        toast(message, {
          duration: 3500,
          style: {
            background: 'linear-gradient(to right, #7c3aed, #ec4899)',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '16px',
            padding: '14px 20px',
            fontSize: '14px',
          },
          icon: null,
        });
      }, 400);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await API.get('/events', {
          params: { search, category, page: currentPage, limit: 6, sortBy },
        });
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timeout);
  }, [search, category, currentPage, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Discover Events
        </h1>
        {!loading && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {total} event{total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <SearchBar
        search={search}
        setSearch={(v) => { setSearch(v); setCurrentPage(1); }}
        category={category}
        setCategory={(v) => { setCategory(v); setCurrentPage(1); }}
        sortBy={sortBy}
        setSortBy={(v) => { setSortBy(v); setCurrentPage(1); }}
      />

      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No events found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((event, i) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
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