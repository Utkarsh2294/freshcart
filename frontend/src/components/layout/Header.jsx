import { Link } from 'react-router-dom';
import { ChevronDown, MapPin, Menu, Moon, ShoppingCart, Sun, User } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';

export default function Header({ onMenuClick }) {
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { isDarkMode, toggleTheme } = useUiStore();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border-default)] bg-[var(--bg-nav)] backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex items-center gap-4 lg:w-64">
          <button onClick={onMenuClick} className="rounded-lg p-2 -ml-2 transition-colors hover:bg-[var(--bg-surface)] lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="hidden text-xl font-bold tracking-normal text-[var(--text-primary)] lg:block">
            Freshcart
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center gap-4 px-1 sm:px-4">
          <SearchBar />

          <div className="hidden items-center gap-2 rounded-xl p-2 transition-colors hover:bg-[var(--bg-surface)] xl:flex">
            <MapPin className="h-5 w-5 text-[#8B5CF6]" />
            <div className="flex flex-col text-xs">
              <span className="text-[var(--text-secondary)]">Deliver to</span>
              <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                Home - 17, Green Park <ChevronDown className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 lg:w-64 lg:gap-4">
          <button onClick={toggleTheme} className="rounded-full p-2 transition-colors hover:bg-[var(--bg-surface)]" title="Toggle theme">
            {isDarkMode ? <Sun className="h-5 w-5 text-[var(--text-secondary)]" /> : <Moon className="h-5 w-5 text-[var(--text-secondary)]" />}
          </button>
          <Link to="/cart" className="relative rounded-full p-2 transition-colors hover:bg-[var(--bg-surface)] lg:hidden">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 inline-flex min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-surface)]">
              <User className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
