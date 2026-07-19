import { useState } from 'react';
import { Bell, ShoppingBag, Tag, Smartphone, Mail, AlertCircle } from 'lucide-react';

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    pushOrders: true,
    pushOffers: false,
    emailOrders: true,
    emailOffers: true,
    smsAlerts: false
  });

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

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
              onClick={() => toggle('pushOrders')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.pushOrders ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.pushOrders ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl">
                <Tag className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Offers & Promos</h3>
                <p className="text-sm text-gray-500">Discounts and new products</p>
              </div>
            </div>
            <button 
              onClick={() => toggle('pushOffers')}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${prefs.pushOffers ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.pushOffers ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
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
