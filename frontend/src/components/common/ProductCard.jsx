import { useState } from "react";
import { Link } from "react-router";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import ProductImage from "./ProductImage";
import { useUiStore } from "../../store/uiStore";
import { formatPrice } from "../../utils/formatters";

export default function ProductCard({ product }) {
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const productId = product.id ?? product._id;
  const cartItem = items.find(
    (item) => String(item.productId) === String(productId),
  );
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (qty === 0) {
        await addItem(productId, 1, "manual");
      } else {
        await updateItem(cartItem._id, qty + 1);
      }
    } catch (error) {
      useUiStore.getState().addToast({
        type: "error",
        message:
          error.response?.data?.error ||
          "Could not update your cart. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    if (qty === 0 || isLoading) return;
    setIsLoading(true);
    try {
      if (qty === 1) {
        await removeItem(cartItem._id);
      } else {
        await updateItem(cartItem._id, qty - 1);
      }
    } catch (error) {
      useUiStore.getState().addToast({
        type: "error",
        message:
          error.response?.data?.error ||
          "Could not update your cart. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="product-card flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-sm">
      <Link
        to={`/product/${productId}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square bg-[var(--bg-surface)] p-4"
      >
        <ProductImage
          product={product}
          className="h-full w-full rounded-xl object-contain"
        />
        {product.discount > 0 && (
          <div className="absolute left-3 top-3 rounded-md bg-[#22C55E] px-2 py-1 text-xs font-bold text-white">
            {product.discount}% OFF
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <span className="mb-1 text-xs text-[var(--text-secondary)]">
          {product.brand || product.category}
        </span>
        <h3 className="mb-1 line-clamp-2 min-h-[40px] break-words text-sm font-semibold tracking-normal text-[var(--text-primary)]">
          <Link to={`/product/${productId}`} title={product.name}>
            {product.name}
          </Link>
        </h3>
        <span className="mb-3 text-xs text-[var(--text-secondary)]">
          {product.unit}
        </span>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2">
          <div className="money flex min-w-0 flex-col">
            <span className="font-bold text-[var(--text-primary)]">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-[var(--text-secondary)] line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>

          {qty > 0 ? (
            <div className="grid min-h-11 grid-cols-[40px_minmax(24px,auto)_40px] items-center rounded-lg border border-[#C4B5FD] bg-[#F5F3FF] text-[#6366F1] dark:border-[#4C1D95] dark:bg-[#312E81]/30 dark:text-[#C4B5FD]">
              <button
                disabled={isLoading}
                onClick={handleRemove}
                aria-label={`Remove one ${product.name}`}
                className="flex h-full items-center justify-center rounded-l-lg disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-center text-sm font-bold">{qty}</span>
              <button
                disabled={isLoading || qty >= product.stockQty || qty >= 50}
                onClick={handleAdd}
                aria-label={`Add one ${product.name}`}
                className="flex h-full items-center justify-center rounded-r-lg disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              disabled={isLoading || !product.inStock}
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              className="press-feedback min-h-11 rounded-lg border border-[#C4B5FD] bg-[#F5F3FF] px-4 text-sm font-bold text-[#6366F1] hover:bg-[#EDE9FE] disabled:opacity-50 dark:border-[#4C1D95] dark:bg-[#312E81]/30 dark:text-[#C4B5FD] dark:hover:bg-[#312E81]/50"
            >
              {product.inStock ? (isLoading ? "Adding…" : "Add") : "Sold out"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
