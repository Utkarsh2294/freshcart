import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import CategoryChips from '../components/common/CategoryChips';
import ProductCard from '../components/common/ProductCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import * as categoryService from '../services/categoryService';
import { useProductStore } from '../store/productStore';

export default function SearchCategory() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const [categories, setCategories] = useState([]);
  const { products, isLoading, setFilters } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => {
    setFilters({ query, category, sort });
  }, [query, category, sort, setFilters]);

  useEffect(() => {
    categoryService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const activeCategory = useMemo(() => {
    return categories.find(item => String(item.id) === String(category));
  }, [categories, category]);

  const heading = query
    ? `Search results for "${query}"`
    : activeCategory
      ? activeCategory.name
      : 'All Products';

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="hidden w-full space-y-6 md:block md:w-64">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h2 className="mb-4 border-b border-[var(--border-default)] pb-4 text-lg font-bold tracking-normal text-[var(--text-primary)]">
            Filters
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-normal text-[var(--text-primary)]">Price Range</h3>
              <input type="range" className="w-full accent-[#8B5CF6]" aria-label="Price range" />
              <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Rs 0</span>
                <span>Rs 10,000+</span>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-normal text-[var(--text-primary)]">Popular Brands</h3>
              <div className="space-y-3">
                {['Amul', 'Nestle', 'Britannia', 'Haldiram'].map(brand => (
                  <label key={brand} className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" className="rounded border-[var(--border-default)] bg-transparent text-[#8B5CF6] focus:ring-[#8B5CF6]" />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {categories.length > 0 && (
          <CategoryChips categories={categories.filter(item => !item.parent_id)} activeCategory={category} />
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-normal text-[var(--text-primary)]">{heading}</h1>
          <select
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              params.set('sort', e.target.value);
              navigate(`/search?${params.toString()}`);
            }}
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="deals">Highest Discount</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <SkeletonLoader key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)]">
              <Search className="h-8 w-8 text-[var(--text-secondary)]" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-normal text-[var(--text-primary)]">No products found</h2>
            <p className="text-[var(--text-secondary)]">Try another search or choose a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
