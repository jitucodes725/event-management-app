import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', category: 'Other',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        const ev = res.data;
        setFormData({
          title: ev.title,
          description: ev.description,
          date: ev.date.split('T')[0],
          location: ev.location,
          category: ev.category,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);

      await API.put(`/events/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Edit Event</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input type="text" name="title" value={formData.title} placeholder="Event Title" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <textarea name="description" value={formData.description} placeholder="Description" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <input type="text" name="location" value={formData.location} placeholder="Location" onChange={handleChange} className="w-full p-2 border rounded mb-4" required />
        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded mb-4">
          <option value="Music">Music</option>
          <option value="Tech">Tech</option>
          <option value="Sports">Sports</option>
          <option value="Business">Business</option>
          <option value="Art">Art</option>
          <option value="Other">Other</option>
        </select>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full mb-4" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Update Event</button>
      </form>
    </div>
  );
}

export default EditEvent;