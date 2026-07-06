import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Event Management App</h1>
      <p className="text-gray-600 mb-6">Plan, manage, and discover events easily.</p>
      <div className="space-x-4">
        <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded">Browse Events</Link>
        <Link to="/register" className="bg-green-600 text-white px-6 py-2 rounded">Get Started</Link>
      </div>
    </div>
  );
}

export default Home;