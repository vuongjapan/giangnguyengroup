import { categories, priceRanges, grades, needsList, statusFilters } from '@/data/products';
import { X } from 'lucide-react';

interface Filters {
  category: string | null;
  priceRange: number | null;
  grade: string | null;
  need: string | null;
  status: string | null;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  isOpen: boolean;
  onClose: () => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="font-bold text-sm text-foreground uppercase tracking-wide">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterSidebar({ filters, onChange, isOpen, onClose }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  const hasAny = Object.values(filters).some(v => v !== null);

  const content = (
    <div className="space-y-5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-foreground">Bộ lọc</h3>
        <div className="flex gap-2">
          {hasAny && (
            <button onClick={() => onChange({ category: null, priceRange: null, grade: null, need: null, status: null })} className="text-xs text-primary hover:underline">
              Xóa lọc
            </button>
          )}
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FilterSection title="Danh mục">
        {categories.map(c => <FilterBtn key={c} label={c} active={filters.category === c} onClick={() => set('category', c)} />)}
      </FilterSection>

      <FilterSection title="Mức giá">
        {priceRanges.map((r, i) => <FilterBtn key={i} label={r.label} active={filters.priceRange === i} onClick={() => set('priceRange', i)} />)}
      </FilterSection>

      <FilterSection title="Phân loại">
        {grades.map(g => <FilterBtn key={g} label={g} active={filters.grade === g} onClick={() => set('grade', g)} />)}
      </FilterSection>

      <FilterSection title="Nhu cầu">
        {needsList.map(n => <FilterBtn key={n} label={n} active={filters.need === n} onClick={() => set('need', n)} />)}
      </FilterSection>

      <FilterSection title="Trạng thái">
        {statusFilters.map(s => <FilterBtn key={s.value} label={s.label} active={filters.status === s.value} onClick={() => set('status', s.value)} />)}
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-card rounded-xl border border-border sticky top-32">
          {content}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card overflow-y-auto animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
