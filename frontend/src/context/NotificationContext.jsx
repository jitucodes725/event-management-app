import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const VAPID_PUBLIC_KEY = 'BAy4bCTQ7Im-WGWuu4dZamGZZkdTAdDf-GjsvDHxWgSxK_a9Ux5LCQFAkCdi1LZtknwILkIbAzSjcGZc9-YLna4'; // paste your public key

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await API.post('/notifications/subscribe', { subscription: sub });
    }
  };

  useEffect(() => {
    if (user && permission === 'default') {
      // Auto-prompt after 3 seconds
      const t = setTimeout(requestPermission, 3000);
      return () => clearTimeout(t);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);