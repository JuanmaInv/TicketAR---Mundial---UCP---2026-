import React from 'react';

export default function SkeletonMatchCard() {
  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/20">
      <div className="flex justify-between items-center mb-6">
        <div className="w-16 h-6 bg-zinc-800/80 rounded-lg animate-pulse"></div>
        <div className="w-24 h-4 bg-zinc-800/80 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col gap-1 mb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[32px] bg-zinc-800/80 rounded-sm animate-pulse"></div>
            <div className="w-32 h-6 bg-zinc-800/80 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-6 bg-zinc-800/80 rounded animate-pulse"></div>
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[32px] bg-zinc-800/80 rounded-sm animate-pulse"></div>
            <div className="w-32 h-6 bg-zinc-800/80 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="w-48 h-3 bg-zinc-800/80 rounded animate-pulse"></div>
          <div className="w-32 h-2 bg-zinc-800/80 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-white/5">
        <div className="w-24 h-8 bg-zinc-800/80 rounded animate-pulse"></div>
        <div className="w-32 h-12 bg-zinc-800/80 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}
