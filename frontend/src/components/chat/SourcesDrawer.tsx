import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Clock, 
  Database, 
  Tag, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface Source {
  filename: string;
  original_filename?: string;
  chunk_index: number;
  content?: string;
  vector_score?: number;
  bm25_score?: number;
  rerank_score?: number;
  retrieved_by?: string;
}

export interface DrawerMetadata {
  latency?: number;
  retrieved_chunks?: number;
  conversation_id?: number | null;
  timestamp?: string;
}

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  metadata: DrawerMetadata;
}

const renderScores = (src: Source) => {
  const scoresList: string[] = [];
  if (src.rerank_score !== undefined && src.rerank_score !== null) {
    scoresList.push(`Rerank: ${src.rerank_score.toFixed(3)}`);
  }
  if (src.vector_score !== undefined && src.vector_score !== null) {
    scoresList.push(`Vector: ${src.vector_score.toFixed(3)}`);
  }
  if (src.bm25_score !== undefined && src.bm25_score !== null) {
    scoresList.push(`BM25: ${src.bm25_score.toFixed(2)}`);
  }
  return scoresList.join(' • ');
};

const getSourceTypeLabel = (src: Source) => {
  let label = '';
  if (src.retrieved_by === 'both') {
    label = 'Vector + Keyword';
  } else if (src.retrieved_by === 'vector') {
    label = 'Vector';
  } else if (src.retrieved_by === 'keyword') {
    label = 'Keyword';
  } else {
    label = 'Vector'; // Default fallback
  }
  
  if (src.rerank_score !== undefined && src.rerank_score !== null) {
    label += ' (Reranked)';
  }
  return label;
};

export const SourcesDrawer = ({ isOpen, onClose, sources, metadata }: SourcesDrawerProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedChunks, setExpandedChunks] = useState<Record<string, boolean>>({});
  const drawerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Close on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyCitation = async (originalFilename: string, filename: string, chunkIndex: number, text: string) => {
    const id = `${filename}-${chunkIndex}`;
    const displayName = originalFilename || filename;
    const citationText = `[Source: ${displayName}, Chunk #${chunkIndex}]\n"${text}"`;
    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedId(id);
      toast.success('Citation copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Copy failed');
    }
  };

  const handleOpenDoc = (filename: string) => {
    window.open(`/api/documents/${encodeURIComponent(filename)}/view`, '_blank');
  };

  const toggleExpand = (id: string) => {
    setExpandedChunks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'Recent';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-workspace-bg-dark/20 dark:bg-black/50 backdrop-blur-[2px] z-40 transition-all duration-300"
          />

          {/* Floating Right Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={shouldReduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 260, damping: 28 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-sidebar-bg-light/75 dark:bg-sidebar-bg-dark/75 border-l border-border-light/50 dark:border-border-dark/40 backdrop-blur-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            
            {/* Header */}
            <div className="p-5 border-b border-border-light/40 dark:border-border-dark/30 flex items-center justify-between select-none">
              <div className="flex flex-col">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
                  Retrieval Sources
                </h3>
                <span className="text-[8px] font-extrabold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase leading-none">
                  Telemetry & Grounding
                </span>
              </div>
              
              <button
                onClick={onClose}
                aria-label="Close sources inspector"
                className="p-1.5 rounded-lg border border-border-light/60 dark:border-border-dark/60 hover:border-border-light/80 dark:hover:border-border-dark/80 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white bg-card-bg-light/40 dark:bg-workspace-bg-dark/20 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-1 text-[9px] font-bold focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 outline-none"
              >
                <X className="w-3.5 h-3.5" />
                <span>ESC</span>
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              
              {/* Telemetry Metadata Card */}
              <div className="p-4 bg-card-bg-light/40 dark:bg-card-bg-dark/30 border border-border-light/50 dark:border-border-dark/50 rounded-2xl flex flex-col gap-3 select-none shadow-[0_2px_8px_rgba(0,0,0,0.01)] backdrop-blur-md">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase leading-none">
                  SESSION TELEMETRY
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 py-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Latency:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {metadata.latency ? `${Math.round(metadata.latency)}ms` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 py-1">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Retrieved:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {metadata.retrieved_chunks ? `${metadata.retrieved_chunks} chunks` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 py-1 col-span-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thread ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                      {metadata.conversation_id ? `#${metadata.conversation_id.toString(16).toUpperCase()}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 py-1 col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Timestamp:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatTimestamp(metadata.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Source Chunks Section */}
              <div className="flex flex-col gap-3">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase select-none leading-none">
                  RETRIEVED CHUNKS LIST ({sources.length})
                </span>

                <div className="flex flex-col gap-3">
                  {sources.map((src, index) => {
                    const chunkId = `${src.filename}-${src.chunk_index}`;
                    const chunkText = src.content || "No preview content available.";
                    const isExpanded = expandedChunks[chunkId] || false;
                    const isCopied = copiedId === chunkId;
                    
                    const docName = src.original_filename || src.filename;
                    const pageVal = (src as any).page_number || (src as any).page || (src as any).page_index;
                    const pageText = pageVal !== undefined && pageVal !== null ? `Page ${pageVal}` : "Page N/A";
                    
                    const scoreText = renderScores(src);
                    const typeLabel = getSourceTypeLabel(src);

                    return (
                      <div
                        key={chunkId}
                        className="p-4 bg-card-bg-light/60 dark:bg-card-bg-dark/40 border border-border-light/50 dark:border-border-dark/50 rounded-2xl shadow-sm hover:border-border-light dark:hover:border-border-dark transition-all duration-200 group relative flex flex-col gap-3 backdrop-blur-sm"
                      >
                        {/* Source Card Header */}
                        <div className="flex items-start justify-between gap-2 select-none">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark/80 shrink-0">
                              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight" title={docName}>
                                {docName}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 mt-0.5 leading-none">
                                Chunk {src.chunk_index} • {pageText} • Order #{index + 1}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[8px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-200/40 dark:border-cyan-900/30">
                              {typeLabel}
                            </span>
                            {scoreText && (
                              <span className="text-[7px] font-mono text-slate-400 dark:text-slate-500 leading-none">
                                {scoreText}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chunk Preview Text Block */}
                        <div className="relative text-xs leading-relaxed text-slate-600 dark:text-slate-300 p-2.5 bg-card-bg-light/45 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 rounded-xl overflow-hidden select-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                          <p className={`font-mono text-[11px] whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {chunkText}
                          </p>
                          <button
                            onClick={() => toggleExpand(chunkId)}
                            className="mt-2.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer flex items-center gap-1 select-none w-fit focus-visible:ring-2 focus-visible:ring-cyan-500/50 outline-none rounded transition-colors duration-150"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3 text-slate-400" /> Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 text-slate-400" /> Show full chunk
                              </>
                            )}
                          </button>
                        </div>

                        {/* Source Actions Bar */}
                        <div className="flex items-center gap-2 border-t border-border-light/40 dark:border-border-dark/20 pt-2.5 select-none">
                          <button
                            onClick={() => handleCopyCitation(src.original_filename || '', src.filename, src.chunk_index, chunkText)}
                            className="flex-1 py-1.5 rounded-xl border border-border-light/60 dark:border-border-dark hover:border-border-light/80 dark:hover:border-border-dark/80 bg-card-bg-light/60 dark:bg-[#000000]/15 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-[9px] font-extrabold shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500/55 focus-visible:ring-offset-1 outline-none"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>COPY CITATION</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenDoc(src.filename)}
                            className="p-1.5 rounded-xl border border-border-light/60 dark:border-border-dark hover:border-border-light/80 dark:hover:border-border-dark/80 bg-card-bg-light/60 dark:bg-[#000000]/15 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500/55 focus-visible:ring-offset-1 outline-none"
                            title="Open source file"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default SourcesDrawer;
