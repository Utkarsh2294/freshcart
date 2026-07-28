import { useEffect } from 'react';
import { Link } from 'react-router';
import { useOrderStore } from '../store/orderStore';
import { formatPrice, formatDate } from '../utils/formatters';
import Badge from '../components/common/Badge';
import { Package, ChevronRight } from 'lucide-react';

export default function OrderHistory() {
  const { orders, fetchOrders, isLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Orders</h1>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-[#1A1C24] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            const orderId = String(order._id || order.id || '');
            const items = Array.isArray(order.items) ? order.items : [];
            const itemNames = items.map(item => item.product?.name || item.name || 'Product').join(', ');

            return (
            <Link key={orderId} to={`/orders/${orderId}`} className="block bg-white dark:bg-[#1A1C24] p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 hover:shadow-md dark:hover:bg-[#20232C] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-[#0F111A] rounded-2xl text-[#8B5CF6]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Order #{orderId.slice(-6).toUpperCase()}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/50">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {items.length} items &bull; {(itemNames || 'Order details').substring(0, 40)}...
                </p>
                <div className="p-1.5 bg-gray-50 dark:bg-[#0F111A] rounded-lg">
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#1A1C24] rounded-3xl border border-gray-100 dark:border-gray-800/50">
          <div className="text-6xl mb-4 opacity-50">📦</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
          <p className="text-gray-500">When you place orders, they will appear here.</p>
        </div>
      )}
    </div>
  );
}
