import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  User, 
  Sparkles, 
  BookOpen, 
  Lock, 
  Cpu, 
  Search, 
  Activity, 
  CheckCircle2, 
  FolderOpen,
  ArrowRight,
  Sliders,
  Globe,
  Clock
} from 'lucide-react';

const floatingShowcaseTags = [
  { text: 'Semantic Search', icon: Search, x: '4%', y: '15%', delay: 0 },
  { text: 'Grounded AI', icon: Sparkles, x: '82%', y: '12%', delay: 0.5 },
  { text: 'Private Workspace', icon: Lock, x: '5%', y: '78%', delay: 0.3 },
  { text: 'Streaming', icon: Cpu, x: '84%', y: '72%', delay: 0.7 },
  { text: 'Vector Search', icon: DatabaseIcon, x: '86%', y: '32%', delay: 0.2 },
  { text: 'Citations', icon: BookOpen, x: '2%', y: '45%', delay: 0.6 },
];

function DatabaseIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

const activeThreadList = [
  { id: '1', title: 'Q2 Performance Audit', active: true },
  { id: '2', title: 'Context Index Optimization', active: false },
  { id: '3', title: 'Vector similarity test', active: false }
];

const documentsList = [
  { name: 'citation_framework.pdf', size: '2.4 MB' },
  { name: 'system_architecture.md', size: '42 KB' },
  { name: 'evaluation_metrics.csv', size: '1.2 MB' }
];

export const WorkspaceMockup = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D Perspective Tilt Values
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { damping: 22, stiffness: 140 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), { damping: 22, stiffness: 140 });
  
  // Interactive glass shine reflect position
  const sheenX = useSpring(useTransform(mouseX, [0, 1], ['-20%', '120%']), { damping: 22, stiffness: 140 });
  const sheenY = useSpring(useTransform(mouseY, [0, 1], ['-20%', '120%']), { damping: 22, stiffness: 140 });

  // Interactive Live Chat simulation state machine
  const [chatState, setChatState] = useState<'user-typing' | 'sending' | 'thinking' | 'streaming' | 'complete'>('user-typing');
  const [typedUserQuery, setTypedUserQuery] = useState('');
  const [streamedResponse, setStreamedResponse] = useState('');
  const [citationsActive, setCitationsActive] = useState(false);

  const fullUserPrompt = "How does Atlas verify source citations in document queries?";
  const fullAssistantResponse = "Atlas verifies grounding and citations via a two-layer validation framework: First, cosine similarity matching compares prompts to semantic database chunks. Second, context boundary parsing maps output strings to physical files, preventing synthesis leakage. Q2 audits confirm a 99.4% confidence score.";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (chatState === 'user-typing') {
      let charIdx = 0;
      timer = setTimeout(() => {
        setTypedUserQuery('');
        setStreamedResponse('');
        setCitationsActive(false);
      }, 0);

      const typeChar = () => {
        if (charIdx < fullUserPrompt.length) {
          setTypedUserQuery((prev) => prev + fullUserPrompt.charAt(charIdx));
          charIdx++;
          timer = setTimeout(typeChar, 35);
        } else {
          // Pause, then send
          timer = setTimeout(() => {
            setChatState('sending');
          }, 800);
        }
      };
      timer = setTimeout(typeChar, 500);

    } else if (chatState === 'sending') {
      timer = setTimeout(() => {
        setChatState('thinking');
      }, 600);

    } else if (chatState === 'thinking') {
      timer = setTimeout(() => {
        setChatState('streaming');
      }, 1000);

    } else if (chatState === 'streaming') {
      const words = fullAssistantResponse.split(' ');
      let wordIdx = 0;

      timer = setTimeout(() => {
        setStreamedResponse('');
      }, 0);

      const streamWord = () => {
        if (wordIdx < words.length) {
          setStreamedResponse((prev) => prev + (wordIdx === 0 ? '' : ' ') + words[wordIdx]);
          wordIdx++;
          timer = setTimeout(streamWord, 70);
        } else {
          // Streaming finished, display citations & complete
          setCitationsActive(true);
          timer = setTimeout(() => {
            setChatState('complete');
          }, 600);
        }
      };
      timer = setTimeout(streamWord, 100);

    } else if (chatState === 'complete') {
      // Loop loop after 6s idle
      timer = setTimeout(() => {
        setChatState('user-typing');
      }, 6000);
    }

    return () => clearTimeout(timer);
  }, [chatState]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Reset spring to center
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <section id="showcase" className="relative w-full py-28 px-6 md:px-16 overflow-hidden select-none bg-transparent">
      
      {/* Background underlay glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[40%] left-[55%] -translate-x-1/2 w-[750px] h-[550px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-500/[0.015] blur-[140px]" />
        <div className="absolute bottom-10 right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.035] dark:bg-emerald-500/[0.008] blur-[110px]" />
      </div>

      <div className="max-w-[1140px] mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 z-10 relative">
        
        {/* Left Column (45% Width on Desktop) */}
        <div className="w-full lg:w-[45%] lg:max-w-[45%] flex flex-col gap-6 text-left z-10 shrink-0">
          <span className="text-[9px] font-extrabold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase leading-none">
            BUILT FOR REAL WORK
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05]">
            Enterprise AI <br />
            Workspace Experience
          </h2>
          
          <p className="text-xs md:text-[14.5px] text-slate-600 dark:text-slate-400 max-w-[470px] leading-relaxed">
            Atlas delivers an intuitive, fast-flowing workspace engineered for precision context analysis, file mappings, and high-fidelity citations. No illustration. This is the real experience.
          </p>

          {/* Feature Bullet Points */}
          <ul className="flex flex-col gap-4 my-2 max-w-[470px]">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dynamic Context Extraction</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Instantly maps user prompts against semantic documents.</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero-Configuration Corpus</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">FastAPI architecture indexing data immediately on upload.</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Traceable Citation Links</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Every response contains verified, clickable anchor references.</span>
              </div>
            </li>
          </ul>

          {/* CTA Trigger */}
          <div className="mt-2">
            <a
              href="#launch"
              className="group/sec-cta inline-flex items-center gap-1.5 px-6 py-3 text-xs font-bold rounded-2xl border border-cyan-500/30 dark:border-cyan-500/20 bg-white/5 dark:bg-white/[0.05] hover:bg-white/[0.1] dark:hover:bg-white/[0.08] hover:border-cyan-400 text-slate-900 dark:text-white shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Start Chatting Now
              <ArrowRight className="w-3.5 h-3.5 group-hover/sec-cta:translate-x-1 transition-transform duration-200" />
            </a>
          </div>
        </div>

        {/* Right Column (55% Width on Desktop) */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full lg:w-[55%] lg:max-w-[55%] relative flex items-center justify-center py-6 select-none perspective-[1200px]"
        >
          {/* Floating Badges Tracked to Browser Parent Coordinates */}
          {floatingShowcaseTags.map((tag, idx) => {
            const Icon = tag.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 0.95, scale: 1 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  y: {
                    duration: 4.5 + idx * 0.7,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: tag.delay,
                  },
                }}
                style={{
                  position: 'absolute',
                  left: tag.x,
                  top: tag.y,
                }}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 dark:border-slate-800/40 bg-white/55 dark:bg-[#0c0e14]/55 backdrop-blur-xl text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer z-30"
              >
                <Icon className="w-3 h-3 text-cyan-500 shrink-0" />
                <span>{tag.text}</span>
              </motion.div>
            );
          })}

          {/* Interactive Floating 3D Browser Showcase Window */}
          <motion.div
            style={{ rotateX, rotateY }}
            className="w-full max-w-[620px] rounded-[20px] border border-white/20 dark:border-slate-800/50 bg-white/45 dark:bg-[#08090d]/50 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col z-20 transition-shadow duration-300 relative group"
          >
            {/* Glossy Reflect Line Overlay */}
            <motion.div 
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 70%)',
                left: sheenX,
                top: sheenY
              }}
              className="absolute w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40"
            />

            {/* 1. Browser Chrome Header */}
            <div className="flex items-center justify-between px-4 h-11 border-b border-white/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0c0d12]/30 select-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 shadow-[0_0_4px_rgba(239,68,68,0.2)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 shadow-[0_0_4px_rgba(245,158,11,0.2)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 shadow-[0_0_4px_rgba(16,185,129,0.2)]" />
              </div>
              
              {/* URL Address Input */}
              <div className="flex-1 max-w-[280px] mx-auto py-1 px-3 rounded-lg border border-slate-200/40 dark:border-slate-800/45 bg-white/60 dark:bg-slate-900/45 text-[9px] font-bold text-slate-400 dark:text-slate-400 text-center truncate tracking-tight flex items-center justify-center gap-1 select-none">
                <Globe className="w-2.5 h-2.5 text-slate-500" />
                https://atlas.enterprise/workspace
              </div>

              <div className="w-[52px] flex items-center justify-end">
                <span className="text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 select-none bg-cyan-50/50 dark:bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-150/40 dark:border-cyan-900/30 leading-none">
                  SSL
                </span>
              </div>
            </div>

            {/* 2. Atlas Workspace Interface Columns */}
            <div className="flex h-[380px] md:h-[420px] overflow-hidden relative">
              
              {/* Column A: Sidebar */}
              <div className="w-[50px] md:w-[160px] border-r border-white/20 dark:border-slate-800/50 bg-slate-50/20 dark:bg-[#07090d]/20 flex flex-col justify-between p-2.5 shrink-0 z-10">
                <div className="flex flex-col gap-4">
                  {/* Sidebar Title */}
                  <div className="hidden md:flex items-center gap-1.5 px-1 py-0.5 text-[8.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
                    <Sliders className="w-3 h-3 text-cyan-500" />
                    Explorer
                  </div>

                  {/* New Thread Mock Trigger */}
                  <div className="w-full h-8 rounded-xl border border-slate-250 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-800 dark:text-slate-300 bg-white/40 dark:bg-[#12151e]/30 hover:bg-white/80 dark:hover:bg-cyan-950/15 cursor-pointer transition-all duration-200 select-none shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="hidden md:inline">New Thread</span>
                  </div>

                  {/* Thread list */}
                  <div className="flex flex-col gap-1">
                    {activeThreadList.map((thread) => (
                      <div 
                        key={thread.id} 
                        className={`w-full h-7 rounded-xl px-2.5 flex items-center gap-2 text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                          thread.active 
                            ? 'bg-white/85 dark:bg-cyan-950/15 border border-slate-200 dark:border-cyan-900/20 text-slate-950 dark:text-white shadow-sm' 
                            : 'text-slate-450 dark:text-slate-450 hover:bg-slate-100/50 dark:hover:bg-slate-900/20'
                        }`}
                      >
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${thread.active ? 'text-cyan-500' : 'text-slate-450'}`} />
                        <span className="hidden md:inline truncate">{thread.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Document List */}
                  <div className="hidden md:flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-1.5 px-1 py-0.5 text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none mb-1">
                      <FolderOpen className="w-3 h-3 text-cyan-500" />
                      Documents
                    </div>
                    {documentsList.map((doc, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between text-[9px] font-bold text-slate-550 dark:text-slate-400 hover:text-cyan-400 transition-colors duration-200 cursor-pointer py-0.5 px-1 truncate"
                      >
                        <span className="truncate">{doc.name}</span>
                        <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-medium shrink-0 ml-1">{doc.size}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Active Status Indicator */}
                <div className="hidden md:flex flex-col gap-1 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-[#12151e]/30 select-none">
                  <div className="flex items-center gap-1.5 text-[7.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    Live Corpus
                  </div>
                  <span className="text-[9.5px] font-extrabold text-slate-805 dark:text-white">
                    12 Files Mapped
                  </span>
                </div>
              </div>

              {/* Column B: Main Chat Panel */}
              <div className="flex-1 flex flex-col justify-between p-4 bg-white/10 dark:bg-transparent overflow-hidden z-10 relative">
                
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 dark:border-slate-800/40 select-none shrink-0">
                  <div className="flex items-center gap-1.5 text-[8.5px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-ping" />
                    ATLAS WORKSPACE INFRASTRUCTURE
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-500/25 text-[8px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-sm leading-none">
                    RAG RESPONDER ACTIVE
                  </div>
                </div>

                {/* Dynamic Thread Feed */}
                <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto pr-1">
                  
                  {/* User query bubble */}
                  {typedUserQuery.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end select-none"
                    >
                      <div className="flex gap-2 max-w-[80%] items-start">
                        <div className="p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-100/70 dark:bg-[#12151e]/30 text-[10px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
                          {typedUserQuery}
                          {chatState === 'user-typing' && (
                            <span className="inline-block w-1 h-3 ml-0.5 bg-cyan-500 animate-pulse shrink-0" />
                          )}
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-slate-150 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-350 shrink-0">
                          <User className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Thinking state loader */}
                  {chatState === 'thinking' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start select-none"
                    >
                      <div className="flex gap-2 max-w-[80%] items-center">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Assistant response stream bubble */}
                  {streamedResponse.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start select-none"
                    >
                      <div className="flex gap-2.5 max-w-[90%] items-start">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-[#0c0d12]/40 text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm font-medium">
                            {streamedResponse}
                            {chatState === 'streaming' && (
                              <span className="inline-block w-1.5 h-3 ml-0.5 bg-cyan-400 animate-pulse" />
                            )}

                            {/* Live Grounded citations tag */}
                            {citationsActive && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded border border-cyan-150/40 dark:border-cyan-900/25 bg-cyan-50/50 dark:bg-cyan-950/15 text-[8px] font-extrabold text-cyan-600 dark:text-cyan-400 w-fit mt-2.5 cursor-pointer shadow-[0_1px_3px_rgba(6,182,212,0.05)] hover:border-cyan-400 hover:shadow-md transition-all duration-200"
                              >
                                <BookOpen className="w-2.5 h-2.5" />
                                <span>citation_framework.pdf [Chunk 2]</span>
                              </motion.div>
                            )}
                          </div>

                          {/* Source Cards block */}
                          {citationsActive && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/35 bg-white/50 dark:bg-[#08090d]/30 text-[8.5px] flex flex-col gap-0.5 min-w-[125px] hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm"
                              >
                                <span className="font-extrabold text-slate-850 dark:text-slate-200 truncate flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                                  citation_framework.pdf
                                </span>
                                <div className="flex items-center justify-between text-[7px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1">
                                  <span className="flex items-center gap-0.5"><Clock className="w-2 h-2 text-cyan-500" /> 24ms</span>
                                  <span className="flex items-center gap-0.5 text-cyan-500"><ShieldCheck className="w-2 h-2" /> 99.4%</span>
                                </div>
                              </motion.div>

                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/35 bg-white/50 dark:bg-[#08090d]/30 text-[8.5px] flex flex-col gap-0.5 min-w-[125px] hover:border-cyan-500/30 transition-all cursor-pointer shadow-sm"
                              >
                                <span className="font-extrabold text-slate-850 dark:text-slate-200 truncate flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                                  system_architecture.md
                                </span>
                                <div className="flex items-center justify-between text-[7px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1">
                                  <span className="flex items-center gap-0.5"><Clock className="w-2 h-2 text-cyan-500" /> 18ms</span>
                                  <span className="flex items-center gap-0.5 text-cyan-500"><ShieldCheck className="w-2 h-2" /> 98.1%</span>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Bottom Simulated Composer Textbar */}
                <div className="p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/55 dark:bg-slate-900/35 flex items-center justify-between select-none shrink-0 mt-2 relative">
                  <div className="flex-1 flex items-center px-2 py-1 relative">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-none">
                      {chatState === 'user-typing' ? (
                        <span className="text-slate-300 dark:text-slate-700">Ask anything about corpus...</span>
                      ) : (
                        <span>Ask anything about corpus...</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pr-1">
                    {/* Live Processing indicator */}
                    {(chatState === 'thinking' || chatState === 'streaming') && (
                      <span className="text-[8px] font-extrabold text-cyan-500 flex items-center gap-1 animate-pulse">
                        <Activity className="w-2.5 h-2.5 animate-bounce" />
                        RUNNING
                      </span>
                    )}

                    {/* Action send trigger */}
                    <div className="w-7 h-7 rounded-xl bg-cyan-400 hover:bg-cyan-300 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_2px_8px_rgba(6,182,212,0.2)] shrink-0 transition-transform duration-200 active:scale-95 cursor-pointer">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

function ShieldCheck(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 2 2 4-4" />
    </svg>
  );
}

export default WorkspaceMockup;
