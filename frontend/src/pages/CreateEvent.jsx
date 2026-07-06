import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Other',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);

      await API.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Create Event</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input type="text" name="title" placeholder="Event Title" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <input type="date" name="date" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <select name="category" onChange={handleChange} className="w-full p-2 border rounded mb-4">
          <option value="Music">Music</option>
          <option value="Tech">Tech</option>
          <option value="Sports">Sports</option>
          <option value="Business">Business</option>
          <option value="Art">Art</option>
          <option value="Other">Other</option>
        </select>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full mb-4" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
      </form>
    </div>
  );
}

export default CreateEvent;