import { Link } from 'react-router';
import { Minus, Plus, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { formatCurrency } from '../../utils/formatters';
import { getProductImage } from '../../utils/productImages';
import SwapSheet from './SwapSheet';
import { useState } from 'react';

export default function CartDrawer({ isOpen, onClose, isDesktop }) {
  const { items, removeItem, updateItem, getSwapOptions, swapItem, fetchCart } = useCartStore();
  const { addToast } = useUiStore();
  const [swapState, setSwapState] = useState({
    isOpen: false,
    item: null,
    options: [],
    isLoading: false,
    isSwapping: false,
    error: '',
  });

  if (!isOpen) return null;

  const openSwap = async (item) => {
    setSwapState({ isOpen: true, item, options: [], isLoading: true, isSwapping: false, error: '' });
    try {
      const data = await getSwapOptions(item._id);
      setSwapState({ isOpen: true, item, options: data.options || [], isLoading: false, isSwapping: false, error: '' });
    } catch (err) {
      setSwapState({ isOpen: true, item, options: [], isLoading: false, isSwapping: false, error: err.response?.data?.error || 'Could not load swap options.' });
    }
  };

  const handleSwap = async (option) => {
    setSwapState(state => ({ ...state, isSwapping: true }));
    try {
      await swapItem(swapState.item._id, option);
      addToast({ type: 'success', message: `Swapped to ${option.name}` });
      setSwapState({ isOpen: false, item: null, options: [], isLoading: false, isSwapping: false, error: '' });
    } catch (err) {
      await fetchCart();
      addToast({ type: 'error', message: err.response?.data?.error || 'Swap failed. Cart restored.' });
      setSwapState(state => ({ ...state, isSwapping: false }));
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const itemTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = totalItems > 0 ? 0 : 0;
  const packagingFee = totalItems > 0 ? 5 : 0;
  const toPay = itemTotal + deliveryFee + packagingFee;

  return (
    <>
      {!isDesktop && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[340px] transform flex-col bg-[var(--bg-card)] shadow-2xl transition-transform duration-300 ${!isDesktop && isOpen ? 'translate-x-0' : ''} ${isDesktop ? 'static h-full translate-x-0 shadow-none' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-bold tracking-normal text-[var(--text-primary)]">My Cart ({totalItems})</h2>
          {items.length > 0 && (
            <Link to="/cart" className="text-sm font-semibold text-[#8B5CF6] hover:text-[#6366F1]">
              View cart
            </Link>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-2">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-[var(--text-secondary)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="flex gap-4 rounded-xl bg-[var(--bg-surface)] p-3">
                <img src={getProductImage(item.product)} alt={item.product.name} className="h-12 w-12 flex-shrink-0 rounded-lg object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 text-sm font-semibold tracking-normal text-[var(--text-primary)]">{item.product.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">{item.product.unit}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openSwap(item)} className="text-[var(--text-secondary)] hover:text-[#14B8A6]" title="Swap brand">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeItem(item._id)} className="text-[var(--text-secondary)] hover:text-red-500" title="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {item.source === 'ai_recipe' && (
                    <p className="mt-1 text-xs font-semibold text-[#14B8A6]">From your recipe</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(item.price)}</span>
                    <div className="grid grid-cols-[24px_24px_24px] items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-card)]">
                      <button onClick={() => item.quantity === 1 ? removeItem(item._id) : updateItem(item._id, item.quantity - 1)} className="flex h-7 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-center text-xs font-semibold">{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)} className="flex h-7 items-center justify-center text-[#8B5CF6] hover:text-[#6366F1]">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t border-[var(--border-default)] p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Item Total</span>
                <span className="font-medium text-[var(--text-primary)]">{formatCurrency(itemTotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Delivery Fee</span>
                <span className="font-medium text-[#22C55E]">FREE</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Handling Fee</span>
                <span className="font-medium text-[var(--text-primary)]">{formatCurrency(packagingFee)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-4">
              <span className="font-bold text-[var(--text-primary)]">To Pay</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(toPay)}</span>
            </div>

            <Link to="/checkout" className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
              Checkout
            </Link>
          </div>
        )}
      </div>
      <SwapSheet
        isOpen={swapState.isOpen}
        currentItem={swapState.item}
        options={swapState.options}
        isLoading={swapState.isLoading}
        isSwapping={swapState.isSwapping}
        error={swapState.error}
        onClose={() => setSwapState(state => ({ ...state, isOpen: false }))}
        onSelect={handleSwap}
      />
    </>
  );
}
