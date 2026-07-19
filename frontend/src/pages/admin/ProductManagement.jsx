export default function ProductManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Add Product
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <input type="text" placeholder="Search products..." className="w-full md:w-1/3 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="p-4">Sample Product</td>
                <td className="p-4">Vegetables</td>
                <td className="p-4">₹40</td>
                <td className="p-4">150</td>
                <td className="p-4 text-emerald-600 cursor-pointer hover:underline">Edit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
