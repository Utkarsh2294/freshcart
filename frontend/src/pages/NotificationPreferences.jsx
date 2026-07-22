import { useEffect, useState } from 'react';
import { Bell, ShoppingBag, Tag, Smartphone, Mail, AlertCircle, Send } from 'lucide-react';
import * as notificationService from '../services/notificationService';
import { useUiStore } from '../store/uiStore';

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    order_status: true,
    back_in_stock: true,
    price_drop: true,
    emailOffers: true,
    smsAlerts: false
  });
  const { addToast } = useUiStore();

  useEffect(() => {
    notificationService.getPreferences()
      .then(data => setPrefs(prev => ({ ...prev, ...(data.preferences || {}) })))
      .catch(() => {});
  }, []);

  const toggle = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (['order_status', 'back_in_stock', 'price_drop'].includes(key)) {
      await notificationService.updatePreferences({
        order_status: next.order_status,
        back_in_stock: next.back_in_stock,
        price_drop: next.price_drop,
      });
    }
  };

  const sendTest = async () => {
    const result = await notificationService.sendTestNotification();
    addToast({
      type: result.sent ? 'success' : 'info',
      message: result.sent ? 'Test push sent.' : 'Test push queued. Add VAPID keys and subscribe this browser to receive it.',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#8B5CF6]" />
          Notification Settings
        </h1>
        <p className="text-gray-500">Control how and when we contact you.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl text-blue-600 dark:text-blue-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Never miss an order update</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We strongly recommend keeping Push Notifications enabled for Orders so you know exactly when your rider arrives.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Push Notifications</h2>
        
        <div className="bg-white dark:bg-[#1A1C24] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Order Updates</h3>
                <p className="text-sm text-gray-500">Delivery status and rider ETA</p>
              </div>
            </div>
            <button 
              onClick={() => toggle('order_status')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.order_status ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.order_status ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl">
                <Tag className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Back in Stock</h3>
                <p className="text-sm text-gray-500">Restock alerts for saved items</p>
              </div>
            </div>
            <button 
              onClick={() => toggle('back_in_stock')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.back_in_stock ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.back_in_stock ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="p-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl">
                <Tag className="w-6 h-6 text-[#14B8A6]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Price Drops</h3>
                <p className="text-sm text-gray-500">Lower price alerts</p>
              </div>
            </div>
            <button
              onClick={() => toggle('price_drop')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.price_drop ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.price_drop ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <button type="button" onClick={sendTest} className="flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 font-bold text-white">
          <Send className="h-4 w-4" /> Send test order-status push
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Other Channels</h2>
        
        <div className="bg-white dark:bg-[#1A1C24] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Email Newsletters</h3>
                <p className="text-sm text-gray-500">Weekly recipes and receipts</p>
              </div>
            </div>
            <button 
              onClick={() => toggle('emailOffers')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.emailOffers ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.emailOffers ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl">
                <Smartphone className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">SMS Alerts</h3>
                <p className="text-sm text-gray-500">Critical account updates only</p>
              </div>
            </div>
            <button 
              onClick={() => toggle('smsAlerts')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.smsAlerts ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.smsAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
