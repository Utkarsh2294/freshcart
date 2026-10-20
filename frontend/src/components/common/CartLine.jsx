import { Minus, Plus, RefreshCw, Trash2 } from "lucide-react";
import ProductImage from "./ProductImage";
import { formatPrice } from "../../utils/formatters";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";

export default function CartLine({ item, onSwap }) {
  const { updateItem, removeItem, pendingItems } = useCartStore();
  const busy = pendingItems.includes(String(item._id));
  const product = item.product || {};
  const change = async (quantity) => {
    try {
      if (quantity === 0) await removeItem(item._id);
      else await updateItem(item._id, quantity);
    } catch (error) {
      useUiStore.getState().addToast({
        type: "error",
        message:
          error.response?.data?.error ||
          "Could not update this item. Try again.",
      });
    }
  };
  return (
    <article
      className="flex gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3"
      aria-busy={busy}
    >
      <ProductImage
        product={product}
        className="h-14 w-14 shrink-0 rounded-xl bg-[var(--bg-surface)] object-contain sm:h-16 sm:w-16"
      />
      <div className="min-w-0 flex-1">
        <h3 className="content-wrap text-sm font-semibold" title={product.name}>
          {product.name || "Product"}
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">{product.unit}</p>
        {item.source === "ai_recipe" && (
          <p className="mt-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
            From your recipe
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="money text-sm font-bold">
            {formatPrice(item.price)}
          </span>
          <div className="flex items-center rounded-xl border border-[var(--border-default)]">
            <button
              className="icon-button"
              disabled={busy}
              onClick={() => change(item.quantity - 1)}
              aria-label={`Remove one ${product.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
              className="icon-button"
              disabled={
                busy || item.quantity >= Math.min(product.stockQty ?? 50, 50)
              }
              onClick={() => change(item.quantity + 1)}
              aria-label={`Add one ${product.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[var(--text-secondary)]"
            disabled={busy}
            onClick={() => onSwap(item)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Swap brand
          </button>
          <button
            className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-300"
            disabled={busy}
            onClick={() => change(0)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </article>
  );
}
