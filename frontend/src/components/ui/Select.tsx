import * as React from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
  label?: string;
  error?: string;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, children, ...props }, ref) => (
  <div className="mb-2">
    {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
    <select
      ref={ref}
      className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-accent ${error ? 'border-red-500' : ''}`}
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
));
Select.displayName = 'Select';
export default Select;
