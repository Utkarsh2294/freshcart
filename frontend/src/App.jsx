import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './router';
import Toast from './components/common/Toast';
import NotificationPrompt from './components/common/NotificationPrompt';
import { useSocket } from './hooks/useSocket';
import { useUiStore } from './store/uiStore';

export default function App() {
  const isDarkMode = useUiStore(state => state.isDarkMode);
  
  // Initialize socket connection if authenticated
  useSocket();

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <>
      <RouterProvider router={router} />
      <Toast />
      <NotificationPrompt />
    </>
  );
}
