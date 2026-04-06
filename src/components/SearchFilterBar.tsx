import { Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilter: string;
  onFilterChange: (v: string) => void;
}

export default function SearchFilterBar({ search, onSearchChange, activeFilter, onFilterChange }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground text-sm border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
