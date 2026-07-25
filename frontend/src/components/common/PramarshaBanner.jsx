import { ArrowRight, CloudRain, Loader2, Plus, RefreshCw, Sparkles, Sun } from 'lucide-react';
import { getProductImage } from '../../utils/productImages';

/**
 * Eyebrow suffix and accent icon per signal_type (§5).
 * All variants keep the teal→green gradient (§8 constraint 4).
 * Streak: no countdown timers, no loss-framing, no red/warning colors (§9 constraint 7).
 */
const SIGNAL_VARIANTS = {
  temporal:      { suffix: '', AccentIcon: null },
  cadence:       { suffix: '', AccentIcon: null },
  replenishment: { suffix: ' · Running low?', AccentIcon: RefreshCw },
  weather:       { suffix: ' · Right for today\'s weather', AccentIcon: null }, // icon chosen by reason_tag below
  event:         { suffix: '', AccentIcon: null }, // suffix chosen by reason_tag below
  streak:        { suffix: '', AccentIcon: null }, // suffix built dynamically from streak_count
};

/**
 * Weather reason_tag → accent icon mapping.
 * Uses small static icons from lucide-react (already in design system) — never external assets (§5).
 */
const WEATHER_ICONS = {
  rainy_day_comfort: CloudRain,
  heatwave_cooldown: Sun,
};

/**
 * Event reason_tag → eyebrow suffix mapping (§5).
 */
const EVENT_SUFFIXES = {
  matchday_snacks: ' · Game night',
  festival_essentials: ' · Festival prep',
};

function getEyebrowSuffix(signalType, reasonTag, streakCount) {
  if (signalType === 'streak' && streakCount) {
    return ` · ${streakCount}-week streak`;
  }
  if (signalType === 'event' && EVENT_SUFFIXES[reasonTag]) {
    return EVENT_SUFFIXES[reasonTag];
  }
  return SIGNAL_VARIANTS[signalType]?.suffix || '';
}

function getAccentIcon(signalType, reasonTag) {
  if (signalType === 'weather') {
    return WEATHER_ICONS[reasonTag] || null;
  }
  return SIGNAL_VARIANTS[signalType]?.AccentIcon || null;
}

export default function PramarshaBanner({
  recommendation,
  isAdding = false,
  onAddAll,
}) {
  if (!recommendation) return null;

  const products = recommendation.products || [];
  if (!products.length) return null;

  const signalType = recommendation.signal_type || 'temporal';
  const reasonTag = recommendation.reason_tag || 'usual_picks';
  const streakCount = recommendation.streak_count;
  const eyebrowSuffix = getEyebrowSuffix(signalType, reasonTag, streakCount);
  const AccentIcon = getAccentIcon(signalType, reasonTag);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#14B8A6]/25 bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#22C55E] p-5 text-white shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-normal text-white/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-4 w-4" />
            </span>
            Pramarsha — Right about now{eyebrowSuffix}
          </div>
          <div className="flex items-center gap-2">
            {AccentIcon && <AccentIcon className="h-5 w-5 flex-shrink-0 text-white/90" />}
            <h2 className="text-2xl font-black tracking-normal md:text-3xl">{recommendation.headline}</h2>
          </div>
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
