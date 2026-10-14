import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Check, ChevronDown, Clock, Loader2, Maximize2, PackageCheck, RefreshCw, ShoppingBag, Sparkles, Users, Volume2, X } from 'lucide-react';
import * as cookThisService from '../services/cookThisService';
import { formatPrice } from '../utils/formatters';
import { getProductImage } from '../utils/productImages';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import SwapSheet from '../components/common/SwapSheet';
import { featureFlags } from '../utils/featureFlags';
import { renderRecipeStep } from 'freshcart-shared/i18n/renderRecipeStep';

const badgeStyles = {
  exact: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  multi_pack: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  oversized: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  closest: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  no_match: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  out_of_stock: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

export default function RecipeResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCartStore();
  const { dishName, servings, recipe, matches = [], pantryNote = '' } = location.state || {};
  const [localMatches, setLocalMatches] = useState(matches);
  const [selected, setSelected] = useState(() => new Set(matches.filter(match => match.selected && match.product).map(match => match.product.id)));
  const [swapState, setSwapState] = useState({ isOpen: false, matchIndex: -1, options: [] });
  const [expandedStep, setExpandedStep] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [cookingMode, setCookingMode] = useState(false);
  const [cookingStep, setCookingStep] = useState(0);
  const [language, setLanguage] = useState(() => localStorage.getItem('freshcart_recipe_language') || 'en');

  const selectedMatches = useMemo(() => {
    return localMatches.filter(match => match.product && selected.has(match.product.id));
  }, [localMatches, selected]);

  if (!recipe) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <Sparkles className="h-12 w-12 text-[#8B5CF6]" />
        <h1 className="text-2xl font-bold tracking-normal text-[var(--text-primary)]">Start with Cook with AI</h1>
        <p className="text-[var(--text-secondary)]">Generate a recipe first so Freshcart can match ingredients to products.</p>
        <Link to="/cook-this" className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-5 py-3 font-bold text-white">
          Open Cook with AI
        </Link>
      </div>
    );
  }

  const toggleMatch = (productId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const openRecipeSwap = (match, index) => {
    const options = (match.alternatives || [])
      .map(item => item.product)
      .filter(Boolean)
      .map(product => ({
        ...product,
        price_delta: Number((Number(product.price || 0) - Number(match.product?.price || 0)).toFixed(2)),
        rating: product.rating || 4,
      }));
    setSwapState({ isOpen: true, matchIndex: index, options });
  };

  const applyRecipeSwap = (option) => {
    const currentMatch = localMatches[swapState.matchIndex];
    const nextSelected = new Set(selected);
    if (currentMatch?.product) nextSelected.delete(currentMatch.product.id);
    nextSelected.add(option.id);

    setSelected(nextSelected);
    setLocalMatches(prev => prev.map((match, index) => (
      index === swapState.matchIndex
        ? {
          ...match,
          selected: true,
          product: option,
          match_type: 'closest',
          note: 'Swapped to an alternate in-stock product before adding to cart.',
        }
        : match
    )));
    setSwapState({ isOpen: false, matchIndex: -1, options: [] });
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/recipe-result' } } });
      return;
    }

    setIsAdding(true);
    setMessage('');
    try {
      await cookThisService.addMatchedItemsToCart(selectedMatches.map(match => ({
        product_id: match.product.id,
        quantity: match.quantity,
      })));
      await fetchCart();
      setMessage(`${selectedMatches.length} matched products added to cart.`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add items to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const readStep = () => {
    const text = displayStep(recipe.steps?.[cookingStep]);
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem('freshcart_recipe_language', nextLanguage);
  };

  const displayStep = (step) => renderRecipeStep(step, language, {
    onUnmatchedTerm: (info) => console.info('[recipe-i18n:fallback]', info),
  });

  const openCookingMode = async () => {
    setCookingMode(true);
    try {
      await navigator.wakeLock?.request?.('screen');
    } catch {
      // Wake lock is best-effort; the full-screen cooking view still works.
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#111827] to-[#312E81] p-6 shadow-xl md:p-10">
        <div className="mb-4 flex w-max items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-normal text-white">
          <Sparkles className="h-3 w-3" /> AI Generated
        </div>
        <h1 className="mb-3 text-3xl font-black tracking-normal text-white md:text-5xl">{recipe.title}</h1>
        <p className="max-w-2xl text-white/75">
          Generated for {servings} servings from “{dishName}”, then matched against available Freshcart products.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="flex flex-1 flex-col items-center justify-center border-r border-[var(--border-default)] p-2">
              <Clock className="mb-1 h-6 w-6 text-[#8B5CF6]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">30-45 mins</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center border-r border-[var(--border-default)] p-2">
              <Users className="mb-1 h-6 w-6 text-[#EC4899]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">{servings} Servings</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-2">
              <PackageCheck className="mb-1 h-6 w-6 text-[#F97316]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">{selectedMatches.length} Matched</span>
            </div>
          </div>

          {(pantryNote || recipe.nutrition || featureFlags.handsFreeCooking) && (
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-sm">
              {pantryNote && featureFlags.smartPantry && (
                <p className="mb-3 text-sm font-semibold text-[#14B8A6]">{pantryNote}</p>
              )}
              {recipe.nutrition && featureFlags.nutritionCostCard && (
                <div className="mb-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <span><b>{recipe.nutrition.calories_per_serving}</b> cal/serving</span>
                  <span><b>{recipe.nutrition.protein_g_per_serving}g</b> protein</span>
                  <span><b>{formatPrice(recipe.nutrition.estimated_cost)}</b> total</span>
                  <span><b>{formatPrice(recipe.nutrition.cost_per_serving)}</b> / serving</span>
                </div>
              )}
              {featureFlags.handsFreeCooking && (
                <button type="button" onClick={openCookingMode} className="flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white">
                  <Maximize2 className="h-4 w-4" /> Cooking mode
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold tracking-normal text-[var(--text-primary)]">Instructions</h2>
              <div className="flex rounded-xl bg-[var(--bg-surface)] p-1 text-sm font-bold">
                {[
                  ['en', 'English'],
                  ['hi', 'हिन्दी'],
                  ['hinglish', 'Hinglish'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => changeLanguage(value)}
                    className={`rounded-lg px-3 py-2 ${language === value ? 'bg-[var(--bg-card)] text-[#8B5CF6] shadow-sm' : 'text-[var(--text-secondary)]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {(recipe.steps || []).map((step, index) => (
              <div
                key={`${typeof step === 'string' ? step : step.id}-${index}`}
                className={`overflow-hidden rounded-2xl border bg-[var(--bg-card)] transition-all ${
                  expandedStep === index ? 'border-[#8B5CF6] shadow-md dark:shadow-none' : 'border-[var(--border-default)]'
                }`}
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? -1 : index)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      expandedStep === index ? 'bg-[#8B5CF6] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">Step {index + 1}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-[var(--text-secondary)] transition-transform ${expandedStep === index ? 'rotate-180' : ''}`} />
                </button>
                {expandedStep === index && (
                  <div className="px-4 pb-4 pl-16 text-[var(--text-secondary)]">{displayStep(step)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sticky top-24 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-normal text-[var(--text-primary)]">Matched Cart</h2>
              <span className="text-sm font-medium text-[var(--text-secondary)]">{selectedMatches.length}/{localMatches.length}</span>
            </div>

            <div className="mb-6 max-h-[520px] space-y-4 overflow-y-auto pr-1">
              {localMatches.map((match, index) => {
                const product = match.product;
                const isSelected = product && selected.has(product.id);

                return (
                  <div key={`${match.ingredient.name}-${product?.id || 'none'}`} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
                    <div className="mb-3 flex items-start gap-3">
                      <button
                        onClick={() => product && toggleMatch(product.id)}
                        disabled={!product}
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected ? 'border-[#EC4899] bg-[#EC4899]' : 'border-[var(--border-default)] bg-[var(--bg-card)]'
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{match.ingredient.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Needs {match.ingredient.qty}{match.ingredient.unit ? ` ${match.ingredient.unit}` : ''}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${badgeStyles[match.match_type] || badgeStyles.closest}`}>
                        {match.match_type.replace('_', ' ')}
                      </span>
                    </div>

                    {product ? (
                      <div className="flex gap-3">
                        <img src={getProductImage(product)} alt={product.name} className="h-14 w-14 rounded-xl object-contain" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-bold text-[var(--text-primary)]">{product.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{product.brand} • {product.unit}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                            {match.quantity} x {formatPrice(product.price)}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-xs text-[var(--text-secondary)]">{match.note}</p>
                            <button
                              type="button"
                              onClick={() => openRecipeSwap(match, index)}
                              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#14B8A6] hover:bg-[var(--bg-card)]"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Swap
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500">{match.note}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || selectedMatches.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] py-4 font-bold text-white shadow-lg shadow-[#EC4899]/20 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
              Add Selected to Cart
            </button>

            {message && <p className="mt-3 text-center text-sm font-medium text-[var(--text-secondary)]">{message}</p>}
          </div>
        </div>
      </div>

      <SwapSheet
        isOpen={swapState.isOpen}
        currentItem={swapState.matchIndex >= 0 ? { product: localMatches[swapState.matchIndex]?.product } : null}
        options={swapState.options}
        isLoading={false}
        isSwapping={false}
        error=""
        onClose={() => setSwapState({ isOpen: false, matchIndex: -1, options: [] })}
        onSelect={applyRecipeSwap}
      />

      {cookingMode && featureFlags.handsFreeCooking && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#0F172A] p-6 text-white"
          onClick={() => setCookingStep(step => Math.min((recipe.steps?.length || 1) - 1, step + 1))}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-normal text-white/60">
              Step {cookingStep + 1} of {recipe.steps?.length || 1}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={(event) => { event.stopPropagation(); readStep(); }} className="rounded-full bg-white/10 p-3">
                <Volume2 className="h-6 w-6" />
              </button>
              <button type="button" onClick={(event) => { event.stopPropagation(); setCookingMode(false); }} className="rounded-full bg-white/10 p-3">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center text-center">
            <p className="max-w-4xl text-4xl font-black leading-tight tracking-normal md:text-6xl">
              {displayStep(recipe.steps?.[cookingStep])}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setCookingStep(step => Math.max(0, step - 1)); }}
              className="rounded-xl bg-white/10 px-5 py-3 font-bold"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setCookingStep(step => Math.min((recipe.steps?.length || 1) - 1, step + 1)); }}
              className="rounded-xl bg-white px-5 py-3 font-bold text-[#0F172A]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
