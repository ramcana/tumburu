import * as React from 'react';

type ProgressProps = {
  value: number;
  max?: number;
};

const Progress: React.FC<ProgressProps> = ({ value, max = 100 }) => (
  <div className="w-full bg-gray-200 rounded h-2">
    <div
      className="bg-accent h-2 rounded"
      style={{ width: `${(value / max) * 100}%` }}
      aria-valuenow={value}
      aria-valuemax={max}
      aria-valuemin={0}
      role="progressbar"
    />
  </div>
);

export default Progress;