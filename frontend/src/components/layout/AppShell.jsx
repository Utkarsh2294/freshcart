import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CartDrawer from '../common/CartDrawer';
import VoiceQuickAdd from '../common/VoiceQuickAdd';
import { useUiStore } from '../../store/uiStore';

export default function AppShell() {
  const { isDarkMode, sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div className={`min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] ${isDarkMode ? 'dark' : ''}`}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-16 pb-16 md:pb-0 min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>

        {/* Desktop Cart Right Sidebar Placeholder / Component */}
        <div className="hidden lg:block w-[340px] border-l border-[var(--border-default)] bg-[var(--bg-card)]">
           <CartDrawer isOpen={true} isDesktop={true} onClose={() => {}} />
        </div>
      </div>

      <Footer />
      <MobileNav />
      <VoiceQuickAdd />
    </div>
  );
}
