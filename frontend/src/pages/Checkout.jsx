import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatPrice } from '../utils/formatters';
import { useUiStore } from '../store/uiStore';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    street: '123 Main St',
    city: 'Mumbai',
    state: 'MH',
    zip: '400001'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!items.length) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold tracking-normal text-[var(--text-primary)]">Your cart is empty</h1>
        <p className="text-[var(--text-secondary)]">Add a few products before checking out.</p>
        <Link to="/cart" className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-5 py-3 font-bold text-white">
          Back to Cart
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const order = await createOrder({
        address,
        payment_method: paymentMethod,
        apply_wallet: paymentMethod === 'wallet',
      });
      
      clearCart();
      addToast({ type: 'success', message: 'Order placed successfully!' });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to place order.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Checkout</h1>
      
      <div className="bg-[var(--bg-card)] p-6 lg:p-8 rounded-3xl shadow-sm border border-[var(--border-default)]">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white ${step >= 1 ? 'bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>1</span>
          Delivery Address
        </h2>
        {step === 1 ? (
          <div className="space-y-5">
            <Input label="Street Address" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="bg-gray-50 dark:bg-[#0F111A] border-none" />
            <div className="grid grid-cols-2 gap-5">
              <Input label="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="bg-gray-50 dark:bg-[#0F111A] border-none" />
              <Input label="PIN Code" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="bg-gray-50 dark:bg-[#0F111A] border-none" />
            </div>
            <button onClick={() => setStep(2)} className="mt-4 px-8 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold transition-colors">Continue to Payment</button>
          </div>
        ) : (
          <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-surface)] p-4 rounded-xl flex justify-between items-center">
            <span>{address.street}, {address.city}, {address.zip}</span>
            <button onClick={() => setStep(1)} className="text-[#8B5CF6] font-semibold hover:text-[#7C3AED] transition-colors">Edit</button>
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] p-6 lg:p-8 rounded-3xl shadow-sm border border-[var(--border-default)]">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white ${step >= 2 ? 'bg-gradient-to-br from-[#EC4899] to-[#F97316] shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>2</span>
          Payment Method
        </h2>
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              {[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'razorpay', label: 'Razorpay / UPI / Card' },
                { value: 'wallet', label: 'Wallet' },
                { value: 'bnpl', label: 'BNPL' },
              ].map(method => (
                <label key={method.value} className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border ${paymentMethod === method.value ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-transparent'}`}>
                  <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="text-[#8B5CF6] focus:ring-[#8B5CF6] bg-transparent" />
                  <span className={`ml-3 font-semibold ${paymentMethod === method.value ? 'text-[#8B5CF6]' : 'text-gray-700 dark:text-gray-300'}`}>{method.label}</span>
                </label>
              ))}
            </div>
            
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">Amount to Pay</p>
                <p className="text-3xl font-black text-[var(--text-primary)] mt-1">{formatPrice(total + 5)}</p>
              </div>
              <button onClick={handlePlaceOrder} disabled={isProcessing} className="px-8 py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] text-white shadow-lg shadow-[#EC4899]/20 hover:opacity-90 transition-opacity disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
