import { NavLink } from "react-router";
import {
  Grid,
  Home,
  Package,
  Settings,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import Dialog from "../common/Dialog";

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Categories", path: "/search", icon: Grid },
    { name: "Cook with AI", path: "/cook-this", icon: Sparkles },
    { name: "Orders", path: "/orders", icon: Package },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Notifications", path: "/notifications", icon: Settings },
  ];

  const navigation = (
    <nav aria-label="Shop navigation" className="space-y-1 p-4">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === "/"}
          onClick={() => onClose()}
          className={({ isActive }) =>
            `flex min-h-12 items-center rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? "bg-[#6366F1]/10 text-[#6366F1] dark:text-[#C4B5FD]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"}`
          }
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="sticky top-20 hidden w-52 shrink-0 lg:block xl:w-56">
        {navigation}
        <p className="px-8 pt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          Everyday essentials.
          <br />A little help with dinner.
        </p>
      </aside>
      <Dialog
        open={isOpen}
        onClose={onClose}
        labelledBy="shop-menu-title"
        className="dialog-menu"
      >
        <div className="flex items-center justify-between p-4">
          <h2 id="shop-menu-title" className="text-xl font-bold">
            Freshcart
          </h2>
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navigation}
      </Dialog>
    </>
  );
}
