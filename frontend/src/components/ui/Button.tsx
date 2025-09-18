import * as React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={`px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-colors
        ${variant === 'primary' ? 'bg-accent text-white hover:bg-pink-400' : 'bg-white text-primary border border-primary hover:bg-gray-100'}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';
export default Button;
