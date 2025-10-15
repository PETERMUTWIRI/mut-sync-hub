"use client";
import React, { useEffect, useState } from 'react';


interface DataSourcesProps {
  orgId?: string;
}

const DataSources: React.FC<DataSourcesProps> = ({ orgId }) => {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    fetch(`/api/data-sources/${orgId}`)
      .then(res => res.json())
      .then(data => setDataSources(data))
      .catch(() => setDataSources([]))
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center w-full h-full animate-pulse">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2 text-cyan-400 animate-spin-slow"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
      <span className="text-lg font-semibold text-gray-300 mb-2">Loading Data Sources...</span>
    </div>
  );

  if (dataSources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in">
        <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-3 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="text-lg font-semibold text-gray-400 mb-2">No Data Sources Connected</span>
        <span className="text-sm text-gray-500">Connect your first data source to get started.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in">
      <h2 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
        Data Sources
        <span className="relative group">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-cyan-400 cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
          <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-gray-900 text-xs text-white rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">Number of unique data sources connected to your organization.</span>
        </span>
      </h2>
      <div className="text-4xl font-extrabold text-white mb-1 transition-transform duration-300 hover:scale-110 cursor-pointer">
        {dataSources.length}
      </div>
      <div className="text-sm text-gray-400">Total Connected</div>
    </div>
  );
};

export default DataSources;
