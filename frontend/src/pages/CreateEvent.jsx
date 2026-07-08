import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useToast from '../hooks/useToast';
import Spinner from '../components/Spinner';
import MapPicker from '../components/MapPicker';

function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', category: 'Other',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.date) e.date = 'Date is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    return e;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleMapSelect = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) return setErrors(v);
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
    } bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Create Event</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Fill in the details for your event</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input name="title" placeholder="Event Title" onChange={handleChange} className={inputClass('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <textarea name="description" placeholder="Description" rows={3} onChange={handleChange} className={inputClass('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div>
            <input type="date" name="date" onChange={handleChange} className={inputClass('date')} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <input name="location" value={formData.location} placeholder="Location (or click map)" onChange={handleChange} className={inputClass('location')} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <MapPicker onLocationSelect={handleMapSelect} />

          <select name="category" onChange={handleChange} className={inputClass('category')}>
            {['Music','Tech','Sports','Business','Art','Other'].map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Image upload with preview */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Event Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-300 file:font-medium hover:file:bg-purple-100 transition" />
            {preview && (
              <img src={preview} alt="preview" className="mt-3 w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" /> : 'Create Event'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateEvent;