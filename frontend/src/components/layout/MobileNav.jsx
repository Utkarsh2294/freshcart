import { Link, useLocation } from 'react-router';
import { Home, Search, ShoppingBag, Sparkles, User } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Cook', path: '/cook-this', icon: Sparkles },
    { name: 'Cart', path: '/cart', icon: ShoppingBag },
    { name: 'Profile', path: '/orders', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--bg-card)] border-t border-[var(--border-default)] z-50 flex justify-around items-center px-2 pb-safe">
      {tabs.map((tab) => {
        const isActive = path === tab.path || (tab.path !== '/' && path.startsWith(tab.path));
        return (
          <Link
            key={tab.name}
            to={tab.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? 'text-[#6366F1]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
