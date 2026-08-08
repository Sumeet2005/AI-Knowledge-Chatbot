import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, ArrowUpRight, Sparkles } from 'lucide-react';

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const LandingFooter = () => {
  const navigate = useNavigate();

  const handleScrollToTop = () => {
    // Scroll smoothly back to top via Lenis scroll capture target
    const wrapper = document.querySelector('#landing-wrapper') || window;
    wrapper.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full z-10 select-none">
      
      {/* ==================================================
          PART 1 — FINAL CTA
          ================================================== */}
      <section className="relative w-full py-24 px-6 md:px-16 overflow-hidden">
        
        {/* Background cyan bloom glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-cyan-500/[0.05] dark:bg-cyan-500/[0.018] blur-[140px]" />
        </div>

        <div className="max-w-[1000px] mx-auto w-full z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="p-8 md:p-14 rounded-[28px] border border-cyan-500/20 dark:border-cyan-500/25 bg-cyan-500/[0.015] dark:bg-[#0c0d12]/50 backdrop-blur-xl shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.4)] flex flex-col items-center text-center gap-6 relative overflow-hidden group"
          >
            
            {/* Hologram badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/40 dark:border-cyan-900/30 w-fit select-none shadow-[0_0_8px_rgba(6,182,212,0.06)]">
              <Sparkles className="w-3.5 h-3.5" />
              PREMIUM RAG INSTANCE
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-2xl leading-[1.1]">
              Ready to Build Your Knowledge Workspace?
            </h2>

            {/* Subheading */}
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Upload your documents, build a private knowledge base, and chat with your data using enterprise-grade Retrieval-Augmented Generation.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <button
                onClick={() => navigate('/workspace')}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-2xl bg-cyan-400 hover:bg-cyan-300 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-slate-950 shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] scale-100 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer border border-transparent"
              >
                <LayoutGrid className="w-4 h-4" />
                Launch Workspace
              </button>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 text-xs font-extrabold rounded-2xl border border-slate-200/60 dark:border-[#1f2433]/60 bg-white/40 dark:bg-[#12151e]/30 hover:bg-white/80 dark:hover:bg-cyan-950/15 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 text-slate-800 dark:text-slate-205 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <GitHubIcon className="w-4 h-4" />
                View GitHub
              </a>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ==================================================
          PART 2 — PREMIUM FOOTER
          ================================================== */}
      <div className="w-full border-t border-slate-200/50 dark:border-border-dark/65 bg-slate-50/20 dark:bg-[#07090d]/30 px-6 md:px-16 py-12">
        <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-12">
          
          {/* Footer Grid links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={handleScrollToTop}>
                <div className="w-7 h-7 rounded-full bg-white/60 dark:bg-slate-900/60 flex items-center justify-center font-bold text-slate-800 dark:text-white border border-slate-200/60 dark:border-slate-800 shadow-sm shrink-0">
                  A
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                  Atlas AI
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[180px]">
                Grounding enterprise models with conceptual knowledge indexes.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white text-[10px] tracking-widest uppercase">
                Navigation
              </span>
              <div className="flex flex-col gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <a href="#pipeline" className="hover:text-cyan-500 transition-colors duration-150">Pipeline</a>
                <a href="#features" className="hover:text-cyan-500 transition-colors duration-150">Features</a>
                <a href="#architecture" className="hover:text-cyan-500 transition-colors duration-150">Architecture</a>
                <a href="#tech" className="hover:text-cyan-500 transition-colors duration-150">Tech Stack</a>
              </div>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white text-[10px] tracking-widest uppercase">
                Resources
              </span>
              <div className="flex flex-col gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors duration-150 flex items-center gap-1">
                  GitHub <ArrowUpRight className="w-2.5 h-2.5" />
                </a>
                <a href="#architecture" className="hover:text-cyan-500 transition-colors duration-150">Documentation</a>
                <a href="#showcase" className="hover:text-cyan-500 transition-colors duration-150">Live Showcase</a>
              </div>
            </div>

            {/* Column 4: Technologies */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white text-[10px] tracking-widest uppercase">
                Technologies
              </span>
              <div className="flex flex-col gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>React 19</span>
                <span>FastAPI</span>
                <span>ChromaDB</span>
                <span>LangChain</span>
                <span>Three.js</span>
              </div>
            </div>

          </div>

          {/* Bottom Row Credits */}
          <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            <span>© 2026 Atlas AI. All rights reserved.</span>
            <span>Built with React, FastAPI, and ChromaDB.</span>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default LandingFooter;
