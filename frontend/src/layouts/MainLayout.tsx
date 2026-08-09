import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="text-foreground font-sans text-body-md antialiased min-h-screen flex relative bg-background transition-colors duration-300">
      {/* SideNavBar (Desktop) */}
      <div className="z-10">
        <Sidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-[280px] min-w-0 z-10 relative">
        <Navbar />
        
        {/* Main Canvas */}
        <main className="flex-1 p-margin_mobile md:p-margin_desktop max-w-[1200px] mx-auto w-full">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
