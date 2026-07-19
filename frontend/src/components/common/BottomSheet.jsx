import { X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transform transition-transform duration-300 flex flex-col max-h-[85vh]">
        <div className="flex justify-center p-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-6 py-2 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
