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
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface Source {
  filename: string;
  chunk_index: number;
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
  onOpenDrawer
}: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

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
                  Retrieving grounded context
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
                  {sources.length > 0 && (
                    <button
                      onClick={() => {
                        if (onOpenDrawer) {
                          onOpenDrawer(sources, {
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
                      {sources.length} {sources.length === 1 ? 'SOURCE' : 'SOURCES'}
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

            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default MessageBubble;
