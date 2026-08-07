import { useState, useRef, useEffect } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ChatInputProps {
  placeholder?: string;
}

export const ChatInput = ({ placeholder = "Ask anything about your documents..." }: ChatInputProps) => {
  const { sendMessage, loadingChat, uploading, activeThreadId } = useChat();
  const [inputVal, setInputVal] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically focus the chat input when thread changes or mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeThreadId]);

  const handleSend = () => {
    if (!inputVal.trim() || loadingChat || uploading) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to calculate scrollHeight correctly
    textarea.style.height = 'auto';
    // Set to scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputVal]);

  const isDisabled = loadingChat || uploading;

  return (
    <div className="relative w-full max-w-[580px] group select-none">
      {/* Cyan glow beneath composer (matches Loveable exactly) */}
      <div className="absolute -inset-2.5 rounded-[30px] bg-cyan-500/12 dark:bg-cyan-400/8 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      <div className="absolute -inset-0.5 rounded-[30px] bg-cyan-500/5 dark:bg-cyan-500/[0.025] blur-md opacity-25 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none z-0" />

      {/* Main Composer Box */}
      <div className="relative w-full border border-border-light/60 dark:border-border-dark/60 bg-card-bg-light/75 dark:bg-card-bg-dark/80 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_16px_48px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.45)] rounded-[28px] p-4.5 flex flex-col gap-2 transition-all duration-300 focus-within:border-cyan-500/40 focus-within:scale-[1.002] focus-within:shadow-[0_0_16px_rgba(6,182,212,0.06)] z-10">
        
        {/* Input Textarea Row */}
        <div className="flex items-start gap-3 w-full">
          <textarea
            ref={textareaRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isDisabled}
            aria-label="Ask a question about your documents"
            className="flex-1 resize-none bg-transparent outline-none border-none text-slate-900 dark:text-slate-100 text-xs md:text-sm placeholder-slate-400 dark:placeholder-slate-500 py-1.5 px-1 max-h-36 overflow-y-auto leading-relaxed select-text disabled:opacity-60"
          />
        </div>

        {/* Footer Controls Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-light/40 dark:border-border-dark/40 select-none">
          
          {/* Scoped Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 border border-border-light/50 dark:border-border-dark/80 bg-sidebar-bg-light/50 dark:bg-workspace-bg-dark/30 backdrop-blur-sm">
            <Paperclip className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            CORPUS SCOPED
          </div>

          {/* Submit panel controls */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-500 select-none">
              ⌘ ↵ to send
            </span>
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputVal.trim() || isDisabled}
              aria-label="Send message"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 select-none border border-transparent focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 outline-none ${
                inputVal.trim() && !isDisabled
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white cursor-pointer shadow-[0_2px_10px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_16px_rgba(6,182,212,0.4)] scale-100 hover:scale-105 active:scale-95'
                  : 'bg-sidebar-bg-light dark:bg-workspace-bg-dark text-slate-400 dark:text-slate-500 cursor-not-allowed border border-border-light/40 dark:border-border-dark/40'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ChatInput;
