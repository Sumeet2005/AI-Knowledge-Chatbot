import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Clock, 
  Database, 
  Tag, 
  Quote, 
  Copy, 
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Sliders,
  Cpu,
  Bug,
  Layers,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useChat } from '../../context/ChatContext';

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

interface DrawerMetadata {
  latency?: number;
  retrieved_chunks?: number;
  conversation_id?: number | null;
  timestamp?: string;
}

export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: Source[];
  retrieved_chunks?: number;
  response_time_ms?: number;
  conversation_id?: number | null;
  isLoading?: boolean;
  onOpenDrawer?: (sources: Source[], metadata: DrawerMetadata) => void;
  rag_debug?: any;
}

export const MessageBubble = ({
  role,
  content,
  created_at,
  sources = [],
  retrieved_chunks = 0,
  response_time_ms = 0,
  conversation_id = null,
  isLoading = false,
  onOpenDrawer,
  rag_debug
}: MessageBubbleProps) => {
  const { pipelineStage } = useChat();
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState<Record<number, boolean>>({});

  const drawerSources = (sources && sources.length > 0)
    ? sources
    : (rag_debug?.chunks
      ? rag_debug.chunks.filter((c: any) => c.final_context)
      : []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy');
    }
  };

  const isUser = role === 'user';

  return (
    <div className={`w-full flex flex-col mb-6 last:mb-0 select-text ${isUser ? 'items-end' : 'items-start'}`}>
      
      {/* Sender Label */}
      <span className={`text-[9px] font-extrabold tracking-[0.2em] uppercase mb-2 select-none flex items-center gap-1.5 ${
        isUser 
          ? 'text-slate-400 dark:text-slate-500' 
          : 'text-cyan-600 dark:text-cyan-400'
      }`}>
        {!isUser && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.65)] animate-pulse inline-block" />}
        {isUser ? 'YOU' : 'ATLAS'}
        {!isUser && isLoading && pipelineStage && (
          <span className="ml-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-normal normal-case">
            {pipelineStage === 'searching' && 'Searching your documents...'}
            {pipelineStage === 'retrieving' && 'Retrieving relevant context...'}
            {pipelineStage === 'reranking' && 'Reranking sources...'}
            {pipelineStage === 'generating' && 'Generating response...'}
          </span>
        )}
      </span>

      {/* Message Bubble Body */}
      {isUser ? (
        /* User Message */
        <div className="max-w-[70%] bg-sidebar-bg-light/70 dark:bg-workspace-bg-dark/40 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-2xl border border-border-light/50 dark:border-border-dark/30 shadow-sm text-xs md:text-sm leading-relaxed backdrop-blur-sm">
          {content}
        </div>
      ) : (
        /* Assistant Message */
        <div className="w-full max-w-[760px] flex flex-col">
          
          {/* Main Answer text / markdown container */}
          <div className="bg-transparent text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed select-text">
            {isLoading && content === '' ? (
              /* Initial retrieving state with skeletons */
              <div className="flex flex-col gap-3.5 select-none">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                  {pipelineStage === 'searching' && 'Searching your documents...'}
                  {pipelineStage === 'retrieving' && 'Retrieving relevant context...'}
                  {pipelineStage === 'reranking' && 'Reranking sources...'}
                  {pipelineStage === 'generating' && 'Generating response...'}
                  {!pipelineStage && 'Retrieving grounded context'}
                  <span className="w-1.5 h-3 bg-cyan-400 dark:bg-cyan-400 animate-cursor-blink inline-block ml-0.5" />
                </div>
                {/* 3 pulsing skeleton lines */}
                <div className="flex flex-col gap-2.5 mt-1 shrink-0">
                  <div className="w-[92%] h-3 bg-sidebar-bg-light dark:bg-workspace-bg-dark/40 border border-border-light/30 dark:border-border-dark/30 rounded-full shimmer" />
                  <div className="w-[78%] h-3 bg-sidebar-bg-light dark:bg-workspace-bg-dark/40 border border-border-light/30 dark:border-border-dark/30 rounded-full shimmer" />
                  <div className="w-[45%] h-3 bg-sidebar-bg-light dark:bg-workspace-bg-dark/40 border border-border-light/30 dark:border-border-dark/30 rounded-full shimmer" />
                </div>
              </div>
            ) : (
              /* Rich Markdown Renderer */
              <div className="prose prose-slate dark:prose-invert max-w-none prose-xs md:prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Telemetry Row & Citations accordion (only if not loading and has telemetry) */}
          {!isLoading && content !== '' && (
            <div className="mt-4.5 flex flex-col gap-3 w-full">
              
              {/* Telemetry Badges container */}
              <div className="flex flex-wrap items-center justify-between gap-3 select-none py-1.5 border-t border-border-light/50 dark:border-border-dark/30">
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Sources pill (interactive accordion toggler) */}
                  {drawerSources.length > 0 && (
                    <button
                      onClick={() => {
                        if (onOpenDrawer) {
                          onOpenDrawer(drawerSources, {
                            latency: response_time_ms,
                            retrieved_chunks,
                            conversation_id,
                            timestamp: created_at
                          });
                        } else {
                          setShowSources(!showSources);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-extrabold border transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 ${
                        showSources && !onOpenDrawer
                          ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200/60 dark:border-cyan-900/40 shadow-[0_0_8px_rgba(6,182,212,0.08)]'
                          : 'text-slate-500 dark:text-slate-400 bg-card-bg-light/40 dark:bg-card-bg-dark/40 border-border-light/60 dark:border-border-dark/60 hover:border-border-light dark:hover:border-border-dark'
                      }`}
                    >
                      <Quote className="w-3 h-3 stroke-[2.5]" />
                      {drawerSources.length} {drawerSources.length === 1 ? 'SOURCE' : 'SOURCES'}
                      {!onOpenDrawer && (showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </button>
                  )}

                  {/* Latency badge */}
                  {response_time_ms > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-card-bg-light/40 dark:bg-card-bg-dark/40 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <Clock className="w-3 h-3 stroke-[2.5]" />
                      {Math.round(response_time_ms)} ms
                    </div>
                  )}

                  {/* Chunks badge */}
                  {retrieved_chunks > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-card-bg-light/40 dark:bg-card-bg-dark/40 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <Database className="w-3 h-3 stroke-[2.5]" />
                      {retrieved_chunks} {retrieved_chunks === 1 ? 'chunk' : 'chunks'}
                    </div>
                  )}

                  {/* Thread Hash ID badge */}
                  {conversation_id && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-card-bg-light/40 dark:bg-card-bg-dark/40 border border-border-light/60 dark:border-border-dark/60 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <Tag className="w-3 h-3 stroke-[2.5]" />
                      # {conversation_id.toString(16).toUpperCase()}
                    </div>
                  )}

                  {/* RAG Debug Toggler Badge */}
                  {rag_debug && (
                    <button
                      onClick={() => setShowDebug(!showDebug)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-extrabold border transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 ${
                        showDebug
                          ? 'text-amber-650 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 shadow-[0_0_8px_rgba(245,158,11,0.08)]'
                          : 'text-slate-500 dark:text-slate-400 bg-card-bg-light/40 dark:bg-card-bg-dark/40 border-border-light/60 dark:border-border-dark/60 hover:border-border-light dark:hover:border-border-dark'
                      }`}
                    >
                      <Sliders className="w-3 h-3 stroke-[2.5]" />
                      RAG DEBUG
                      {showDebug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}

                </div>

                {/* Copy answer trigger */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-border-light/60 dark:border-border-dark/60 text-slate-500 dark:text-slate-400 bg-card-bg-light/40 dark:bg-workspace-bg-dark/20 shadow-sm transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                  title="Copy answer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Citations list drawer (accordion) */}
              <AnimatePresence>
                {showSources && sources.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-card-bg-light/35 dark:bg-workspace-bg-dark/30 border border-border-light/60 dark:border-border-dark/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none mb-1">
                        Citations metadata
                      </span>
                      <div className="flex flex-col gap-1">
                        {sources.map((src, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between text-xs py-1 px-2.5 hover:bg-card-bg-light/60 dark:hover:bg-card-bg-dark/50 rounded-lg transition-colors duration-150 border border-transparent hover:border-border-light/60 dark:hover:border-border-dark"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="text-slate-600 dark:text-slate-300 truncate">
                                {src.filename}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 shrink-0 bg-cyan-50/50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-100/40 dark:border-cyan-900/30 select-none">
                              Chunk {src.chunk_index}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* RAG Explainability / Debug Panel (accordion) */}
              <AnimatePresence>
                {showDebug && rag_debug && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/90 dark:bg-sidebar-bg-dark/85 border border-slate-800 dark:border-border-dark shadow-lg backdrop-blur-md">
                      
                      {/* Header Title */}
                      <div className="flex items-center justify-between border-b border-slate-800 dark:border-border-dark pb-2 select-none">
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-200 dark:text-slate-100 uppercase tracking-widest">
                            RAG Pipeline Debug Panel
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">
                          v1.0.0-telemetry
                        </span>
                      </div>

                      {/* Top Summary Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 select-none text-[9px]">
                        <div className="p-2 rounded-xl bg-slate-950/60 dark:bg-workspace-bg-dark/40 border border-slate-800/60 dark:border-border-dark/40 flex flex-col gap-0.5">
                          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Retrieval Latency</span>
                          <span className="text-slate-200 dark:text-slate-100 font-mono font-bold text-xs">{rag_debug.retrieval_latency_ms || 0} ms</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 dark:bg-workspace-bg-dark/40 border border-slate-800/60 dark:border-border-dark/40 flex flex-col gap-0.5">
                          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Generation Latency</span>
                          <span className="text-slate-200 dark:text-slate-100 font-mono font-bold text-xs">{rag_debug.generation_latency_ms || 0} ms</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 dark:bg-workspace-bg-dark/40 border border-slate-800/60 dark:border-border-dark/40 flex flex-col gap-0.5">
                          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-extrabold">Similarity Threshold</span>
                          <span className="text-slate-200 dark:text-slate-100 font-mono font-bold text-xs">{rag_debug.similarity_threshold || 0.70}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 dark:bg-workspace-bg-dark/40 border border-slate-800/60 dark:border-border-dark/40 flex flex-col gap-0.5">
                          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-extrabold">Top-K Config (Cand/Final)</span>
                          <span className="text-slate-200 dark:text-slate-100 font-mono font-bold text-xs">
                            {rag_debug.top_k_candidates || 10} / {rag_debug.top_k_final || 5}
                          </span>
                        </div>
                      </div>

                      {/* Rewritten/Original Query */}
                      <div className="p-3 rounded-xl bg-slate-950/40 dark:bg-workspace-bg-dark/30 border border-slate-800/60 dark:border-border-dark/40 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                          <Activity className="w-3 h-3 text-cyan-500" />
                          Processed Search Query
                        </div>
                        <p className="font-mono text-slate-300 dark:text-slate-200 break-words leading-relaxed select-text italic">
                          "{rag_debug.query || content}"
                        </p>
                      </div>

                      {/* Retrieved Chunks Section */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none mb-1">
                          <Layers className="w-3.5 h-3.5 text-purple-500" />
                          Retrieved Candidate Chunks ({rag_debug.chunks?.length || 0})
                        </div>
                        
                        {rag_debug.chunks && rag_debug.chunks.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {rag_debug.chunks.map((chunk: any, cIdx: number) => {
                              const isChunkExpanded = expandedChunks[cIdx];
                              return (
                                <div 
                                  key={cIdx} 
                                  className={`flex flex-col p-3 rounded-xl border transition-all duration-200 ${
                                    chunk.final_context 
                                      ? 'bg-slate-950/80 dark:bg-workspace-bg-dark/50 border-slate-800 dark:border-cyan-900/20 shadow-sm shadow-cyan-950/10' 
                                      : 'bg-slate-950/40 dark:bg-workspace-bg-dark/20 border-slate-900/60 dark:border-border-dark/20 opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  {/* Chunk Header */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] mb-2 select-none">
                                    <div className="flex items-center gap-2 max-w-[60%] overflow-hidden">
                                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-slate-300 dark:text-slate-200 truncate font-semibold">
                                        {chunk.filename}
                                      </span>
                                      <span className="font-bold text-slate-500 shrink-0 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850 text-[8px]">
                                        Chunk {chunk.chunk_index}
                                      </span>
                                    </div>
                                    
                                    {/* Badges Container */}
                                    <div className="flex items-center gap-1.5">
                                      {/* Retrieved by Source Badge */}
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                        chunk.retrieved_by === 'both'
                                          ? 'text-purple-400 bg-purple-950/30 border-purple-900/40'
                                          : chunk.retrieved_by === 'vector'
                                            ? 'text-cyan-400 bg-cyan-950/30 border-cyan-900/40'
                                            : 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40'
                                      }`}>
                                        {chunk.retrieved_by}
                                      </span>
                                      
                                      {/* Final Context Selection Badge */}
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                                        chunk.final_context
                                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60'
                                          : 'text-slate-500 bg-slate-900/50 border-slate-850'
                                      }`}>
                                        {chunk.final_context ? 'Used' : 'Filtered'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Scores Sub-Row */}
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-400 mb-2 py-1 border-t border-b border-slate-900/50 select-none">
                                    {chunk.vector_score !== null && chunk.vector_score !== undefined && (
                                      <div>
                                        Vector Sim: <span className="font-bold text-cyan-400">{chunk.vector_score.toFixed(4)}</span>
                                      </div>
                                    )}
                                    {chunk.bm25_score !== null && chunk.bm25_score !== undefined && (
                                      <div>
                                        BM25 Score: <span className="font-bold text-emerald-400">{chunk.bm25_score.toFixed(2)}</span>
                                      </div>
                                    )}
                                    {rag_debug.cross_encoder_enabled && chunk.rerank_score !== null && chunk.rerank_score !== undefined && (
                                      <div>
                                        Rerank Score: <span className="font-bold text-purple-400">{chunk.rerank_score.toFixed(4)}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Content preview with expandable details */}
                                  <div className="text-xs leading-relaxed text-slate-300 dark:text-slate-300">
                                    <div 
                                      className="font-mono text-[10px] break-words whitespace-pre-wrap select-text cursor-pointer hover:text-slate-200"
                                      onClick={() => setExpandedChunks(prev => ({ ...prev, [cIdx]: !isChunkExpanded }))}
                                    >
                                      {isChunkExpanded 
                                        ? chunk.content 
                                        : (chunk.content.length > 180 ? chunk.content.substring(0, 180) + '...' : chunk.content)
                                      }
                                    </div>
                                    {chunk.content.length > 180 && (
                                      <button
                                        onClick={() => setExpandedChunks(prev => ({ ...prev, [cIdx]: !isChunkExpanded }))}
                                        className="mt-1 flex items-center gap-0.5 text-[9px] font-extrabold text-cyan-500 hover:text-cyan-400 cursor-pointer select-none transition-colors border-none bg-transparent p-0"
                                      >
                                        {isChunkExpanded ? 'Show less' : 'Show full chunk content'}
                                        {isChunkExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                      </button>
                                    )}
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic p-3 select-none text-center">
                            No candidate chunks retrieved.
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default MessageBubble;
