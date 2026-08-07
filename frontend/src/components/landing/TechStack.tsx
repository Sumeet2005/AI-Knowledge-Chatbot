import { motion } from 'framer-motion';
import { 
  Terminal, 
  Cpu, 
  Globe, 
  Layers 
} from 'lucide-react';

const techCategories = [
  {
    title: 'Frontend Engine',
    icon: Globe,
    items: [
      { name: 'React 19', desc: 'Component architecture with fast rendering hooks.' },
      { name: 'TypeScript', desc: 'Strict compiler typing ensuring runtime consistency.' },
      { name: 'Tailwind CSS v4', desc: 'Utility-first styling with hardware-accelerated layouts.' },
      { name: 'Framer Motion', desc: 'Physics-based micro-interactions and view transitions.' },
      { name: 'React Three Fiber', desc: 'Declarative WebGL wrapper rendering R3F canvases.' },
    ],
  },
  {
    title: 'Backend Core',
    icon: Terminal,
    items: [
      { name: 'FastAPI', desc: 'Asynchronous Python gateway with instant auto-documentation.' },
      { name: 'Python 3.11', desc: 'High-performance core driving parsing and extraction scripts.' },
      { name: 'SQLAlchemy', desc: 'Object-Relational mapping for thread model consistency.' },
      { name: 'SQLite', desc: 'File-backed relational db storing index thread metadata.' },
    ],
  },
  {
    title: 'AI & RAG Pipeline',
    icon: Cpu,
    items: [
      { name: 'LangChain', desc: 'Orchestrating prompt flows and context injection steps.' },
      { name: 'ChromaDB', desc: 'Sub-millisecond similarity indices for vector storage.' },
      { name: 'Sentence Transformers', desc: 'Local models compiling textual concepts into coordinates.' },
      { name: 'HuggingFace', desc: 'Hosted/local transformer weights mapping vector coordinates.' },
      { name: 'Vector Search', desc: 'Mathematical cosine indexing matching similar text segments.' },
    ],
  },
  {
    title: 'Future Roadmap',
    icon: Layers,
    items: [
      { name: 'Docker', desc: 'Isolating backend gateways and vector indexes in containers.' },
      { name: 'Redis', desc: 'Fast caching tier for repetitive semantic queries.' },
      { name: 'PostgreSQL', desc: 'Enterprise scaling for relational threads and telemetry logs.' },
      { name: 'CI/CD Pipelines', desc: 'Automatic linting, build runs, and container testing.' },
    ],
  },
];

export const TechStack = () => {
  return (
    <section id="tech" className="relative w-full py-24 px-6 md:px-16 overflow-hidden select-none">
      
      {/* Background underlay glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] dark:bg-cyan-500/[0.012] blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.008] blur-[110px]" />
      </div>

      <div className="max-w-[1100px] mx-auto w-full flex flex-col items-center z-10 relative">
        
        {/* Section Title Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-16 select-none">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
            ENGINEERING STACK
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built With Modern AI Technologies
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-1">
            Atlas combines enterprise-grade AI infrastructure with high-performance frontend engineering.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {techCategories.map((category, catIdx) => {
            const CatIcon = category.icon;
            
            return (
              <motion.div
                key={catIdx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: catIdx * 0.06 }}
                className="p-6 md:p-8 rounded-2xl border border-slate-200/50 dark:border-border-dark/65 bg-white/40 dark:bg-[#0c0d12]/40 backdrop-blur-md shadow-sm hover:border-cyan-500/30 dark:hover:border-cyan-500/25 transition-all duration-300 flex flex-col gap-6"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white tracking-tight uppercase">
                    {category.title}
                  </h3>
                </div>

                {/* Technology Items List */}
                <div className="flex flex-col gap-4">
                  {category.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      className="flex flex-col gap-1 hover:pl-1.5 transition-all duration-200 group"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors duration-150 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 group-hover:bg-cyan-500 transition-colors duration-150" />
                        {item.name}
                      </span>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-450 leading-relaxed pl-3.5">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default TechStack;
