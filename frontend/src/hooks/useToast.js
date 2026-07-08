import toast from 'react-hot-toast';

const useToast = () => {
  const success = (msg) => toast.success(msg, {
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    iconTheme: { primary: '#fff', secondary: '#10B981' },
  });

  const error = (msg) => toast.error(msg, {
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '12px 20px',
    },
    iconTheme: { primary: '#fff', secondary: '#EF4444' },
  });

  const info = (msg) => toast(msg, {
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '12px 20px',
    },
  });

  return { success, error, info };
};

export default useToast;