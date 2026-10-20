import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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

export default function Header({ onMenuClick, sidebarOpen }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { isDarkMode, toggleTheme } = useUiStore();
  const { user } = useAuth();
  const accountRef = useRef(null);
  useEffect(() => {
    const dismiss = (event) => {
      if (!accountRef.current?.contains(event.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <header className="app-header fixed inset-x-0 top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-nav)] backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-wrap items-center justify-between gap-[8px] px-[12px] py-2 sm:flex-nowrap sm:py-0 lg:px-8">
        <div className="flex shrink-0 items-center gap-[4px]">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            className="icon-button -ml-2 hover:bg-[var(--bg-surface)] lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            to="/"
            className="text-[20px] font-bold tracking-normal text-[var(--text-primary)]"
          >
            Freshcart
          </Link>
        </div>

        <div className="order-last flex min-w-0 w-full flex-none items-center justify-center gap-4 sm:order-none sm:w-auto sm:flex-1 sm:px-4">
          <SearchBar />

          <Link
            to="/checkout"
            className="hidden shrink-0 items-center gap-2 rounded-xl p-2 xl:flex"
          >
            <MapPin className="h-5 w-5 text-[#8B5CF6]" />
            <div className="flex flex-col text-xs">
              <span className="text-[var(--text-secondary)]">Deliver to</span>
              <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                Choose at checkout <ChevronDown className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1 lg:gap-3">
          <button
            onClick={toggleTheme}
            aria-label={
              isDarkMode ? "Switch to light theme" : "Switch to dark theme"
            }
            className="icon-button hover:bg-[var(--bg-surface)]"
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
            aria-label={`Cart, ${cartCount} items`}
            className="icon-button relative hover:bg-[var(--bg-surface)]"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 inline-flex min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <div
            ref={accountRef}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsUserMenuOpen(false);
                accountRef.current?.querySelector("button")?.focus();
              }
            }}
            className="relative hidden items-center gap-3 lg:flex"
          >
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-surface)]"
              title="Account menu"
              aria-label="Shopping account links"
              aria-expanded={isUserMenuOpen}
              aria-controls="account-links"
            >
              <User className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
            {isUserMenuOpen && (
              <div
                id="account-links"
                className="account-popover absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-xl"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setIsUserMenuOpen(false);
                }}
              >
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
