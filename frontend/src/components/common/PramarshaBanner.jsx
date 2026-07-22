import { ArrowRight, Loader2, Plus, Sparkles } from 'lucide-react';
import { getProductImage } from '../../utils/productImages';

export default function PramarshaBanner({
  recommendation,
  isAdding = false,
  onAddAll,
}) {
  if (!recommendation) return null;

  const products = recommendation.products || [];
  if (!products.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#14B8A6]/25 bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#22C55E] p-5 text-white shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-normal text-white/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-4 w-4" />
            </span>
            Pramarsha - Right about now
          </div>
          <h2 className="text-2xl font-black tracking-normal md:text-3xl">{recommendation.headline}</h2>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            Based on your recent Freshcart timing and repeat-order pattern.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {products.slice(0, 3).map(product => (
              <img
                key={product.id}
                src={getProductImage(product)}
                alt={product.name}
                className="h-14 w-14 rounded-2xl border-2 border-white/70 bg-white object-contain"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onAddAll}
            disabled={isAdding}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0F766E] shadow-sm transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add all
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
