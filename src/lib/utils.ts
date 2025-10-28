import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCsv(data: any[], filename: string) {
  if (!data || !data.length) return;
  const keys = Object.keys(data[0]);
  const csv =
    keys.join(',') + '\n' +
    data.map((row: any) => keys.map(k => JSON.stringify(row[k] ?? '')).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
