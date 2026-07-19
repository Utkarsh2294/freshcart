import { Link } from 'react-router';
import { Apple, Cookie, CupSoda, Home, Milk, ShoppingBasket, Sparkles, Wheat } from 'lucide-react';

const iconMap = [
  { test: /fruit|vegetable|fresh/i, Icon: Apple, color: '#22C55E' },
  { test: /dairy|egg|milk|curd|cheese|butter/i, Icon: Milk, color: '#6366F1' },
  { test: /snack|branded|chips|biscuit|namkeen/i, Icon: Cookie, color: '#F97316' },
  { test: /beverage|drink|juice|coffee|tea|water/i, Icon: CupSoda, color: '#3B82F6' },
  { test: /staple|rice|atta|dal|oil|salt/i, Icon: Wheat, color: '#A16207' },
  { test: /personal|care|beauty/i, Icon: Sparkles, color: '#EC4899' },
  { test: /home|clean/i, Icon: Home, color: '#14B8A6' },
];

const getCategoryIcon = (name = '') => {
  return iconMap.find(item => item.test.test(name)) || { Icon: ShoppingBasket, color: '#8B5CF6' };
};

export default function CategoryChips({ categories = [], activeCategory = '' }) {
  if (!categories.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide">
      {categories.map((cat) => {
        const { Icon, color } = getCategoryIcon(cat.name);
        const isActive = String(activeCategory) === String(cat.id);
        const to = cat.id ? `/search?category=${cat.id}` : `/search?q=${encodeURIComponent(cat.name)}`;

        return (
          <Link
            key={cat.id || cat.name}
            to={to}
            className={`flex w-24 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-colors ${
              isActive
                ? 'border-[#C4B5FD] bg-[#F5F3FF] text-[#6366F1] dark:border-[#4C1D95] dark:bg-[#312E81]/30'
                : 'border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[#C4B5FD]'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <span className="line-clamp-2 min-h-[28px] text-center text-xs font-semibold leading-tight">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
