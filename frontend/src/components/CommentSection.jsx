import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiSend, FiMessageCircle } from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import Spinner from './Spinner';

function CommentSection({ eventId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${eventId}`);
      setComments(res.data);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/comments/${eventId}`, { text });
      setComments([res.data, ...comments]);
      setText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FiMessageCircle className="text-purple-500" size={20} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3 items-start">
            {/* Avatar */}
            {user.profilePic ? (
              <img
                src={`http://localhost:5000${user.profilePic}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-800 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{text.length}/500</span>
                <button
                  type="submit"
                  disabled={submitting || !text.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  <FiSend size={14} />
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 italic">
          Please <a href="/login" className="text-purple-500 hover:underline">log in</a> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <Spinner size="sm" />
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <FiMessageCircle size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-4">
            {comments.map((comment) => {
              const isOwner = user && comment.user._id === user._id;
              const isAdmin = user?.isAdmin;
              const picUrl = comment.user?.profilePic
                ? `http://localhost:5000${comment.user.profilePic}`
                : null;

              return (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  {/* Avatar */}
                  {picUrl ? (
                    <img
                      src={picUrl}
                      alt={comment.user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-purple-100 dark:border-purple-900 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {comment.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition flex-shrink-0"
                          title="Delete comment"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                      {comment.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default CommentSection;