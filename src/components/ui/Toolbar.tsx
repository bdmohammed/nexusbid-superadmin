import { useDeferredValue, useEffect, useState } from 'react';

import type { GridApi } from 'ag-grid-community';
import type { ChangeEvent, RefObject } from 'react';

interface ToolbarProps {
  gridRef: RefObject<{ api: GridApi }>;
}

export const Toolbar = ({ gridRef }: ToolbarProps) => {
  const [quickFilterText, setQuickFilterText] = useState('');
  const deferredQuickFilterText = useDeferredValue(quickFilterText);

  useEffect(() => {
    if (!gridRef.current?.api) {
      return;
    }
    gridRef.current.api.setGridOption('quickFilterText', deferredQuickFilterText);
  }, [deferredQuickFilterText, gridRef]);

  const onFilterChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setQuickFilterText(event.target.value);
  };

  return (
    <div className="px-6 pt-6 pb-4">
      <div className="flex flex-wrap gap-x-6 gap-y-4 items-center">
        <div className="flex flex-col gap-1.5 min-w-[160px] flex-[1_1_320px] min-w-[220px]">
          {/* <label className="text-[12px] tracking-[0.08em] uppercase text-slate-600 font-semibold" htmlFor="global-filter">
                        Filter
                    </label> */}
          <input
            id="global-filter"
            className="rounded-xl border border-slate-900/12 bg-white/86 text-slate-900 py-2.5 px-3 text-sm min-h-[40px] shadow-[0_6px_16px_rgba(15,23,42,0.08)] focus:outline focus:outline-2 focus:outline-blue-600/25 focus:outline-offset-2 placeholder-slate-400"
            placeholder="Filter any column..."
            type="text"
            //@ts-ignore
            onInput={onFilterChanged}
          />
        </div>
      </div>
    </div>
  );
};
