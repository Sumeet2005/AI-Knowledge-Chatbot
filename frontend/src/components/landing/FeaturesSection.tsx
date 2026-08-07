import { motion } from 'framer-motion';
import { 
  Search, 
  CheckCircle2, 
  Zap, 
  Link, 
  Files, 
  Layout, 
  XCircle, 
  CheckCircle 
} from 'lucide-react';

const traditionalCons = [
  'Hallucinations & fabricated metrics',
  'No structural document understanding',
  'No citations or origin verification',
  'Generic conversations lacking context',
  'No semantic chunk searching capabilities',
];

const atlasPros = [
  'Grounded responses from real context',
  'Direct origin citations with chunk maps',
  'Semantic search and chunk indexing',
  'Tailored enterprise workspace UI',
  'Completely isolated private knowledge base',
];

const featuresList = [
  {
    title: 'Semantic Search',
    icon: Search,
    description: 'Finds information based on conceptual meaning and document intent rather than exact keyword matches.',
  },
  {
    title: 'Grounded AI Responses',
    icon: CheckCircle2,
    description: 'Filters models output dynamically, matching them against actual context segments to prevent hallucinated answers.',
  },
  {
    title: 'Streaming Chat',
    icon: Zap,
    description: 'Responses stream letter-by-letter, complete with concurrent citation binding to eliminate long processing waits.',
  },
  {
    title: 'Source Citations',
    icon: Link,
    description: 'Every statement displays interactive citation badges mapping directly to target file names and index chunks.',
  },
  {
    title: 'Multi-Format Indexing',
    icon: Files,
    description: 'Upload and parse PDFs, Microsoft Word docx, or raw text logs instantly via optimized FastAPI pipeline parser.',
  },
  {
    title: 'Enterprise Workspace',
    icon: Layout,
    description: 'Designed as a premium cockpit shell featuring collapsible history drawers, telemetry capsules, and theme controls.',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative w-full py-24 px-6 md:px-16 overflow-hidden select-none">
      
      {/* Radial lighting underlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] dark:bg-cyan-500/[0.012] blur-[120px]" />
        <div className="absolute bottom-[30%] right-[10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.008] blur-[110px]" />
      </div>

      <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-24 z-10 relative">
        
        {/* 1. WHY ATLAS COMPARISON */}
        <div className="flex flex-col items-center w-full">
          
          <div className="flex flex-col items-center text-center gap-2 mb-16 select-none">
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
              DESIGN PHILOSOPHY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Why Atlas?
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mt-1">
              Built specifically for structured enterprise knowledge retrieval, not generic chatbots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* Traditional AI Chat Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="p-6 md:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/10 backdrop-blur-md shadow-sm flex flex-col gap-6"
            >
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
                Traditional AI Chat
              </h3>
              
              <ul className="flex flex-col gap-4">
                {traditionalCons.map((con, idx) => (
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    key={idx}
                    className="flex items-start gap-3 text-xs text-slate-500 dark:text-slate-450"
                  >
                    <XCircle className="w-4 h-4 text-red-500/80 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Atlas AI Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="p-6 md:p-8 rounded-2xl border border-cyan-500/20 dark:border-cyan-500/30 bg-cyan-50/10 dark:bg-[#0c0d12]/50 backdrop-blur-md shadow-[0_0_24px_rgba(6,182,212,0.02)] dark:shadow-[0_0_32px_rgba(6,182,212,0.05)] flex flex-col gap-6 relative overflow-hidden group"
            >
              {/* Internal glow */}
              <div className="absolute -right-[15%] -bottom-[15%] w-48 h-48 rounded-full bg-cyan-500/5 dark:bg-cyan-500/[0.015] blur-2xl pointer-events-none" />
              
              <h3 className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Atlas RAG AI
              </h3>

              <ul className="flex flex-col gap-4">
                {atlasPros.map((pro, idx) => (
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    key={idx}
                    className="flex items-start gap-3 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>

        {/* 2. PRODUCT FEATURES GRID */}
        <div className="flex flex-col items-center w-full">
          
          <div className="flex flex-col items-center text-center gap-2 mb-16 select-none">
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
              PRODUCT FEATURES
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Premium Grounding Stack
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
              Every detail is engineered to optimize response accuracy and indexing speeds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {featuresList.map((feature, idx) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.04 }}
                  className="p-5.5 rounded-2xl border border-slate-200/50 dark:border-border-dark/65 bg-white/40 dark:bg-[#0c0d12]/40 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.03)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col gap-3 relative overflow-hidden backdrop-blur-md"
                >
                  {/* Subtle inner radial light overlay */}
                  <div className="absolute -right-[20%] -bottom-[20%] w-[100px] h-[100px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-500/[0.01] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Icon badge */}
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 transition-colors duration-250 shrink-0 shadow-sm">
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {feature.title}
                  </h4>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
