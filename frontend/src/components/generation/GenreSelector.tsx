import React, { useState, useMemo, useRef, useEffect } from 'react';
import { genres, GenreNode } from '../../data/genres';
import clsx from 'clsx';

interface GenreSelectorProps {
  value: string | null;
  onChange: (genre: string) => void;
  className?: string;
}

function flattenGenres(nodes: GenreNode[], parent: GenreNode[] = []): { node: GenreNode; path: GenreNode[] }[] {
  let result: { node: GenreNode; path: GenreNode[] }[] = [];
  for (const node of nodes) {
    result.push({ node, path: [...parent, node] });
    if (node.children) {
      result = result.concat(flattenGenres(node.children, [...parent, node]));
    }
  }
  return result;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ value, onChange, className }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('recentGenres') || '[]'));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('recentGenres', JSON.stringify(recent));
  }, [recent]);

  const flatGenres = useMemo(() => flattenGenres(genres), []);
  const filtered = useMemo(() =>
    flatGenres.filter(({ node }) =>
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      (node.children && node.children.some(child => child.name.toLowerCase().includes(search.toLowerCase())))
    ), [search, flatGenres]);

  const selectedPath = flatGenres.find(({ node }) => node.value === value)?.path || [];

  function handleSelect(node: GenreNode) {
    onChange(node.value);
    setRecent((prev) => [node.value, ...prev.filter((v) => v !== node.value)].slice(0, 5));
  }

  function handleExpand(value: string) {
    setExpanded((prev) => new Set(prev).add(value));
  }
  function handleCollapse(value: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }

  function renderTree(nodes: GenreNode[], depth = 0) {
    return (
      <ul className={clsx('pl-2', depth === 0 && 'space-y-1')}>{
        nodes.map(node => {
          const isExpanded = expanded.has(node.value);
          const hasChildren = !!node.children?.length;
          const isSelected = value === node.value;
          return (
            <li key={node.value} className={clsx('flex items-center group', isSelected && 'bg-accent/20 rounded')}
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => handleSelect(node)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelect(node);
                  if (e.key === 'ArrowRight' && hasChildren) handleExpand(node.value);
                  if (e.key === 'ArrowLeft' && isExpanded) handleCollapse(node.value);
                }}
                onFocus={() => setFocus(node.value)}
                onBlur={() => setFocus(null)}
            >
              {hasChildren && (
                <button
                  className="mr-1 focus:outline-none"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  tabIndex={-1}
                  onClick={e => { e.stopPropagation(); isExpanded ? handleCollapse(node.value) : handleExpand(node.value); }}
                >
                  <span className="inline-block w-3">{isExpanded ? '▼' : '▶'}</span>
                </button>
              )}
              <span className={clsx('flex-1 cursor-pointer select-none', isSelected && 'font-bold', focus === node.value && 'ring-2 ring-accent')}>{node.name}</span>
              {node.popular && <span className="ml-1 text-yellow-400" title="Popular">★</span>}
            </li>
          );
        })
      }</ul>
    );
  }

  return (
    <div className={clsx('w-full max-w-md bg-white dark:bg-zinc-900 rounded shadow p-4', className)}>
      <div className="flex items-center mb-2">
        <span className="w-4 h-4 mr-2 text-gray-400">🔍</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none"
          placeholder="Search genres..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search genres"
        />
      </div>
      {recent.length > 0 && (
        <div className="mb-2 text-xs text-gray-500">
          Recently used: {recent.map(val => flatGenres.find(({ node }) => node.value === val)?.node.name).filter(Boolean).join(', ')}
        </div>
      )}
      <div className="mb-2 text-xs text-gray-500">
        {selectedPath.length > 0 && (
          <span>Selected: {selectedPath.map(n => n.name).join(' / ')}</span>
        )}
      </div>
      <div className="overflow-y-auto max-h-64" role="tree">
        {renderTree(filtered.length ? filtered.map(f => f.node) : genres)}
      </div>
    </div>
  );
};

export default GenreSelector;