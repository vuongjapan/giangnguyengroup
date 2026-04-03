import { categories, priceRanges, grades, needsList, statusFilters } from '@/data/products';
import { X, SlidersHorizontal } from 'lucide-react';

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
    <div className="pb-4 border-b border-border last:border-0">
      <h4 className="font-bold text-sm text-foreground mb-2.5">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckboxItem({ label, checked, count, onClick }: { label: string; checked: boolean; count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 text-left py-0.5 group">
      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'bg-primary border-primary' : 'border-muted-foreground/40 group-hover:border-primary/60'
      }`}>
        {checked && <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>}
      </span>
      <span className={`text-sm flex-1 ${checked ? 'text-primary font-medium' : 'text-foreground'}`}>{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </button>
  );
}

export default function FilterSidebar({ filters, onChange, isOpen, onClose }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  const hasAny = Object.values(filters).some(v => v !== null);

  const content = (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> BỘ LỌC
        </h3>
        <div className="flex gap-2 items-center">
          {hasAny && (
            <button onClick={() => onChange({ category: null, priceRange: null, grade: null, need: null, status: null })} className="text-xs text-primary hover:underline font-medium">
              Xóa hết
            </button>
          )}
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FilterSection title="Danh mục sản phẩm">
        {categories.map(c => (
          <CheckboxItem key={c} label={c} checked={filters.category === c} onClick={() => set('category', c)} />
        ))}
      </FilterSection>

      <FilterSection title="Giá sản phẩm">
        {priceRanges.map((r, i) => (
          <CheckboxItem key={i} label={r.label} checked={filters.priceRange === i} onClick={() => set('priceRange', i)} />
        ))}
      </FilterSection>

      <FilterSection title="Phân loại">
        {grades.map(g => (
          <CheckboxItem key={g} label={g} checked={filters.grade === g} onClick={() => set('grade', g)} />
        ))}
      </FilterSection>

      <FilterSection title="Nhu cầu">
        {needsList.map(n => (
          <CheckboxItem key={n} label={n} checked={filters.need === n} onClick={() => set('need', n)} />
        ))}
      </FilterSection>

      <FilterSection title="Trạng thái">
        {statusFilters.map(s => (
          <CheckboxItem key={s.value} label={s.label} checked={filters.status === s.value} onClick={() => set('status', s.value)} />
        ))}
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="bg-card rounded-lg border border-border sticky top-32 overflow-y-auto max-h-[calc(100vh-9rem)]">
          {content}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card overflow-y-auto animate-fade-in shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
