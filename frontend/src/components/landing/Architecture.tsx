import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Cpu, 
  Workflow, 
  Binary, 
  Database, 
  Search, 
  BrainCircuit, 
  MessageSquare, 
  ChevronRight,
  BookOpen,
  Terminal
} from 'lucide-react';

const architectureNodes = [
  {
    id: 'frontend',
    name: 'Frontend Engine',
    tech: 'React 19 / TypeScript / R3F / Framer Motion',
    purpose: 'Handles rendering user queries, file dropzones, real-time citation matching, and isolated state logic.',
    icon: Globe,
  },
  {
    id: 'api',
    name: 'FastAPI Gateway',
    tech: 'FastAPI / Uvicorn / Async Python',
    purpose: 'Processes request router endpoints, handles authentication headers, and coordinates indexing calls.',
    icon: Terminal,
  },
  {
    id: 'parser',
    name: 'Document Processing',
    tech: 'Python File Parsers / PyPDF / Docx',
    purpose: 'Extracts unicode text sequences and file dimensions from raw PDF, DOCX, and TXT uploads.',
    icon: BookOpen,
  },
  {
    id: 'chunker',
    name: 'Semantic Chunker',
    tech: 'LangChain / Recursive Character Splitting',
    purpose: 'Partitions document strings into context-aligned chunks, retaining overlap parameters.',
    icon: Workflow,
  },
  {
    id: 'embedder',
    name: 'Vector Embedder',
    tech: 'Sentence Transformers / HuggingFace Weights',
    purpose: 'Translates text strings into 1536-dimensional float coordinates reflecting conceptual coordinates.',
    icon: Binary,
  },
  {
    id: 'chroma',
    name: 'ChromaDB Index',
    tech: 'ChromaDB / Vector Database / SQLite',
    purpose: 'Saves coordinate arrays and indices to disk, allowing sub-millisecond similarity queries.',
    icon: Database,
  },
  {
    id: 'retriever',
    name: 'Context Retriever',
    tech: 'FastAPI / Cosine Similarity Filters',
    purpose: 'Translates user questions to vectors and retrieves the top-K corresponding document chunks.',
    icon: Search,
  },
  {
    id: 'llm',
    name: 'LLM Orchestrator',
    tech: 'OpenAI SDK / Custom System Prompts',
    purpose: 'Assembles matching text chunks with user prompt queries, instructing the model to generate citations.',
    icon: BrainCircuit,
  },
  {
    id: 'streamer',
    name: 'SSE Streamer',
    tech: 'FastAPI Server-Sent Events',
    purpose: 'Pipes LLM letter-by-letter outputs to the frontend network connection with latency telemetry.',
    icon: Cpu,
  },
  {
    id: 'answer',
    name: 'Grounded Answer',
    tech: 'Atlas Workspace React view',
    purpose: 'Renders verified outputs in markdown prose with citations mapping back to original chunks.',
    icon: MessageSquare,
  },
];

export const Architecture = () => {
  const [activeNodeId, setActiveNodeId] = useState(architectureNodes[0].id);

  const activeNode = architectureNodes.find((n) => n.id === activeNodeId) || architectureNodes[0];

  return (
    <section id="architecture" className="relative w-full py-24 px-6 md:px-16 overflow-hidden select-none">
      
      {/* Background radial underlay lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-cyan-500/[0.03] dark:bg-cyan-500/[0.015] blur-[150px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.008] blur-[110px]" />
      </div>

      <div className="max-w-[1100px] mx-auto w-full flex flex-col z-10 relative">
        
        {/* Section title header */}
        <div className="flex flex-col items-center text-center gap-2 mb-16 select-none">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enterprise AI Architecture
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-1">
            Explore the end-to-end data flow structure driving document grounding and vector operations.
          </p>
        </div>

        {/* Dashboard Split layout */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch w-full select-none">
          
          {/* Left Column: Interactive Node Map */}
          <div className="flex-1 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2 relative">
            
            {/* Animated Connector Path line */}
            <div className="absolute left-[30px] top-6 bottom-6 w-[1.5px] bg-slate-200/50 dark:bg-slate-800/40 z-0 overflow-hidden">
              <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="w-full h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              />
            </div>

            {architectureNodes.map((node, index) => {
              const Icon = node.icon;
              const isActive = node.id === activeNodeId;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setActiveNodeId(node.id)}
                  onClick={() => setActiveNodeId(node.id)}
                  className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer z-10 ${
                    isActive 
                      ? 'border-cyan-500/35 bg-cyan-500/[0.04] dark:bg-cyan-950/15 shadow-[0_0_12px_rgba(6,182,212,0.03)]' 
                      : 'border-slate-200/50 dark:border-border-dark/65 bg-white/20 dark:bg-[#0c0d12]/20 hover:border-slate-300 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Node Icon badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors duration-200 shrink-0 ${
                      isActive 
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/30 text-cyan-500' 
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">
                        {node.name}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 uppercase leading-none">
                        STAGE 0{index + 1}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-250 ${
                    isActive ? 'text-cyan-500 translate-x-0.5' : 'text-slate-400 opacity-0'
                  }`} />
                </div>
              );
            })}

          </div>

          {/* Right Column: Node Inspector panel */}
          <div className="w-full lg:w-[420px] flex items-stretch">
            <div className="w-full p-6 md:p-8 rounded-2xl border border-cyan-500/20 dark:border-cyan-500/30 bg-cyan-50/5 dark:bg-[#0c0d12]/50 backdrop-blur-md shadow-[0_0_24px_rgba(6,182,212,0.02)] dark:shadow-[0_0_32px_rgba(6,182,212,0.05)] flex flex-col justify-between relative overflow-hidden group">
              
              {/* Internal glow overlay */}
              <div className="absolute -right-[20%] -bottom-[20%] w-[150px] h-[150px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-400/[0.015] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNode.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6"
                >
                  {/* Inspector title */}
                  <div className="flex flex-col gap-1 select-none">
                    <span className="text-[8.5px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest leading-none">
                      NODE INSPECTOR
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                      {activeNode.name}
                    </h3>
                  </div>

                  {/* Core Information blocks */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        COMPILING TECHNOLOGY
                      </span>
                      <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 px-2.5 py-1.5 rounded border border-cyan-200/40 dark:border-cyan-900/30">
                        {activeNode.tech}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        FUNCTIONAL PURPOSE
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {activeNode.purpose}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Inspector bottom label status */}
              <div className="mt-8 border-t border-slate-200/30 dark:border-slate-800/30 pt-4 flex items-center justify-between text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                <span>Active Core Segment</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Architecture;
