import { useChat } from '../../context/ChatContext';

export const IndexStatusCard = () => {
  const { totalChunks, documents, totalSizeFormatted } = useChat();

  return (
    <div className="border border-border-light/50 dark:border-border-dark/60 rounded-2xl p-4 bg-card-bg-light/40 dark:bg-card-bg-dark/40 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-extrabold tracking-[0.18em] text-slate-400 dark:text-slate-500 uppercase leading-none">
          INDEX
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 leading-none">
          <span className="relative flex h-1.5 w-1.5 animate-pulse">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          LIVE
        </div>
      </div>
      <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
        {totalChunks} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">chunks</span>
      </div>
      <div className="text-[10px] font-bold text-slate-550 dark:text-slate-455 mt-1 select-none">
        {documents.length} docs • {totalSizeFormatted}
      </div>
    </div>
  );
};
export default IndexStatusCard;
