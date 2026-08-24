import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { logout, fetchCurrentUser } from './store/authSlice';
import AppLoader from './components/AppLoader';
import { ShaderBackground } from '@/components/ui/shader-foda-rosa';

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
      <div className="relative min-h-screen">
        <ShaderBackground className="fixed inset-0 -z-50 opacity-20 pointer-events-none" />
        <AppLoader />
        <AppRouter />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
