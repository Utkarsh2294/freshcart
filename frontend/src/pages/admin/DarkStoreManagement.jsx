export default function DarkStoreManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dark Store Management</h1>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Add Store
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg">Store #1 - Andheri</h3>
          <p className="text-sm text-gray-500 mt-2">Active Orders: 12</p>
          <p className="text-sm text-gray-500">Riders Online: 5</p>
          <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between text-sm">
            <span className="text-green-500 font-medium">Operational</span>
            <button className="text-emerald-600 hover:underline">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
}
