import { Search } from 'lucide-react';

interface SearchBarProps {
  compact?: boolean;
}

export default function SearchBar({ compact = false }: SearchBarProps) {
  const openSearch = () => {
    window.dispatchEvent(new Event('SentriX:open-search'));
  };

  return (
    <button
      type="button"
      className={['workspace-search-trigger', compact ? 'compact' : ''].filter(Boolean).join(' ')}
      onClick={openSearch}
      aria-label="Open global search"
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+K"
      title={compact ? 'Search standards, gaps, policies (Ctrl + K)' : undefined}
    >
      <Search size={16} aria-hidden="true" />
      {!compact && (
        <>
          <span className="workspace-search-placeholder">Search standards, gaps, policies...</span>
          <span className="workspace-search-shortcut" aria-hidden="true">Ctrl + K</span>
        </>
      )}
    </button>
  );
}