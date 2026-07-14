import React from 'react';

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/30 p-6 md:p-8 space-y-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-200/80">
        <div className="space-y-3">
          <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse" />
          <div className="h-10 w-64 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-56 bg-zinc-200 rounded animate-pulse" />
        </div>
      </div>

      {/* KPI Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-zinc-200/80 p-4 rounded-xl shadow-sm h-24 flex flex-col justify-center gap-3 animate-pulse">
            <div className="h-3 w-20 bg-zinc-100 rounded" />
            <div className="h-6 w-32 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>

      {/* Operational Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-zinc-200/80 p-5 rounded-xl h-64 animate-pulse" />
        ))}
      </div>

      {/* Bento Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white border border-zinc-200/80 p-5 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
