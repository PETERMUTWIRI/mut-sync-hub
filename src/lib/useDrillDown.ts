import { useState } from 'react';

export type DrillSlice = { key: string; value: string | number };

export function useDrillDown(initialData: any[]) {
  const [stack, setStack] = useState<DrillSlice[]>([]);

  const applyFilters = (data: any[]) => {
    if (!Array.isArray(data)) return [];
    return data.filter((row) =>
      stack.every((s) => row[s.key] === s.value)
    );
  };

  const drill = (slice: DrillSlice) => {
    setStack((s) => [...s, slice]);
  };

  const pop = () => setStack((s) => s.slice(0, -1));

  const clear = () => setStack([]);

  return { stack, drill, pop, clear, filtered: applyFilters(initialData || []) };
}