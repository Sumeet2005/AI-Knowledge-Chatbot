import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import { PanelHeader } from '../components/ui/PanelHeader';
import { NetworkOrb } from '../components/chat/NetworkOrb';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatStream } from '../components/chat/ChatStream';
import { SourcesDrawer } from '../components/chat/SourcesDrawer';
import { Download, Loader2, ChevronDown, FileText, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';

export const WorkspaceView = () => {
  const { currentMessages, activeThreadId, conversations, sendMessage } = useChat();
  const [drawerData, setDrawerData] = useState<{
    sources: Array<{ filename: string; chunk_index: number }>;
    metadata: {
      latency?: number;
      retrieved_chunks?: number;
      conversation_id?: number | null;
      timestamp?: string;
    };
  } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isChatActive = currentMessages.length > 0;

  const handleExport = async (format: string) => {
    if (!activeThreadId) return;
    setIsExporting(true);
    setIsDropdownOpen(false);
    const toastId = toast.loading(`Generating ${format.toUpperCase()} export...`);
    try {
      const response = await fetch(`/api/history/${activeThreadId}/export?format=${format}`);
      if (!response.ok) {
        throw new Error('Failed to export conversation');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let ext = 'txt';
      if (format === 'markdown' || format === 'md') ext = 'md';
      else if (format === 'pdf') ext = 'pdf';
      
      link.setAttribute('download', `conversation_${activeThreadId}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export downloaded!`, { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to export conversation', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAction = isChatActive && activeThreadId ? (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-extrabold text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-card-bg-dark/40 border border-slate-200/60 dark:border-border-dark/60 hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />
        ) : (
          <Download className="w-3 h-3 text-cyan-500" />
        )}
        EXPORT CHAT
        <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl bg-white dark:bg-sidebar-bg-dark border border-border-light dark:border-border-dark shadow-xl dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] z-[100] overflow-hidden"
          >
            <div className="py-1 select-none flex flex-col">
              <button
                onClick={() => handleExport('txt')}
                className="w-full h-10 px-4 flex items-center gap-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-card-bg-dark cursor-pointer transition-colors duration-150 border-none whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Text (.txt)
              </button>
              <button
                onClick={() => handleExport('md')}
                className="w-full h-10 px-4 flex items-center gap-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-card-bg-dark cursor-pointer transition-colors duration-150 border-none whitespace-nowrap"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Markdown (.md)
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full h-10 px-4 flex items-center gap-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-card-bg-dark cursor-pointer transition-colors duration-150 border-none whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                PDF (.pdf)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ) : null;
  
  // Resolve header metadata dynamically
  const activeConversation = conversations.find((c) => c.id === activeThreadId);
  const headerTitle = activeThreadId
    ? (activeConversation?.title || (currentMessages[0]?.content ? (currentMessages[0].content.length > 30 ? currentMessages[0].content.substring(0, 30) + '...' : currentMessages[0].content) : 'Workspace'))
    : 'Workspace';
    
  const headerSubtitle = activeThreadId
    ? `THREAD ${activeThreadId.toString(16).toUpperCase()}`
    : 'RETRIEVAL-AUGMENTED GENERATION';

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative select-none"
    >
      {/* Dynamic Header */}
      <PanelHeader title={headerTitle} subtitle={headerSubtitle} action={exportAction} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!isChatActive ? (
            /* Home / Landing State */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden"
            >
              {/* Dynamic Ambient Background Glows & Vignette */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Layer 3: Large cyan radial glow centered behind the orb */}
                <div className="absolute top-[5%] left-[50%] -translate-x-1/2 w-[900px] h-[750px] rounded-full bg-cyan-500/[0.07] dark:bg-cyan-500/[0.022] blur-[150px]" />
                
                {/* Layer 4: Secondary white ambient bloom, slightly offset from center */}
                <div className="absolute top-[20%] left-[48%] -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-white/10 dark:bg-white/[0.025] blur-[80px]" />
                
                {/* Volumetric cyan bloom directly behind the orb location */}
                <div className="absolute top-[22%] left-[50%] -translate-x-1/2 w-[280px] h-[280px] rounded-full bg-cyan-400/15 dark:bg-cyan-400/[0.055] blur-[60px] mix-blend-screen" />
                
                {/* Soft teal glow extending behind composer */}
                <div className="absolute top-[42%] left-[50%] -translate-x-1/2 w-[650px] h-[400px] rounded-full bg-teal-400/[0.04] dark:bg-teal-500/[0.01] blur-[120px]" />
                
                {/* Layer 5: Subtle vignette around screen edges */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.02)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.24)_100%)] rounded-[28px]" />
              </div>

              {/* Large Blueprint / Network Diagram Decoration */}
              <div className="absolute w-[620px] h-[620px] opacity-[0.025] dark:opacity-[0.018] pointer-events-none select-none z-0 flex items-center justify-center">
                <svg className="w-full h-full text-slate-900 dark:text-cyan-400" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Concentric rings */}
                  <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 9" />
                  <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="0.8" strokeDasharray="10 4" />
                  <circle cx="250" cy="250" r="130" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="250" cy="250" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                  
                  {/* Tilted ellipses for 3D sphere feel */}
                  <ellipse cx="250" cy="250" rx="230" ry="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" transform="rotate(-30 250 250)" />
                  <ellipse cx="250" cy="250" rx="230" ry="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" transform="rotate(30 250 250)" />
                  <ellipse cx="250" cy="250" rx="80" ry="230" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" transform="rotate(-15 250 250)" />
                  <ellipse cx="250" cy="250" rx="80" ry="230" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" transform="rotate(15 250 250)" />

                  {/* Faint blueprint intersecting grid lines */}
                  <line x1="20" y1="250" x2="480" y2="250" stroke="currentColor" strokeWidth="0.6" />
                  <line x1="250" y1="20" x2="250" y2="480" stroke="currentColor" strokeWidth="0.6" />
                  <line x1="87" y1="87" x2="413" y2="413" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 3" />
                  <line x1="413" y1="87" x2="87" y2="413" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 3" />

                  {/* Secondary radial networks */}
                  <line x1="120" y1="120" x2="380" y2="380" stroke="currentColor" strokeWidth="0.4" />
                  <line x1="380" y1="120" x2="120" y2="380" stroke="currentColor" strokeWidth="0.4" />

                  {/* Nodes/Dots on junctions */}
                  <circle cx="250" cy="70" r="3" fill="currentColor" />
                  <circle cx="250" cy="430" r="3" fill="currentColor" />
                  <circle cx="70" cy="250" r="3" fill="currentColor" />
                  <circle cx="430" cy="250" r="3" fill="currentColor" />
                  <circle cx="160" cy="160" r="2.5" fill="currentColor" />
                  <circle cx="340" cy="340" r="2.5" fill="currentColor" />
                  <circle cx="340" cy="160" r="2.5" fill="currentColor" />
                  <circle cx="160" cy="340" r="2.5" fill="currentColor" />
                  <circle cx="250" cy="120" r="2" fill="currentColor" />
                  <circle cx="250" cy="380" r="2" fill="currentColor" />
                  <circle cx="120" cy="250" r="2" fill="currentColor" />
                  <circle cx="380" cy="250" r="2" fill="currentColor" />
                </svg>
              </div>

              {/* 3D Constellation Orb */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 80, damping: 16, delay: 0.1 }}
                className="z-10"
              >
                <NetworkOrb />
              </motion.div>

              {/* Hero block */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.2 }}
                className="flex flex-col items-center max-w-[660px] w-full text-center z-10"
              >
                <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase mb-4 leading-none select-none">
                  ENTERPRISE KNOWLEDGE, GROUNDED
                </span>

                <h2 className="text-4xl md:text-[54px] font-extrabold text-slate-950 dark:text-white tracking-tighter leading-[1.12] mb-5 select-none">
                  Ask your documents,<br />
                  <span className="bg-gradient-to-r from-[#06b6d4] via-[#08b6d4] to-[#10b981] bg-clip-text text-transparent">
                    get cited answers.
                  </span>
                </h2>

                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-[530px] mb-10 select-none">
                  Atlas retrieves only from your indexed corpus — 3 documents live — and attaches every source chunk it used, with latency and retrieval telemetry on each response.
                </p>

                {/* Composer (Centered on Home) */}
                <ChatInput />

                {/* Suggestions */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 select-none">
                  <button
                    onClick={() => handleSuggestionClick('Summarise the security policies')}
                    className="px-4 py-2 border border-slate-200/80 dark:border-border-dark/80 bg-white/40 dark:bg-card-bg-dark/30 hover:border-slate-300 dark:hover:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-900/40 text-[11px] font-semibold text-slate-600 dark:text-slate-400 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Summarise the security policies
                  </button>
                  <button
                    onClick={() => handleSuggestionClick('What are the onboarding steps for a new engineer?')}
                    className="px-4 py-2 border border-slate-200/80 dark:border-border-dark/80 bg-white/40 dark:bg-card-bg-dark/30 hover:border-slate-300 dark:hover:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-900/40 text-[11px] font-semibold text-slate-600 dark:text-slate-400 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    What are the onboarding steps for a new engineer?
                  </button>
                </div>

              </motion.div>
            </motion.div>
          ) : (
            /* Chat / Thread State */
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Message scroll list */}
              <ChatStream onOpenDrawer={(sources, metadata) => { setDrawerData({ sources, metadata }); setIsDrawerOpen(true); }} />

              {/* Composer (Anchored to bottom in Chat Stream) */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-900/40 bg-white/10 dark:bg-card-bg-dark/10 backdrop-blur-sm flex justify-center select-none shrink-0">
                <ChatInput />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sources Side Drawer */}
      <SourcesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sources={drawerData?.sources || []}
        metadata={drawerData?.metadata || {}}
      />

    </motion.div>
  );
};
