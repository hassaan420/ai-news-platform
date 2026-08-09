import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { logout, fetchCurrentUser } from './store/authSlice';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('unauthorized', handleUnauthorized);

    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }

    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
