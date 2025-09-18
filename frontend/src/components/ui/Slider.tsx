import * as React from 'react';
import type { InputHTMLAttributes } from 'react';

type SliderProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
};

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(({ label, ...props }, ref) => (
  <div className="mb-2">
    {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
    <input
      ref={ref}
      type="range"
      className="w-full accent-accent"
      {...props}
    />
  </div>
));
Slider.displayName = 'Slider';
export default Slider;
