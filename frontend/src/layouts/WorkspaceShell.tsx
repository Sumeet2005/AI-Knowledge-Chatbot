import { Sidebar } from '../components/sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

export const WorkspaceShell = () => {
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
      <Sidebar />

      {/* Content Canvas (Right Column - Floating Workspace Card) */}
      <main className="flex-1 h-full flex flex-col overflow-hidden bg-card-bg-light/75 dark:bg-[#0c0d12]/75 backdrop-blur-xl border border-border-light dark:border-border-dark/80 rounded-[28px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_12px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.7)] z-10 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkspaceShell;
