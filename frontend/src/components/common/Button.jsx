export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1A1C24] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] text-white hover:opacity-90 shadow-lg shadow-[#EC4899]/20 focus:ring-[#8B5CF6]',
    secondary: 'bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 focus:ring-[#8B5CF6] dark:bg-[#8B5CF6]/20 dark:text-[#A78BFA] dark:hover:bg-[#8B5CF6]/30',
    outline: 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-[#8B5CF6] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
