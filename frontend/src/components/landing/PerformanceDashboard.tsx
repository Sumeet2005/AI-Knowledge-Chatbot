import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Zap, 
  BookOpen, 
  Cpu, 
  Files, 
  Binary, 
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';

// Lightweight pure React count-up component triggered when in viewport
const CountUp = ({ target, suffix = '', duration = 1200 }: { target: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    const totalSteps = 60;
    const stepTime = Math.max(duration / totalSteps, 16); // cap at 60fps frame budget
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const metricsList = [
  {
    title: 'Semantic Search Speed',
    icon: Zap,
    target: 145,
    suffix: 'ms',
    desc: 'Average similarity cosine calculation and context retrieval speeds.',
  },
  {
    title: 'Source Traceability',
    icon: BookOpen,
    target: 100,
    suffix: '%',
    desc: 'Every response is mapped back to the origin source document chunks.',
  },
  {
    title: 'Streaming Speed',
    icon: Cpu,
    target: 45,
    suffix: ' tok/s',
    desc: 'High-frequency Server-Sent Events output streaming.',
  },
  {
    title: 'Document Parser Capacity',
    icon: Files,
    target: 10,
    suffix: ' MB',
    desc: 'Max size limit supported per document upload indexing path.',
  },
  {
    title: 'Vector Embeddings Dimension',
    icon: Binary,
    target: 1536,
    suffix: ' dim',
    desc: 'Dense mapping coordinates captured in vectors.',
  },
  {
    title: 'Private Database Isolation',
    icon: Lock,
    target: 100,
    suffix: '%',
    desc: 'Self-contained SQLite and Chroma vector db instances.',
  },
];

export const PerformanceDashboard = () => {
  const [indexProgress, setIndexProgress] = useState(25);
  const [indexStage, setIndexStage] = useState<'uploading' | 'processing' | 'embedding' | 'indexed'>('uploading');

  // Simulated continuous looping indexing workflow
  useEffect(() => {
    const timer = setInterval(() => {
      setIndexProgress((prev) => {
        const next = prev + 25;
        if (next > 100) {
          setIndexStage('uploading');
          return 25;
        }
        
        if (next === 50) setIndexStage('processing');
        if (next === 75) setIndexStage('embedding');
        if (next === 100) setIndexStage('indexed');

        return next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="performance" className="relative w-full py-24 px-6 md:px-16 overflow-hidden select-none">
      
      {/* Background radial underlay glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] dark:bg-cyan-500/[0.015] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.008] blur-[110px]" />
      </div>

      <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-16 z-10 relative">
        
        {/* Section Title Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-4 select-none">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
            BENCHMARKS
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Performance & Capabilities
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-1">
            Built for fast, grounded, enterprise AI experiences.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full select-none">
          
          {/* Left Column: 6 Benchmarks Grid (spans 2 columns on large screens) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            {metricsList.map((metric, idx) => {
              const Icon = metric.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.05 }}
                  className="p-5.5 rounded-2xl border border-slate-200/50 dark:border-border-dark/65 bg-white/40 dark:bg-[#0c0d12]/40 backdrop-blur-md hover:border-cyan-500/35 dark:hover:border-cyan-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.03)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-2.5 relative overflow-hidden"
                >
                  <div className="absolute -right-[20%] -bottom-[20%] w-[100px] h-[100px] rounded-full bg-cyan-500/[0.03] dark:bg-cyan-500/[0.008] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Icon & Label row */}
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-450 text-[11px] font-extrabold tracking-tight">
                    <Icon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>{metric.title}</span>
                  </div>

                  {/* Counter Value */}
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono leading-none tracking-tight">
                    {metric.target === 100 && metric.suffix === '%' ? (
                      <CountUp target={100} suffix="%" />
                    ) : metric.target === 145 ? (
                      <span className="flex items-center">
                        &lt;
                        <CountUp target={150} suffix="ms" />
                      </span>
                    ) : (
                      <CountUp target={metric.target} suffix={metric.suffix} />
                    )}
                  </div>

                  <p className="text-[10.5px] text-slate-500 dark:text-slate-450 leading-relaxed mt-0.5">
                    {metric.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Indexing Simulator Console Card */}
          <div className="flex items-stretch w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="w-full p-6 md:p-8 rounded-2xl border border-cyan-500/20 dark:border-cyan-500/30 bg-cyan-50/5 dark:bg-[#0c0d12]/50 backdrop-blur-md shadow-[0_0_24px_rgba(6,182,212,0.02)] dark:shadow-[0_0_32px_rgba(6,182,212,0.05)] flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute -right-[15%] -bottom-[15%] w-[120px] h-[120px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-400/[0.015] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Title Header */}
              <div className="flex flex-col gap-1 select-none">
                <span className="text-[8px] font-extrabold text-cyan-600 dark:text-cyan-400 tracking-widest leading-none">
                  INDEXING SIMULATOR
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  Active RAG Grounding
                </h3>
              </div>

              {/* Simulation steps */}
              <div className="flex flex-col gap-5 my-8">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {indexStage === 'indexed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-cyan-500 animate-spin shrink-0" />
                    )}
                    <span className="capitalize">{indexStage}...</span>
                  </div>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">{indexProgress}%</span>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/20 dark:border-slate-800/20 overflow-hidden relative">
                  <motion.div
                    animate={{ width: `${indexProgress}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      indexStage === 'indexed' 
                        ? 'from-emerald-500 to-teal-500' 
                        : 'from-cyan-500 to-indigo-500'
                    }`}
                  />
                </div>

                {/* Micro checklist tracker */}
                <div className="flex flex-col gap-2 border-t border-slate-200/20 dark:border-slate-800/20 pt-4 text-[10px] font-semibold text-slate-500 dark:text-slate-450">
                  <div className="flex items-center justify-between">
                    <span>1. FastAPI Parser upload</span>
                    <span className={indexProgress >= 25 ? 'text-emerald-500' : 'text-slate-400'}>
                      {indexProgress >= 25 ? 'OK' : 'WAIT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2. Semantic text partitioning</span>
                    <span className={indexProgress >= 50 ? 'text-emerald-500' : 'text-slate-400'}>
                      {indexProgress >= 50 ? 'OK' : 'WAIT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3. HuggingFace weight embed</span>
                    <span className={indexProgress >= 75 ? 'text-emerald-500' : 'text-slate-400'}>
                      {indexProgress >= 75 ? 'OK' : 'WAIT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span>4. ChromaDB insertion</span>
                    <span className={indexProgress === 100 ? 'text-emerald-500' : 'text-slate-400'}>
                      {indexProgress === 100 ? 'READY' : 'WAIT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status footer details */}
              <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-4 flex items-center justify-between text-[8px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider select-none">
                <span>Simulator Live status</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LOOPING
                </div>
              </div>

            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PerformanceDashboard;
