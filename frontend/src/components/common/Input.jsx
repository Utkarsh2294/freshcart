import { forwardRef, useId } from "react";

const Input = forwardRef(
  ({ label, className = "", error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 dark:bg-[#0F111A] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 focus:border-[#8B5CF6] transition-colors ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-transparent dark:border-gray-800 focus:border-[#8B5CF6]"
          } ${className}`}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-500 font-medium"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
