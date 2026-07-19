export default function StockIndicator({ inStock, stockCount }) {
  if (!inStock) {
    return <span className="text-sm font-medium text-red-500">Out of Stock</span>;
  }

  if (stockCount > 0 && stockCount <= 5) {
    return <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">Only {stockCount} left</span>;
  }

  return <span className="text-sm font-medium text-[#22C55E]">In Stock</span>;
}
