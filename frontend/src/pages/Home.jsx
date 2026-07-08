import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMusic, FiMonitor, FiActivity } from 'react-icons/fi';

const features = [
  { icon: <FiMusic size={28} />, title: 'Music & Arts', desc: 'Discover concerts, galleries, and live performances near you.' },
  { icon: <FiMonitor size={28} />, title: 'Tech & Business', desc: 'Attend workshops, hackathons, and networking events.' },
  { icon: <FiActivity size={28} />, title: 'Sports & Fitness', desc: 'Join marathons, tournaments, and fitness meetups.' },
];

function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-32 text-center">
        {/* Background blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Your events, your world
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Plan & Discover<br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            Create, manage, and discover events all in one place. Connect with people who share your interests.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3.5 rounded-2xl text-base font-semibold hover:opacity-90 transition shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
            >
              Browse Events <FiArrowRight />
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-3.5 rounded-2xl text-base font-semibold hover:border-purple-400 transition"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;