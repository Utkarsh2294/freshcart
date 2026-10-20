import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useWalletStore } from "../store/walletStore";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { formatPrice } from "../utils/formatters";
import { useUiStore } from "../store/uiStore";

export default function Checkout() {
  const {
    items,
    total,
    clearCart,
    fetchCart,
    isLoading,
    error: cartError,
    pendingItems,
  } = useCartStore();
  const { createOrder } = useOrderStore();
  const { balance, fetchWallet } = useWalletStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [applyWallet, setApplyWallet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  useEffect(() => {
    fetchCart();
    fetchWallet();
  }, [fetchCart, fetchWallet]);
  const walletCredit = applyWallet
    ? Math.min(balance, Number((total * 0.5).toFixed(2)))
    : 0;

  const handlePlaceOrder = async () => {
    if (submitting.current || pendingItems.length || cartError) return;
    submitting.current = true;
    setIsProcessing(true);
    setError("");
    try {
      const order = await createOrder({
        address,
        payment_method: "cod",
        apply_wallet: applyWallet,
      });
      clearCart();
      useUiStore
        .getState()
        .addToast({ type: "success", message: "Your order has been placed." });
      navigate(`/orders/${order.id}`);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Your order could not be placed. Please try again.",
      );
    } finally {
      submitting.current = false;
      setIsProcessing(false);
    }
  };

  if (isLoading && !items.length)
    return (
      <p role="status" className="p-8 text-center">
        Loading your cart…
      </p>
    );
  if (!items.length || cartError)
    return (
      <div className="mx-auto flex min-h-64 max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">
          {cartError ? "Your cart is unavailable" : "Your cart is empty"}
        </h1>
        <p>{cartError || "Add a few products before checking out."}</p>
        {cartError && <Button onClick={fetchCart}>Try again</Button>}
        <Link
          to="/cart"
          className="min-h-11 rounded-xl bg-[#6366F1] px-5 py-3 font-bold text-white"
        >
          Back to cart
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-1 text-sm font-semibold text-[#6366F1] dark:text-[#C4B5FD]">
          One last step
        </p>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>
      <section className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 sm:p-8">
        <h2 className="mb-5 text-lg font-bold">1. Delivery address</h2>
        {step === 1 ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setStep(2);
            }}
          >
            <Input
              label="Street address"
              autoComplete="street-address"
              name="street"
              required
              maxLength={255}
              value={address.street}
              onChange={(event) =>
                setAddress({ ...address, street: event.target.value })
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="City"
                autoComplete="address-level2"
                name="city"
                required
                maxLength={100}
                value={address.city}
                onChange={(event) =>
                  setAddress({ ...address, city: event.target.value })
                }
              />
              <Input
                label="State"
                autoComplete="address-level1"
                name="state"
                required
                maxLength={100}
                value={address.state}
                onChange={(event) =>
                  setAddress({ ...address, state: event.target.value })
                }
              />
            </div>
            <Input
              label="PIN code"
              autoComplete="postal-code"
              name="zip"
              inputMode="numeric"
              pattern="[1-9][0-9]{5}"
              title="Enter a valid six-digit Indian PIN code"
              required
              maxLength={6}
              value={address.zip}
              onChange={(event) =>
                setAddress({ ...address, zip: event.target.value })
              }
            />
            <Button type="submit">Continue to payment</Button>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4 rounded-xl bg-[var(--bg-surface)] p-4">
            <p className="content-wrap min-w-0 text-sm">
              {[address.street, address.city, address.state, address.zip].join(
                ", ",
              )}
            </p>
            <button
              className="min-h-11 shrink-0 font-semibold text-[#6366F1] dark:text-[#C4B5FD]"
              disabled={isProcessing}
              onClick={() => setStep(1)}
            >
              Edit
            </button>
          </div>
        )}
      </section>
      {step === 2 && (
        <section className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 sm:p-8">
          <h2 className="mb-5 text-lg font-bold">2. Payment & review</h2>
          <p className="rounded-xl bg-[var(--bg-surface)] p-4 text-sm">
            <strong>Pay on delivery</strong>
            <br />
            Pay for your groceries when they arrive.
          </p>
          <label className="my-5 flex min-h-12 items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0"
              checked={applyWallet}
              disabled={isProcessing || balance <= 0}
              onChange={(event) => setApplyWallet(event.target.checked)}
            />
            <span className="text-sm">
              Use wallet credit · {formatPrice(balance)} available
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                Wallet credit covers up to 50% of the item total.
              </span>
            </span>
          </label>
          <dl className="space-y-3 border-t border-[var(--border-default)] pt-5 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <dt>Item total</dt>
              <dd className="money">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Delivery</dt>
              <dd>Free</dd>
            </div>
            {walletCredit > 0 && (
              <div className="flex flex-wrap justify-between gap-2">
                <dt>Wallet credit</dt>
                <dd className="money">−{formatPrice(walletCredit)}</dd>
              </div>
            )}
            <div className="flex flex-wrap justify-between gap-2 text-xl font-bold">
              <dt>Pay on delivery</dt>
              <dd className="money">{formatPrice(total - walletCredit)}</dd>
            </div>
          </dl>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
            >
              {error}
            </p>
          )}
          <Button
            onClick={handlePlaceOrder}
            disabled={isProcessing || pendingItems.length > 0}
            aria-busy={isProcessing}
            className="mt-6 w-full"
          >
            {isProcessing ? "Placing your order…" : "Place order"}
          </Button>
        </section>
      )}
    </div>
  );
}
