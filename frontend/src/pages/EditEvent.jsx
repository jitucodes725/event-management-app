import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', category: 'Other', capacity: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    API.get(`/events/${id}`).then((res) => {
      const ev = res.data;
      setFormData({
        title: ev.title,
        description: ev.description,
        date: ev.date.split('T')[0],
        location: ev.location,
        category: ev.category,
        capacity: ev.capacity?.toString() || '',
      });
      if (ev.image) setPreview(`http://localhost:5000${ev.image}`);
    }).finally(() => setFetching(false));
  }, [id]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.date) e.date = 'Date is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (!formData.capacity) e.capacity = 'Capacity is required';
    else if (Number(formData.capacity) < 1) e.capacity = 'Capacity must be at least 1';
    return e;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) return setErrors(v);
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, val]) => data.append(k, val));
      if (image) data.append('image', image);
      await API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event updated — pending re-approval');
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition`;

  if (fetching) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Edit Event</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Update your event details</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input name="title" value={formData.title} placeholder="Event Title" onChange={handleChange} className={inputClass('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <textarea name="description" value={formData.description} rows={3} onChange={handleChange} className={inputClass('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass('date')} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <input name="location" value={formData.location} placeholder="Location" onChange={handleChange} className={inputClass('location')} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          <div>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              placeholder="Max Capacity"
              min="1"
              onChange={handleChange}
              className={inputClass('capacity')}
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
          </div>
          <select name="category" value={formData.category} onChange={handleChange} className={inputClass('category')}>
            {['Music', 'Tech', 'Sports', 'Business', 'Art', 'Other'].map(c => <option key={c}>{c}</option>)}
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Change Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } }} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-300 file:font-medium" />
            {preview && <img src={preview} alt="preview" className="mt-3 w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60">
            {loading ? <Spinner size="sm" /> : 'Update Event'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default EditEvent;