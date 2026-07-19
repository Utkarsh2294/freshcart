import { Link, useNavigate } from 'react-router';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatters';
import Button from '../components/common/Button';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { getProductImage } from '../utils/productImages';

export default function Cart() {
  const { items, total, removeItem, updateItem } = useCartStore();
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-gray-500">Looks like you haven't added anything yet.</p>
        <Link to="/">
          <Button className="mt-4">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="flex gap-4 bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-[var(--border-default)]">
              <img src={getProductImage(item.product)} alt={item.product?.name} className="w-20 h-20 object-contain rounded-lg bg-[var(--bg-surface)]" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.product?.name}</h3>
                  <p className="text-sm text-gray-500">{item.product?.unit}</p>
                </div>
                <div className="font-bold text-lg">{formatPrice(item.price)}</div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item._id)} className="text-red-500 hover:text-red-600 p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button onClick={() => item.quantity === 1 ? removeItem(item._id) : updateItem(item._id, item.quantity - 1)} className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)} className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-80">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
          <h2 className="text-lg font-bold mb-4 border-b pb-2 dark:border-gray-700">Bill Details</h2>
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Item Total</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
              <span className="font-medium text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Handling Fee</span>
              <span className="font-medium">{formatPrice(5)}</span>
            </div>
            <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
              <span>To Pay</span>
              <span>{formatPrice(total + 5)}</span>
            </div>
          </div>

          <Button onClick={() => navigate('/checkout')} className="w-full py-3 text-lg font-bold">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
