import { Loader2, RefreshCw, X } from "lucide-react";
import { formatPrice } from "../../utils/formatters";
import ProductImage from "./ProductImage";
import Dialog from "./Dialog";
import Rating from "./Rating";

function DeltaBadge({ value }) {
  const amount = Number(value || 0);
  const isCheaper = amount < 0;
  const isSame = amount === 0;

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold ${
        isSame
          ? "bg-[var(--bg-card)] text-[var(--text-secondary)]"
          : isCheaper
            ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
      }`}
    >
      {isSame
        ? "Same price"
        : `${isCheaper ? "-" : "+"}${formatPrice(Math.abs(amount))}`}
    </span>
  );
}

export default function SwapSheet({
  isOpen,
  currentItem,
  options = [],
  isLoading,
  isSwapping,
  error,
  onClose,
  onSelect,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      labelledBy="swap-title"
      className="dialog-sheet"
    >
      <header className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-[#14B8A6]">
            Brand Swap
          </p>
          <h2
            id="swap-title"
            className="text-lg font-bold text-[var(--text-primary)]"
          >
            Choose an alternative
          </h2>
        </div>
        <button
          onClick={onClose}
          className="icon-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
          aria-label="Close alternatives"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="max-h-[65dvh] overflow-y-auto overscroll-contain p-5">
        {currentItem && (
          <div className="mb-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 opacity-80">
            <div className="flex items-center gap-3">
              <ProductImage
                product={currentItem.product || currentItem}
                className="h-14 w-14 shrink-0 rounded-xl object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">
                  Current
                </p>
                <h3 className="line-clamp-1 text-sm font-bold text-[var(--text-primary)]">
                  {currentItem.product?.name || currentItem.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {currentItem.product?.brand || currentItem.brand} ·{" "}
                  {currentItem.product?.unit || currentItem.unit}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl bg-[var(--bg-surface)]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : options.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
            <p className="font-semibold text-[var(--text-primary)]">
              No in-stock swaps found
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              This category is too niche right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect(option)}
                disabled={isSwapping}
                className="flex w-full gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-left transition-colors hover:border-[#14B8A6] disabled:opacity-60"
              >
                <ProductImage
                  product={option}
                  className="h-16 w-16 shrink-0 rounded-xl object-contain"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold text-[var(--text-primary)]">
                        {option.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {option.brand} · {option.unit}
                      </p>
                    </div>
                    <DeltaBadge value={option.price_delta} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Rating value={Math.round(option.rating || 4)} />
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {formatPrice(option.price)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isSwapping && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-overlay)] text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </Dialog>
  );
}
