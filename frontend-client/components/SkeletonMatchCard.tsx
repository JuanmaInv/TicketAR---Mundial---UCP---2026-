export default function SkeletonMatchCard() {
  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-gray-100 bg-white">
      <div className="flex justify-between items-center mb-6">
        <div className="w-16 h-6 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col gap-1 mb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[32px] bg-slate-200 rounded-sm animate-pulse"></div>
            <div className="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-6 bg-slate-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-3">
            <div className="w-[44px] h-[32px] bg-slate-200 rounded-sm animate-pulse"></div>
            <div className="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="w-48 h-3 bg-slate-200 rounded animate-pulse"></div>
          <div className="w-32 h-2 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <div className="w-24 h-8 bg-slate-200 rounded animate-pulse"></div>
        <div className="w-32 h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}

