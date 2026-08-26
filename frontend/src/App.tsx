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
      <div className="relative min-h-screen" style={{ background: '#08080f' }}>
        {/* Shader as foreground visual layer — visible through glass surfaces */}
        <ShaderBackground className="fixed inset-0 z-0 pointer-events-none opacity-85" />
        {/* Global Readability Veil */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-background/40 backdrop-blur-[2px]" />
        {/* All content sits above the shader */}
        <div className="relative z-10">
          <AppLoader />
          <AppRouter />
          <Toaster />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
