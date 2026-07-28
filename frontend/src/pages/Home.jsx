import { useEffect, useState } from 'react';
import { ArrowRight, Gift, ShoppingBag } from 'lucide-react';
import CategoryChips from '../components/common/CategoryChips';
import InstallBanner from '../components/common/InstallBanner';
import ProductCard from '../components/common/ProductCard';
import PramarshaBanner from '../components/common/PramarshaBanner';
import SkeletonLoader from '../components/common/SkeletonLoader';
import * as categoryService from '../services/categoryService';
import * as homeService from '../services/homeService';
import * as phase8Service from '../services/phase8Service';
import { useCartStore } from '../store/cartStore';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useUiStore } from '../store/uiStore';
import { featureFlags } from '../utils/featureFlags';

const fallbackCategories = [
  { name: 'Fruits & Vegetables' },
  { name: 'Dairy & Eggs' },
  { name: 'Snacks & Branded Foods' },
  { name: 'Beverages' },
  { name: 'Staples' },
  { name: 'Personal Care' },
  { name: 'Home Care' },
];

export default function Home() {
  const { products, isLoading, fetchProducts } = useProducts();
  const { fetchCart, addItem } = useCartStore();
  const { isAuthenticated } = useAuth();
  const { addToast } = useUiStore();
  const [categories, setCategories] = useState(fallbackCategories);
  const [pramarsha, setPramarsha] = useState(null);
  const [reorderRail, setReorderRail] = useState([]);
  const [isAddingPramarsha, setIsAddingPramarsha] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      homeService.getHomeRecommendations()
        .then(data => setPramarsha(data.recommendations?.[0] || null))
        .catch(() => setPramarsha(null));
      if (featureFlags.predictiveReorderFeed) {
        phase8Service.getPredictiveReorder()
          .then(data => setReorderRail(data.rail || []))
          .catch(() => setReorderRail([]));
      }
    } else {
      setPramarsha(null);
      setReorderRail([]);
    }
    fetchProducts();
  }, [fetchCart, fetchProducts, isAuthenticated]);

  const handleAddPramarsha = async () => {
    if (!pramarsha?.products?.length) return;

    setIsAddingPramarsha(true);
    try {
      for (const product of pramarsha.products) {
        await addItem(product.id, 1, 'suggestion');
      }
      addToast({ type: 'success', message: 'Pramarsha picks added to cart.' });
    } catch (err) {
      addToast({ type: 'error', message: 'Could not add all Pramarsha picks.' });
    } finally {
      setIsAddingPramarsha(false);
    }
  };

  const handleAddPramarshaProduct = async (product) => {
    try {
      await addItem(product.id, 1, 'suggestion');
      addToast({ type: 'success', message: `${product.name} added to cart.` });
    } catch {
      addToast({ type: 'error', message: 'Could not add this recommendation.' });
    }
  };

  const handleAddReorder = async () => {
    try {
      for (const product of reorderRail) {
        await addItem(product.id, 1, 'predictive_reorder');
      }
      addToast({ type: 'success', message: 'Reorder picks added to cart.' });
    } catch {
      addToast({ type: 'error', message: 'Could not add reorder picks.' });
    }
  };

  useEffect(() => {
    let ignore = false;

    categoryService.getCategories()
      .then((data) => {
        if (ignore) return;
        const parentCategories = data.filter(category => !category.parent_id);
        setCategories(parentCategories.length ? parentCategories : data);
      })
      .catch(() => setCategories(fallbackCategories));

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <InstallBanner />

      <section>
        <CategoryChips categories={categories} />
      </section>

      <PramarshaBanner
        recommendation={pramarsha}
        isAdding={isAddingPramarsha}
        onAddAll={handleAddPramarsha}
        onAddProduct={handleAddPramarshaProduct}
      />

      {featureFlags.predictiveReorderFeed && reorderRail.length > 0 && (
        <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-normal text-[var(--text-primary)]">You might need these</h2>
              <p className="text-xs text-[var(--text-secondary)]">Based on your order cadence, separate from Pramarsha.</p>
            </div>
            <button type="button" onClick={handleAddReorder} className="rounded-xl bg-[#14B8A6] px-4 py-2 text-sm font-bold text-white">
              Add all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {reorderRail.map(product => (
              <div key={product.id} className="min-w-[180px] rounded-xl bg-[var(--bg-surface)] p-3">
                <p className="line-clamp-2 text-sm font-bold text-[var(--text-primary)]">{product.name}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{product.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative flex h-[280px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#E0E7FF] to-[#EDE9FE] p-8 dark:from-[#181C26] dark:to-[#252A36] lg:col-span-2">
          <div className="z-10 flex max-w-md flex-col justify-center">
            <h1 className="mb-3 text-3xl font-bold tracking-normal text-[#111111] dark:text-white">
              Groceries in minutes
            </h1>
            <p className="mb-8 text-gray-600 dark:text-[#A3A3A3]">
              Fresh staples, snacks, dairy, and everyday essentials from your own catalog.
            </p>
            <a
              href="/search"
              className="flex w-max items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Shop now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="pointer-events-none absolute bottom-8 right-8 hidden h-36 w-36 items-center justify-center rounded-[32px] bg-white/60 text-[#8B5CF6] shadow-sm dark:bg-white/10 md:flex">
            <ShoppingBag className="h-20 w-20" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex-1 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-normal text-[var(--text-primary)]">Buy it again</h2>
              <a href="/orders" className="text-xs font-semibold text-[#8B5CF6]">View all</a>
            </div>
            <p className="mb-4 text-xs text-[var(--text-secondary)]">Quick picks from your past orders</p>
            <div className="flex gap-2">
              {products.slice(0, 3).map(product => (
                <div key={product.id} className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--bg-surface)]">
                  <ShoppingBag className="h-7 w-7 text-[#8B5CF6]" />
                </div>
              ))}
            </div>
          </div>

          <a
            href="/wallet"
            className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-sm transition-colors hover:border-[#C4B5FD]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDF2F8] text-[#EC4899] dark:bg-[#831843]/30">
              <Gift className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold tracking-normal text-[var(--text-primary)]">Get 10% off on your first 3 orders</h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Use code: <span className="font-mono text-[#EC4899]">HELLO10</span></p>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
          </a>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-normal text-[var(--text-primary)]">Best deals for you</h2>
          <a href="/search?sort=deals" className="text-sm font-semibold text-[#8B5CF6] hover:text-[#6366F1]">View all</a>
        </div>
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-[220px] min-w-[160px]" />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {products.slice(0, 10).map((product) => (
              <div key={product.id} className="min-w-[170px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
