export default function SkeletonLoader({ type = 'product' }) {
  if (type === 'product') {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-64">
        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
  );
}
