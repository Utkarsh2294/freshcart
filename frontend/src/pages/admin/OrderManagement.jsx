export default function OrderManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order Management</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="p-4">#ORD-123</td>
                <td className="p-4">John Doe</td>
                <td className="p-4">₹450</td>
                <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PENDING</span></td>
                <td className="p-4 text-emerald-600 cursor-pointer hover:underline">View</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
