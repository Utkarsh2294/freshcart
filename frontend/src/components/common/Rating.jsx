import { Star } from 'lucide-react';

export default function Rating({ value, max = 5, size = 'sm', className = '' }) {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < value ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'}`}
        />
      ))}
    </div>
  );
}
