import { useState } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

export const WorkspaceShell = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-workspace-bg-light dark:bg-workspace-bg-dark flex p-6 md:p-8 gap-6 transition-colors duration-300 select-none">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark opacity-100 z-0 pointer-events-none" />

      {/* Subtle Noise Overlay */}
      <div className="absolute inset-0 noise-bg opacity-[0.015] dark:opacity-[0.01] z-0 pointer-events-none" />

      {/* Ambient Cyan Radial Glows */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 dark:bg-cyan-500/[0.03] blur-[150px] pointer-events-none z-0" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.015] blur-[150px] pointer-events-none z-0" />

      {/* Sidebar (Left Column) */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      {/* Content Canvas (Right Column - Floating Workspace Card) */}
      <main className="flex-1 h-full flex flex-col overflow-hidden bg-card-bg-light/75 dark:bg-[#0c0d12]/75 backdrop-blur-xl border border-border-light dark:border-border-dark/80 rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_12px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.7)] z-10 transition-all duration-300">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center gap-3 px-6 h-[56px] border-b border-border-light/40 dark:border-border-dark/30 shrink-0">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open sidebar menu"
            className="p-1.5 rounded-xl border border-border-light/60 dark:border-border-dark/65 bg-card-bg-light/40 dark:bg-card-bg-dark/30 hover:bg-card-bg-light/80 dark:hover:bg-card-bg-dark/50 text-slate-700 dark:text-white outline-none cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 select-none">
            <div className="w-6.5 h-6.5 rounded-full bg-card-bg-light/60 dark:bg-card-bg-dark/60 flex items-center justify-center font-bold text-slate-800 dark:text-white border border-border-light/60 dark:border-border-dark/80 text-xs shrink-0">
              A
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-[12px] tracking-tight leading-none">
              Atlas
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default WorkspaceShell;
