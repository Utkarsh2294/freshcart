import { Link } from 'react-router';
import { Grid, Home, Package, Smartphone, Sparkles, Wallet, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/search', icon: Grid },
    { name: 'Cook with AI', path: '/cook-this', icon: Sparkles },
    { name: 'Orders', path: '/orders', icon: Package },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[var(--border-default)] bg-[var(--bg-card)] pt-16 transition-transform duration-300 ease-in-out lg:static lg:block lg:w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <span className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-xl font-bold text-transparent">Menu</span>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--bg-surface)]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => onClose()}
                className="flex items-center rounded-xl px-4 py-3 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-8 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-card)]">
                  <Smartphone className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <p className="text-sm font-medium leading-tight text-[var(--text-primary)]">
                  Get the app for faster delivery and better offers
                </p>
              </div>
              <button className="w-full rounded-lg bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Install App
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
