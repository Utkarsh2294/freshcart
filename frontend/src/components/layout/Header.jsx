import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ChevronDown,
  MapPin,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  User,
  Wallet,
} from "lucide-react";
import SearchBar from "../common/SearchBar";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";
import { useAuth } from "../../hooks/useAuth";

export default function Header({ onMenuClick }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { isDarkMode, toggleTheme } = useUiStore();
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border-default)] bg-[var(--bg-nav)] backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex items-center gap-4 lg:w-64">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 -ml-2 transition-colors hover:bg-[var(--bg-surface)] lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            to="/"
            className="hidden text-xl font-bold tracking-normal text-[var(--text-primary)] lg:block"
          >
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
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-[var(--bg-surface)]"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-[var(--text-secondary)]" />
            ) : (
              <Moon className="h-5 w-5 text-[var(--text-secondary)]" />
            )}
          </button>
          <Link
            to="/cart"
            className="relative rounded-full p-2 transition-colors hover:bg-[var(--bg-surface)] lg:hidden"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 inline-flex min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="relative hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-surface)]"
              title="Account menu"
            >
              <User className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-xl">
                <div className="border-b border-[var(--border-default)] p-4">
                  <p className="font-bold text-[var(--text-primary)]">
                    {user?.name || "Guest shopper"}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    No login required
                  </p>
                </div>
                <Link
                  onClick={() => setIsUserMenuOpen(false)}
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                >
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <Link
                  onClick={() => setIsUserMenuOpen(false)}
                  to="/wallet"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                >
                  <Wallet className="h-4 w-4" /> Wallet
                </Link>
                <Link
                  onClick={() => setIsUserMenuOpen(false)}
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                >
                  <Settings className="h-4 w-4" /> Notifications
                </Link>
                {user?.role === "admin" && (
                  <Link
                    onClick={() => setIsUserMenuOpen(false)}
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  >
                    <Settings className="h-4 w-4" /> Admin
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
