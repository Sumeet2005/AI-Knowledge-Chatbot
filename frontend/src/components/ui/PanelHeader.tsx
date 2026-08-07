interface PanelHeaderProps {
  title: string;
  subtitle: string;
}

export const PanelHeader = ({ title, subtitle }: PanelHeaderProps) => {
  return (
    <header className="h-[64px] border-b border-slate-200/50 dark:border-[#1f2433]/30 flex items-center justify-between px-6 bg-white/30 dark:bg-[#0c0f17]/30 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.01)] select-none z-10">
      <div className="flex flex-col justify-center">
        <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
          {title}
        </h1>
        <span className="text-[8px] font-extrabold tracking-[0.22em] text-slate-400 dark:text-slate-500 uppercase leading-none">
          {subtitle}
        </span>
      </div>
      
      {/* RAG Grounded Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/45 backdrop-blur-sm border border-slate-200/60 dark:border-[#1f2433]/60 shadow-[0_0_8px_rgba(6,182,212,0.05)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)] animate-pulse"></span>
        RAG
        <span className="text-slate-350 dark:text-slate-655">•</span>
        GROUNDED
      </div>
    </header>
  );
};
