import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import API from '../api/axios';
import Spinner from '../components/Spinner';
import useToast from '../hooks/useToast';

const localizer = momentLocalizer(moment);

const CATEGORY_COLORS = {
  Music: '#ec4899',
  Tech: '#3b82f6',
  Sports: '#10b981',
  Business: '#f59e0b',
  Art: '#8b5cf6',
  Other: '#6b7280',
};

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    API.get('/events/all')
      .then((res) => {
        const mapped = res.data.map((ev) => ({
          id: ev._id,
          title: ev.title,
          start: new Date(ev.date),
          end: new Date(ev.date),
          category: ev.category,
          allDay: true,
        }));
        setEvents(mapped);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: CATEGORY_COLORS[event.category] || '#6b7280',
      borderRadius: '8px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      padding: '2px 6px',
    },
  });

  const handleSelectEvent = (event) => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Event Calendar</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Browse events by date</p>
          </div>

          {/* Category legend */}
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cat}</span>
              </div>
            ))}
          </div>

          {loading ? <Spinner /> : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 md:p-6 calendar-wrapper">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                popup
                views={['month', 'week', 'day', 'agenda']}
                view={view}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                onView={(newView) => setView(newView)}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Override react-big-calendar styles for dark mode */}
      <style>{`
        .calendar-wrapper .rbc-calendar {
          background: transparent;
          color: inherit;
        }
        .calendar-wrapper .rbc-header {
          padding: 8px;
          font-weight: 600;
          font-size: 13px;
          border-color: #e5e7eb;
        }
        .dark .calendar-wrapper .rbc-header {
          border-color: #374151;
          color: #d1d5db;
        }
        .dark .calendar-wrapper .rbc-month-view,
        .dark .calendar-wrapper .rbc-time-view,
        .dark .calendar-wrapper .rbc-agenda-view {
          border-color: #374151;
        }
        .dark .calendar-wrapper .rbc-day-bg {
          border-color: #374151;
        }
        .dark .calendar-wrapper .rbc-off-range-bg {
          background: #111827;
        }
        .dark .calendar-wrapper .rbc-today {
          background: #4c1d95;
        }
        .dark .calendar-wrapper .rbc-toolbar button {
          color: #d1d5db;
          border-color: #374151;
        }
        .dark .calendar-wrapper .rbc-toolbar button:hover {
          background: #374151;
        }
        .dark .calendar-wrapper .rbc-toolbar button.rbc-active {
          background: #7c3aed;
          border-color: #7c3aed;
          color: white;
        }
        .dark .calendar-wrapper .rbc-date-cell {
          color: #9ca3af;
        }
        .dark .calendar-wrapper .rbc-agenda-date-cell,
        .dark .calendar-wrapper .rbc-agenda-time-cell,
        .dark .calendar-wrapper .rbc-agenda-event-cell {
          color: #d1d5db;
          border-color: #374151;
        }
        .calendar-wrapper .rbc-today {
          background: #f3e8ff;
        }
        .calendar-wrapper .rbc-toolbar button.rbc-active {
          background: #7c3aed;
          border-color: #7c3aed;
          color: white;
        }
        .calendar-wrapper .rbc-event:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}

export default CalendarView;