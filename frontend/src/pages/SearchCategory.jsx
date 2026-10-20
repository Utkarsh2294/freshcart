import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import CategoryChips from "../components/common/CategoryChips";
import ProductCard from "../components/common/ProductCard";
import SkeletonLoader from "../components/common/SkeletonLoader";
import * as categoryService from "../services/categoryService";
import { useProductStore } from "../store/productStore";

export default function SearchCategory() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevance";
  const [categories, setCategories] = useState([]);
  const {
    products,
    isLoading,
    error,
    page,
    totalPages,
    total,
    fetchProducts,
    setFilters,
  } = useProductStore();
  const maxPrice = Number(searchParams.get("max_price") || 10000);
  const navigate = useNavigate();

  useEffect(() => {
    setFilters({ query, category, sort, maxPrice });
  }, [query, category, sort, maxPrice, setFilters]);

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const activeCategory = useMemo(() => {
    return categories.find((item) => String(item.id) === String(category));
  }, [categories, category]);

  const heading = query
    ? `Search results for "${query}"`
    : activeCategory
      ? activeCategory.name
      : "All Products";

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <aside className="w-full">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h2 className="mb-4 border-b border-[var(--border-default)] pb-4 text-lg font-bold tracking-normal text-[var(--text-primary)]">
            Filters
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-normal text-[var(--text-primary)]">
                Price Range
              </h3>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(event) => {
                  const params = new URLSearchParams(searchParams);
                  params.set("max_price", event.target.value);
                  navigate(`/search?${params}`);
                }}
                className="h-11 w-full accent-[#8B5CF6]"
                aria-label="Maximum product price"
                aria-valuetext={`Up to ${maxPrice} rupees`}
              />
              <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Rs 0</span>
                <span>Up to ₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {categories.length > 0 && (
          <CategoryChips
            categories={categories.filter((item) => !item.parent_id)}
            activeCategory={category}
          />
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="content-wrap min-w-0 text-2xl font-bold tracking-normal text-[var(--text-primary)]">
            {heading}
          </h1>
          <select
            value={sort}
            aria-label="Sort products"
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              params.set("sort", e.target.value);
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

        {error ? (
          <div role="alert" className="rounded-2xl border border-red-200 p-6">
            <p>{error}</p>
            <button
              className="mt-3 underline"
              onClick={() => fetchProducts(page)}
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div
            aria-label="Loading products"
            role="status"
            className="product-grid"
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)]">
              <Search className="h-8 w-8 text-[var(--text-secondary)]" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-normal text-[var(--text-primary)]">
              No products found
            </h2>
            <p className="text-[var(--text-secondary)]">
              Try another search or choose a different category.
            </p>
          </div>
        )}
        {!isLoading && !error && totalPages > 1 && (
          <nav
            aria-label="Catalog pages"
            className="mt-6 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              disabled={page <= 1}
              className="min-h-11 rounded-xl border px-4 disabled:opacity-40"
              onClick={() => fetchProducts(page - 1)}
            >
              Previous
            </button>
            <p role="status" className="text-sm text-[var(--text-secondary)]">
              Page {page} of {totalPages} · {total.toLocaleString("en-IN")}{" "}
              products
            </p>
            <button
              disabled={page >= totalPages}
              className="min-h-11 rounded-xl border px-4 disabled:opacity-40"
              onClick={() => fetchProducts(page + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
