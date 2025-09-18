import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface PromptBuilderProps {
  value: string;
  onChange: (prompt: string) => void;
  templates?: string[];
  className?: string;
}

const defaultTemplates = [
  'A chill {genre} track with {instruments}',
  'Upbeat {genre} with {instruments} and {bpm} BPM',
  'Moody {genre} piece in {keySignature}',
];

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ value, onChange, templates = defaultTemplates, className }) => {
  const [input, setInput] = useState(value);
  const [showTemplates, setShowTemplates] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    if (input.endsWith('{')) {
      setSuggestions(['genre', 'instruments', 'bpm', 'keySignature', 'timeSignature']);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  function handleTemplateClick(tmpl: string) {
    setInput(tmpl);
    onChange(tmpl);
    setShowTemplates(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    onChange(e.target.value);
  }

  return (
    <div className={clsx('w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-4', className)}>
      <div className="flex items-center mb-2">
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-base"
          placeholder="Describe your track..."
          value={input}
          onChange={handleInputChange}
          aria-label="Prompt"
          autoComplete="off"
          onFocus={() => setShowTemplates(true)}
        />
        <button
          className="ml-2 px-2 py-1 rounded bg-accent text-white text-xs"
          onClick={() => setShowTemplates(v => !v)}
          type="button"
        >Templates</button>
      </div>
      {showTemplates && (
        <div className="mb-2 bg-gray-50 dark:bg-zinc-800 rounded p-2 shadow-inner">
          <div className="text-xs mb-1 text-gray-500">Templates:</div>
          <ul className="space-y-1">
            {templates.map(tmpl => (
              <li key={tmpl}>
                <button
                  className="w-full text-left px-2 py-1 rounded hover:bg-accent/10 focus:bg-accent/20"
                  onClick={() => handleTemplateClick(tmpl)}
                  type="button"
                >{tmpl}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Suggestions: {suggestions.join(', ')}
        </div>
      )}
      <div className="mt-2 text-xs text-gray-400">Auto-complete with <kbd>{'{'}</kbd> for smart fields.</div>
    </div>
  );
};

export default PromptBuilder;
