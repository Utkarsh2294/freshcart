import { Link, useNavigate } from "react-router";
import { useCartStore } from "../store/cartStore";
import { useUiStore } from "../store/uiStore";
import { formatPrice } from "../utils/formatters";
import Button from "../components/common/Button";
import { Plus, Minus, Trash2, ShoppingBag, RefreshCw } from "lucide-react";
import CartLine from "../components/common/CartLine";
import SwapSheet from "../components/common/SwapSheet";
import { useEffect, useState } from "react";

export default function Cart() {
  const {
    items,
    total,
    isLoading,
    error,
    pendingItems,
    getSwapOptions,
    swapItem,
    fetchCart,
  } = useCartStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const [swapState, setSwapState] = useState({
    isOpen: false,
    item: null,
    options: [],
    isLoading: false,
    isSwapping: false,
    error: "",
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const openSwap = async (item) => {
    setSwapState({
      isOpen: true,
      item,
      options: [],
      isLoading: true,
      isSwapping: false,
      error: "",
    });
    try {
      const data = await getSwapOptions(item._id);
      setSwapState({
        isOpen: true,
        item,
        options: data.options || [],
        isLoading: false,
        isSwapping: false,
        error: "",
      });
    } catch (err) {
      setSwapState({
        isOpen: true,
        item,
        options: [],
        isLoading: false,
        isSwapping: false,
        error: err.response?.data?.error || "Could not load swap options.",
      });
    }
  };

  const handleSwap = async (option) => {
    const originalItems = items;
    setSwapState((state) => ({ ...state, isSwapping: true }));
    try {
      await swapItem(swapState.item._id, option);
      addToast({ type: "success", message: `Swapped to ${option.name}` });
      setSwapState({
        isOpen: false,
        item: null,
        options: [],
        isLoading: false,
        isSwapping: false,
        error: "",
      });
    } catch (err) {
      await fetchCart();
      addToast({
        type: "error",
        message: err.response?.data?.error || "Swap failed. Cart restored.",
      });
      setSwapState((state) => ({ ...state, isSwapping: false }));
      return originalItems;
    }
  };

  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-[var(--text-secondary)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-default)] border-t-[#8B5CF6]" />
        <p className="font-medium">Loading your cart...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-gray-500">
          Looks like you haven't added anything yet.
        </p>
        {error && (
          <p role="alert" className="text-red-600">
            {error}{" "}
            <button className="underline" onClick={fetchCart}>
              Try again
            </button>
          </p>
        )}
        <Link
          to="/search"
          className="mt-4 rounded-xl bg-[#6366F1] px-5 py-3 font-bold text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold mb-6">
          Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
        {error && (
          <p role="alert" className="mb-4 text-red-600">
            {error}
          </p>
        )}
        <div className="space-y-4">
          {items.map((item) => (
            <CartLine key={item._id} item={item} onSwap={openSwap} />
          ))}
        </div>
      </div>

      <div className="min-w-0 w-full">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
          <h2 className="text-lg font-bold mb-4 border-b pb-2 dark:border-gray-700">
            Bill Details
          </h2>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Item Total
              </span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Delivery Fee
              </span>
              <span className="font-medium text-emerald-600">FREE</span>
            </div>
            <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
              <span>To Pay</span>
              <span className="money">{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            disabled={pendingItems.length > 0}
            onClick={() => navigate("/checkout")}
            className="w-full py-3 font-bold"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

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
