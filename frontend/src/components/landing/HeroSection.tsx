import { lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { LayoutGrid, ArrowRight, Loader2, Search, Sparkles, CheckCircle, Database } from 'lucide-react';

const ThreeCanvas = lazy(() => import('./ThreeCanvas'));

export const HeroSection = () => {
  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 200 };
  const textX = useSpring(mouseX, springConfig);
  const textY = useSpring(mouseY, springConfig);
  const cardX = useSpring(useMotionValue(0), { damping: 65, stiffness: 150 });
  const cardY = useSpring(useMotionValue(0), { damping: 65, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientWidth, clientHeight } = document.documentElement;
      const x = (e.clientX / clientWidth - 0.5) * 16;
      const y = (e.clientY / clientHeight - 0.5) * 16;
      mouseX.set(x);
      mouseY.set(y);
      cardX.set(x * 0.35);
      cardY.set(y * 0.35);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, cardX, cardY]);

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center justify-between pl-6 md:pl-[100px] pr-6 md:pr-[64px] py-12 md:py-24 overflow-hidden select-none z-10">

      {/* Left Column — 60% width */}
      <motion.div
        style={{ x: textX, y: textY }}
        className="w-full md:w-[60%] md:max-w-[60%] flex-shrink-0 flex flex-col gap-6 text-left z-10"
      >
        {/* Hologram badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/40 dark:border-cyan-900/30 w-fit shadow-[0_0_8px_rgba(6,182,212,0.06)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)] animate-pulse" />
          ACTIVE GRAPHIC CORE
        </motion.div>

        {/* Title — reduced to 63px (17% reduction), max-w-620px, line-height 1.02 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-[63px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.02] max-w-[620px]"
        >
          Enterprise AI{' '}
          <br />
          <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
            Knowledge Workspace
          </span>
        </motion.h1>

        {/* Subtitle — max-w-470px */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
          className="text-sm md:text-[16px] text-slate-600 dark:text-slate-400 max-w-[470px] leading-relaxed"
        >
          Unlock answers from your documents grounded with high-precision RAG indexing.
          Track latency, verify source citations, and explore your workspace with zero configuration.
        </motion.p>

        {/* CTA Buttons - Aligned with the paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="flex flex-wrap items-center gap-4 mt-4"
        >
          {/* Launch Workspace with premium cyan gradient and white text */}
          <button
            onClick={() => navigate('/workspace')}
            style={{ background: 'linear-gradient(135deg, #18D8F8, #00C2FF, #14F195)' }}
            className="group/btn relative overflow-hidden flex items-center gap-2 px-7 py-3.5 text-xs font-extrabold rounded-2xl text-white shadow-[0_0_32px_rgba(24,216,248,0.45)] hover:shadow-[0_0_48px_rgba(24,216,248,0.75)] scale-100 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover/btn:animate-shine-sweep" />
            <LayoutGrid className="w-4 h-4 text-white" />
            Launch Workspace
          </button>

          {/* Explore Architecture - Premium dark glass */}
          <a
            href="#architecture"
            style={{ backgroundColor: 'rgba(20, 24, 35, 0.85)' }}
            className="group/btn-sec flex items-center gap-2 px-7 py-3.5 text-xs font-bold rounded-2xl border border-[#00ffff]/40 backdrop-blur-xl hover:border-[#00ffff]/80 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_0_24px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Explore Architecture
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn-sec:translate-x-1 transition-transform duration-200" />
          </a>
        </motion.div>
      </motion.div>

      {/* Right Column — 40% width, shifted 100px left for balance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.1, ease: 'easeOut' }}
        className="w-full md:w-[40%] md:max-w-[40%] flex-shrink-0 relative z-10 flex items-center justify-center mt-14 md:mt-0 md:-translate-x-[68px]"
      >
        {/* Underlay glow */}
        <div className="absolute w-64 h-64 rounded-full bg-cyan-500/8 dark:bg-cyan-500/[0.018] blur-[80px] pointer-events-none" />

        {/* Card 1 — Semantic Search — top-left of orb, safe zone (shifted down 30px) */}
        <motion.div
          style={{ x: cardX, y: cardY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.92, scale: 1, y: [0, -14, 0], rotate: [-2.5, 2.5, -2.5] }}
          transition={{
            y: { duration: 7.0, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 7.0, ease: 'easeInOut', repeat: Infinity },
            default: { delay: 1.35, duration: 0.6 },
          }}
          className="absolute top-[calc(6%+30px)] left-[4%] bg-white/50 dark:bg-[#0c0e14]/55 border border-white/25 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_28px_rgba(6,182,212,0.10)] hover:shadow-[0_8px_32px_rgba(6,182,212,0.22)] rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 pointer-events-auto transition-shadow duration-300"
        >
          <Search className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span>Semantic Search</span>
        </motion.div>

        {/* Card 2 — RAG Enabled — top-right (no adjustment required) */}
        <motion.div
          style={{ x: cardX, y: cardY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.95, scale: 1, y: [0, 13, 0], rotate: [2.5, -2, 2.5] }}
          transition={{
            y: { duration: 7.8, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 7.8, ease: 'easeInOut', repeat: Infinity },
            default: { delay: 1.45, duration: 0.6 },
          }}
          className="absolute top-[8%] right-[4%] bg-white/50 dark:bg-[#0c0e14]/55 border border-white/25 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_28px_rgba(16,185,129,0.10)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.22)] rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 pointer-events-auto transition-shadow duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>RAG Enabled</span>
        </motion.div>

        {/* Card 3 — ChromaDB — mid-left (shifted left 20px) */}
        <motion.div
          style={{ x: cardX, y: cardY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.85, scale: 1, y: [0, -11, 0], rotate: [-2, 2, -2] }}
          transition={{
            y: { duration: 6.4, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 6.4, ease: 'easeInOut', repeat: Infinity },
            default: { delay: 1.55, duration: 0.6 },
          }}
          className="absolute top-[38%] left-[calc(2%-20px)] bg-white/50 dark:bg-[#0c0e14]/55 border border-white/25 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_28px_rgba(59,130,246,0.08)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.20)] rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 pointer-events-auto transition-shadow duration-300"
        >
          <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>ChromaDB</span>
        </motion.div>

        {/* Card 4 — Streaming — mid-right (shifted left 25px) */}
        <motion.div
          style={{ x: cardX, y: cardY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.90, scale: 1, y: [0, 12, 0], rotate: [2, -2.5, 2] }}
          transition={{
            y: { duration: 8.1, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 8.1, ease: 'easeInOut', repeat: Infinity },
            default: { delay: 1.65, duration: 0.6 },
          }}
          className="absolute top-[40%] right-[calc(2%+25px)] bg-white/50 dark:bg-[#0c0e14]/55 border border-white/25 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_28px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.20)] rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 pointer-events-auto transition-shadow duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Streaming</span>
        </motion.div>

        {/* Card 5 — Source Verified — bottom-left (shifted up 30px) */}
        <motion.div
          style={{ x: cardX, y: cardY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.88, scale: 1, y: [0, 10, 0], rotate: [1.5, -2, 1.5] }}
          transition={{
            y: { duration: 6.8, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 6.8, ease: 'easeInOut', repeat: Infinity },
            default: { delay: 1.75, duration: 0.6 },
          }}
          className="absolute bottom-[calc(12%+30px)] left-[4%] bg-white/50 dark:bg-[#0c0e14]/55 border border-white/25 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_28px_rgba(59,130,246,0.08)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.20)] rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 pointer-events-auto transition-shadow duration-300"
        >
          <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Source Verified</span>
        </motion.div>

        {/* Card 6 — Documents Indexed — bottom-right (shifted up 40px) */}
        <motion.div
          style={{ x: cardX, y: cardY }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.88, scale: 1, y: [0, -12, 0], rotate: [-2, 2, -2] }}
          transition={{
            y: { duration: 7.5, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 7.5, ease: 'easeInOut', repeat: Infinity },
            default: { delay: 1.85, duration: 0.6 },
          }}
          className="absolute bottom-[calc(10%+40px)] right-[4%] bg-white/50 dark:bg-[#0c0e14]/55 border border-white/25 dark:border-slate-700/50 backdrop-blur-xl shadow-[0_8px_28px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.20)] rounded-2xl px-3.5 py-2 flex items-center gap-2 text-[10px] font-bold text-slate-800 dark:text-slate-200 z-20 pointer-events-auto transition-shadow duration-300"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Documents Indexed</span>
        </motion.div>

        {/* 3D Canvas */}
        <Suspense
          fallback={
            <div className="w-64 h-64 flex items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          }
        >
          <ThreeCanvas />
        </Suspense>
      </motion.div>
    </section>
  );
};

export default HeroSection;
