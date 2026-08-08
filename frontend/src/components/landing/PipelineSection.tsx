import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, 
  FileSearch, 
  Columns3, 
  Cpu, 
  Database, 
  Search, 
  BrainCircuit, 
  MessageSquareCode,
  Clock,
  Terminal,
  Activity
} from 'lucide-react';

const pipelineStages = [
  {
    id: 1,
    title: 'Upload Document',
    label: 'Upload',
    purpose: 'Raw ingestion of unstructured user knowledge bases',
    technology: 'FastAPI, File Dropzone API, Binary Streams',
    latency: '< 50ms',
    description: 'Accepts PDF, DOCX, TXT, or markdown files directly from the browser dropzone, routing raw buffers to isolated backend processors.',
    icon: FileUp
  },
  {
    id: 2,
    title: 'Document Parsing',
    label: 'Parse',
    purpose: 'Extracting clean structural markdown from document layers',
    technology: 'PyMuPDF, python-docx, layout-parsers',
    latency: '150ms – 400ms',
    description: 'Parses document layouts, tables, and raw textual vectors, standardizing headers, paragraphs, and lists into markdown streams.',
    icon: FileSearch
  },
  {
    id: 3,
    title: 'Smart Chunking',
    purpose: 'Decomposing text into context-rich semantic units',
    label: 'Chunk',
    technology: 'RecursiveCharacterTextSplitter, Overlap Calculators',
    latency: '15ms – 30ms',
    description: 'Splits raw text into semantically complete chunks with dynamic boundary detection, keeping meta tags and parent references intact.',
    icon: Columns3
  },
  {
    id: 4,
    title: 'Vector Embeddings',
    label: 'Embeddings',
    purpose: 'Mapping text context to mathematical space',
    technology: 'OpenAI text-embedding-3-small, HF Transformers',
    latency: '80ms – 160ms',
    description: 'Computes high-dimensional vector coordinates for text blocks, embedding contextual semantic relevance into float tensors.',
    icon: Cpu
  },
  {
    id: 5,
    title: 'Chroma Indexing',
    label: 'Vector DB',
    purpose: 'High-speed storage and indexing of text vectors',
    technology: 'ChromaDB, HNSW indexing engine',
    latency: '< 10ms',
    description: 'Indexes embedded coordinates and metadata tags in ChromaDB databases, preparing elements for rapid mathematical query retrievals.',
    icon: Database
  },
  {
    id: 6,
    title: 'Context Retrieval',
    label: 'Retriever',
    purpose: 'Fetching closest matching context passages',
    technology: 'Cosine Similarity Search, K-Nearest Neighbors',
    latency: '20ms – 45ms',
    description: 'Converts user prompt to vector coordinate space and matches the closest contextual paragraphs inside ChromaDB in real-time.',
    icon: Search
  },
  {
    id: 7,
    title: 'LLM Synthesis',
    label: 'LLM',
    purpose: 'Synthesizing context sources into natural answers',
    technology: 'Claude 3.5 Sonnet, Gemini 1.5 Pro inference',
    latency: '700ms – 1400ms',
    description: 'Combines the user prompt and matched document passages into prompt templates, triggering LLM inference to draft answers.',
    icon: BrainCircuit
  },
  {
    id: 8,
    title: 'Cited Response',
    label: 'Answer',
    purpose: 'Delivering verified response with trace citations',
    technology: 'Citation Resolver, Reference link mapper',
    latency: '< 5ms',
    description: 'Presents verified answer text directly referencing exact original text sources, allowing the user to trace any phrase to its source document.',
    icon: MessageSquareCode
  }
];

export const PipelineSection = () => {
  const [activeNodeId, setActiveNodeId] = useState(1);
  const [connectionsVisible, setConnectionsVisible] = useState(false);

  useEffect(() => {
    // delay connections animation until nodes fade in
    const timer = setTimeout(() => {
      setConnectionsVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const activeNode = pipelineStages.find(stage => stage.id === activeNodeId) || pipelineStages[0];

  return (
    <section id="pipeline" className="relative w-full py-28 px-6 md:px-16 overflow-hidden select-none bg-transparent">
      
      {/* Background radial underlay lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[30%] left-[5%] w-[450px] h-[450px] rounded-full bg-cyan-500/[0.035] dark:bg-cyan-500/[0.009] blur-[130px]" />
        <div className="absolute bottom-[30%] right-[5%] w-[450px] h-[450px] rounded-full bg-emerald-500/[0.035] dark:bg-emerald-500/[0.007] blur-[120px]" />
      </div>

      <div className="max-w-[1140px] mx-auto w-full flex flex-col items-center z-10 relative">
        
        {/* Section Title */}
        <div className="flex flex-col items-center text-center gap-2 mb-20 select-none">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
            RAG DATAPATH FLOW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interactive AI Pipeline
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mt-2">
            See how Atlas converts raw files into fully grounded, cited answers through our RAG architecture.
          </p>
        </div>

        {/* 1. Desktop Horizontal Pipeline Layout (8 nodes in a single row) */}
        <div className="hidden lg:block relative w-full mb-12 select-none py-10">
          {/* Animated Connecting Line - Behind Nodes */}
          <div className="absolute left-[5%] right-[5%] h-[2px] bg-slate-200/40 dark:bg-slate-800/40 top-[52px] z-0 overflow-hidden rounded-full">
            {connectionsVisible && (
              <>
                <motion.div
                  animate={{ left: ['-10%', '110%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[8px] h-[8px] rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] -translate-y-[3px]"
                />
                <motion.div
                  animate={{ left: ['-10%', '110%'] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                  className="absolute w-[6px] h-[6px] rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] -translate-y-[2px]"
                />
                <motion.div
                  animate={{ left: ['-10%', '110%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.8 }}
                  className="absolute w-[5px] h-[5px] rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] -translate-y-[1.5px]"
                />
              </>
            )}
          </div>

          {/* Nodes Container */}
          <div className="flex justify-between items-start w-full relative z-10">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeNodeId === stage.id;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.08 }}
                  onMouseEnter={() => setActiveNodeId(stage.id)}
                  className="flex flex-col items-center gap-3.5 cursor-pointer group z-10 w-[90px]"
                >
                  <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center bg-white/50 dark:bg-[#0c0e14]/50 border ${
                    isActive 
                      ? 'border-cyan-400/80 shadow-[0_0_24px_rgba(34,211,238,0.35)] scale-105' 
                      : 'border-white/20 dark:border-slate-800/60'
                  } backdrop-blur-xl group-hover:border-cyan-500/80 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.22)] transition-all duration-300 transform group-hover:-translate-y-1`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500 dark:text-slate-400'} group-hover:text-cyan-400 transition-colors duration-300`} />
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight text-center ${
                    isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'
                  } group-hover:text-cyan-500 transition-colors`}>
                    {stage.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 2. Tablet Grid Layout (2 rows of 4 nodes) */}
        <div className="hidden md:block lg:hidden relative w-full mb-12 select-none py-6">
          {/* Connecting Lines Behind Row 1 & 2 */}
          <div className="absolute left-[8%] right-[8%] h-[2px] bg-slate-200/40 dark:bg-slate-800/40 top-[52px] z-0 overflow-hidden rounded-full">
            {connectionsVisible && (
              <motion.div
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 3.0, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[8px] h-[8px] rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] -translate-y-[3px]"
              />
            )}
          </div>
          <div className="absolute left-[8%] right-[8%] h-[2px] bg-slate-200/40 dark:bg-slate-800/40 top-[204px] z-0 overflow-hidden rounded-full">
            {connectionsVisible && (
              <motion.div
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 3.0, repeat: Infinity, ease: 'linear', delay: 1.0 }}
                className="absolute w-[8px] h-[8px] rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] -translate-y-[3px]"
              />
            )}
          </div>

          {/* Grid nodes */}
          <div className="grid grid-cols-4 gap-y-24 justify-items-center w-full relative z-10">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeNodeId === stage.id;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.08 }}
                  onMouseEnter={() => setActiveNodeId(stage.id)}
                  onClick={() => setActiveNodeId(stage.id)}
                  className="flex flex-col items-center gap-3.5 cursor-pointer group z-10 w-[90px]"
                >
                  <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center bg-white/50 dark:bg-[#0c0e14]/50 border ${
                    isActive 
                      ? 'border-cyan-400/80 shadow-[0_0_24px_rgba(34,211,238,0.35)] scale-105' 
                      : 'border-white/20 dark:border-slate-800/60'
                  } backdrop-blur-xl group-hover:border-cyan-500/80 group-hover:shadow-[0_0_16px_rgba(34,211,238,0.22)] transition-all duration-300 transform group-hover:-translate-y-1`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-400' : 'text-slate-500 dark:text-slate-400'} group-hover:text-cyan-400 transition-colors duration-300`} />
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight text-center ${
                    isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400'
                  } group-hover:text-cyan-500 transition-colors`}>
                    {stage.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 3. Mobile Vertical Timeline Layout */}
        <div className="block md:hidden relative w-full mb-12 select-none pl-8 py-4">
          {/* Vertical line left aligned */}
          <div className="absolute left-[28px] top-6 bottom-6 w-[2px] bg-slate-200/40 dark:bg-slate-800/40 z-0 overflow-hidden rounded-full">
            {connectionsVisible && (
              <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[8px] h-[8px] rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] -translate-x-[3px]"
              />
            )}
          </div>

          <div className="flex flex-col gap-8 w-full relative z-10">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeNodeId === stage.id;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.08 }}
                  onClick={() => setActiveNodeId(stage.id)}
                  className="flex items-center gap-5 cursor-pointer w-full group"
                >
                  <div className={`w-[56px] h-[56px] rounded-xl flex items-center justify-center bg-white/50 dark:bg-[#0c0e14]/50 border ${
                    isActive 
                      ? 'border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105' 
                      : 'border-white/20 dark:border-slate-800/60'
                  } backdrop-blur-xl shrink-0 transition-all duration-300`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${
                      isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {stage.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Stage 0{stage.id}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 4. Active Node Detail Info Panel */}
        <div className="w-full flex justify-center mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNodeId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-[900px] p-6 md:p-8 rounded-[24px] border border-white/25 dark:border-slate-800/50 bg-white/45 dark:bg-[#0c0e14]/50 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 select-none"
            >
              {/* Cyan bloom pulse beneath info card */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/[0.04] dark:bg-cyan-500/[0.015] blur-[70px] pointer-events-none" />

              {/* Left Column — 60% */}
              <div className="w-full md:w-[60%] flex flex-col gap-3 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 px-2.5 py-0.5 rounded border border-cyan-200/40 dark:border-cyan-900/30">
                      STAGE 0{activeNode.id} / 08
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {activeNode.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-1">
                    {activeNode.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-4 select-none">
                  <Terminal className="w-3.5 h-3.5" />
                  PIPELINE TELEMETRY INTERACTIVE PANEL
                </div>
              </div>

              {/* Divider (Desktop only) */}
              <div className="hidden md:block w-[1px] bg-slate-200/50 dark:bg-slate-800/40 self-stretch" />

              {/* Right Column — 40% (Technical details) */}
              <div className="w-full md:w-[40%] flex flex-col gap-4 justify-center">
                
                {/* Purpose */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Core Purpose
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {activeNode.purpose}
                  </span>
                </div>

                {/* Technology */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Technology Stack
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {activeNode.technology}
                  </span>
                </div>

                {/* Latency */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    Process Latency
                  </span>
                  <span className="text-xs font-extrabold text-cyan-500 dark:text-cyan-400 flex items-center gap-1 mt-0.5">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    {activeNode.latency}
                  </span>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
