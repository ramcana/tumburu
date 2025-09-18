import * as React from 'react';
import Input from '../ui/Input';

type PromptBoxProps = {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
  error?: string;
};

const PromptBox: React.FC<PromptBoxProps> = ({ value, onChange, suggestions, error }) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const filtered = suggestions?.filter(s => s.toLowerCase().includes(value.toLowerCase())) || [];
  return (
    <div className="relative">
      <Input
        label="Prompt"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        error={error}
      />
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s}
              className="px-2 py-1 hover:bg-accent hover:text-white cursor-pointer"
              onMouseDown={() => onChange(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default PromptBox;