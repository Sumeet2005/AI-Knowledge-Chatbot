import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLaunch = () => {
    navigate('/workspace');
  };

  return (
    <nav className="sticky top-4 z-50 w-[94vw] max-w-[1140px] h-[68px] mx-auto px-10 flex items-center bg-white/30 dark:bg-[#08090d]/35 backdrop-blur-3xl border-t border-t-cyan-400/45 border border-white/20 dark:border-white/10 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_25px_60px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_30px_70px_rgba(0,0,0,0.55)] select-none">
      
      {/* Column 1: Brand logo - aligns left */}
      <div className="flex-1 flex justify-start items-center">
        <div className="flex items-center gap-3.5 cursor-pointer mr-10" onClick={() => navigate('/')}>
          <div className="w-7.5 h-7.5 rounded-full bg-white/60 dark:bg-slate-900/60 flex items-center justify-center font-bold text-slate-800 dark:text-white border border-slate-200/65 dark:border-slate-800 shadow-[0_2px_8px_rgba(6,182,212,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] shrink-0">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white text-[14px] tracking-tight leading-none mb-0.5">
              Atlas
            </span>
            <span className="text-[7px] font-extrabold tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase leading-none">
              AI LANDING
            </span>
          </div>
        </div>
      </div>

      {/* Column 2: Navigation center items - mathematically centered */}
      <div className="hidden md:flex items-center gap-[44px] text-xs font-bold text-slate-500 dark:text-slate-400 justify-center">
        <a href="#pipeline" className="relative hover:text-slate-950 dark:hover:text-white transition-colors duration-250 py-1 group">
          Pipeline
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300 rounded-full" />
        </a>
        <a href="#features" className="relative hover:text-slate-950 dark:hover:text-white transition-colors duration-250 py-1 group">
          Features
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300 rounded-full" />
        </a>
        <a href="#architecture" className="relative hover:text-slate-950 dark:hover:text-white transition-colors duration-250 py-1 group">
          Architecture
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300 rounded-full" />
        </a>
        <a href="#tech" className="relative hover:text-slate-950 dark:hover:text-white transition-colors duration-250 py-1 group">
          Tech Stack
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300 rounded-full" />
        </a>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="relative hover:text-slate-950 dark:hover:text-white transition-colors duration-250 py-1 group"
        >
          GitHub
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300 rounded-full" />
        </a>
      </div>

      {/* Column 3: Action controls - aligns right */}
      <div className="flex-1 flex justify-end items-center gap-3.5">
        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="p-1.5 rounded-lg border border-slate-200/65 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer shadow-sm shrink-0"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
        </button>

        {/* Action button with min-w-[180px] and 12px right margin */}
        <button
          onClick={handleLaunch}
          style={{ background: 'linear-gradient(135deg, #18D8F8, #00C2FF, #14F195)' }}
          className="flex items-center justify-center gap-1.5 min-w-[180px] mr-[12px] px-4 py-2 text-[11px] font-extrabold rounded-full text-white shadow-[0_0_12px_rgba(24,216,248,0.35)] hover:shadow-[0_0_20px_rgba(24,216,248,0.55)] scale-100 hover:scale-105 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0 shrink-0"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-white" />
          Launch Workspace
        </button>
      </div>

    </nav>
  );
};

export default LandingNavbar;
