import * as React from 'react';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => (
  <div className="mb-2">
    {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
    <input
      ref={ref}
      className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-accent ${error ? 'border-red-500' : ''}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
));
Input.displayName = 'Input';
export default Input;
