import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DateFilterType = 'LATEST' | 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'OLDER' | 'CUSTOM';

interface DateFilterDropdownProps {
  value: DateFilterType;
  onChange: (value: DateFilterType, from?: string, to?: string) => void;
  from?: string;
  to?: string;
}

const FILTER_LABELS: Record<DateFilterType, string> = {
  LATEST: 'Latest',
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  LAST_7_DAYS: 'Last 7 Days',
  LAST_30_DAYS: 'Last 30 Days',
  OLDER: 'Older Articles',
  CUSTOM: 'Custom Date Range'
};

export default function DateFilterDropdown({ value, onChange, from, to }: DateFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);
  const [customFrom, setCustomFrom] = useState(from || '');
  const [customTo, setCustomTo] = useState(to || '');
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (filter: DateFilterType) => {
    if (filter !== 'CUSTOM') {
      onChange(filter);
      setIsOpen(false);
      setIsCustomExpanded(false);
    } else {
      setIsCustomExpanded(!isCustomExpanded);
    }
  };

  const applyCustomRange = () => {
    setError('');
    if (!customFrom || !customTo) {
      setError('Both dates are required');
      return;
    }
    if (customFrom > customTo) {
      setError('From date must be before To date');
      return;
    }
    onChange('CUSTOM', customFrom, customTo);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
        {FILTER_LABELS[value]}
        <span className="material-symbols-outlined text-[18px]">expand_more</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-64 rounded-xl border border-border bg-card p-1 shadow-elevated right-0 sm:left-0 sm:right-auto"
          >
            <div className="flex flex-col space-y-1">
              {(Object.keys(FILTER_LABELS) as DateFilterType[]).map((filterKey) => (
                <div key={filterKey}>
                  <button
                    onClick={() => handleSelect(filterKey)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      value === filterKey ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {FILTER_LABELS[filterKey]}
                    {value === filterKey && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                  
                  {filterKey === 'CUSTOM' && isCustomExpanded && (
                    <div className="px-3 py-3 mt-1 mb-1 border-t border-b border-border/50 space-y-3 bg-muted/20 rounded-md">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">From</label>
                        <input 
                          type="date" 
                          value={customFrom}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">To</label>
                        <input 
                          type="date" 
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      {error && <p className="text-xs text-destructive">{error}</p>}
                      <button 
                        onClick={applyCustomRange}
                        className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Apply Range
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
