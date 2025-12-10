// src/components/admin/DataTable.tsx
'use client';

import { useState } from 'react';
import { HiSearch } from 'react-icons/hi';

interface DataTableProps {
  columns: any[];
  data: any[];
  loading: boolean;
  searchable?: boolean;
  searchKeys?: string[];
  filterable?: boolean;
  onRowClick?: (row: any) => void;
}

export function DataTable({ columns, data, loading, searchable, searchKeys, onRowClick }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  if (loading) {
    return <div className="text-center py-12 text-cyan-400">Loading data...</div>;
  }

  const filteredData = data?.filter((row) => {
    if (search && searchKeys) {
      return searchKeys.some(key => 
        String(key.split('.').reduce((o, i) => o?.[i], row)).toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="bg-cockpit-panel/50 rounded-2xl border border-gray-700 overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent pl-10 pr-4 py-2 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cockpit-panel/30 border-b border-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredData?.map((row, idx) => (
              <tr 
                key={row.id || idx} 
                className="hover:bg-cyan-400/5 cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-white">
                    {col.render ? col.render(col.key.split('.').reduce((o: any, i: string) => o?.[i], row), row) : 
                      col.key.split('.').reduce((o: any, i: string) => o?.[i], row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}