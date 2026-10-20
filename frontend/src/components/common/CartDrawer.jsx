import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";
import { formatPrice } from "../../utils/formatters";
import SwapSheet from "./SwapSheet";
import CartLine from "./CartLine";
import { useState } from "react";

export default function CartDrawer() {
  const {
    items,
    total,
    error,
    pendingItems,
    getSwapOptions,
    swapItem,
    fetchCart,
  } = useCartStore();
  const [swapState, setSwapState] = useState({ isOpen: false, options: [] });
  const openSwap = async (item) => {
    setSwapState({ isOpen: true, item, options: [], isLoading: true });
    try {
      const data = await getSwapOptions(item._id);
      setSwapState((state) =>
        state.item?._id === item._id
          ? { ...state, options: data.options || [], isLoading: false }
          : state,
      );
    } catch (error) {
      setSwapState((state) => ({
        ...state,
        isLoading: false,
        error: error.response?.data?.error || "Could not load alternatives.",
      }));
    }
  };
  const handleSwap = async (option) => {
    if (swapState.isSwapping) return;
    setSwapState((state) => ({ ...state, isSwapping: true }));
    try {
      await swapItem(swapState.item._id, option);
      setSwapState({ isOpen: false, options: [] });
    } catch (error) {
      useUiStore
        .getState()
        .addToast({
          type: "error",
          message:
            error.response?.data?.error ||
            "Swap failed. Your cart has been restored.",
        });
      setSwapState((state) => ({ ...state, isSwapping: false }));
    }
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 p-5">
        <h2 className="text-lg font-bold">Your cart</h2>
        <Link
          to="/cart"
          className="text-sm font-semibold text-[#6366F1] dark:text-[#C4B5FD]"
        >
          View cart
        </Link>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-4">
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-300">
            {error}{" "}
            <button className="underline" onClick={fetchCart}>
              Retry
            </button>
          </p>
        )}
        {!items.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-[var(--text-secondary)]">
            <ShoppingBag className="h-10 w-10" />
            <p>Your cart is waiting.</p>
            <p className="text-sm">Add something fresh to get started.</p>
          </div>
        ) : (
          items.map((item) => (
            <CartLine key={item._id} item={item} onSwap={openSwap} />
          ))
        )}
      </div>
      {!!items.length && (
        <div className="space-y-4 border-t border-[var(--border-default)] p-5">
          <div className="flex flex-wrap justify-between gap-2 font-bold">
            <span>Item total</span>
            <span className="money">{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Delivery is free. Wallet credits are calculated at checkout.
          </p>
          <Link
            to={pendingItems.length ? "/cart" : "/checkout"}
            className="flex min-h-12 items-center justify-center rounded-xl bg-[#6366F1] px-4 font-bold text-white"
          >
            Review & checkout
          </Link>
        </div>
      )}
      <SwapSheet
        isOpen={swapState.isOpen}
        currentItem={swapState.item}
        options={swapState.options}
        isLoading={swapState.isLoading}
        isSwapping={swapState.isSwapping}
        error={swapState.error}
        onClose={() => setSwapState((state) => ({ ...state, isOpen: false }))}
        onSelect={handleSwap}
      />
    </div>
  );
}
