import { Outlet } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import CartDrawer from "../common/CartDrawer";
import VoiceQuickAdd from "../common/VoiceQuickAdd";
import { useUiStore } from "../../store/uiStore";

export default function AppShell() {
  const { isDarkMode, sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div
      className={`app-shell bg-[var(--bg-app)] text-[var(--text-primary)] ${isDarkMode ? "dark" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="app-layout mx-auto flex max-w-[1920px] items-start">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none"
        >
          <Outlet />
        </main>

        <div className="cart-rail hidden 2xl:block w-[340px] shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-card)]">
          <CartDrawer isOpen={true} isDesktop={true} onClose={() => {}} />
        </div>
      </div>

      <Footer />
      <MobileNav />
      <VoiceQuickAdd />
    </div>
  );
}
