import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, FileText, Plus, Sun, Moon, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { IndexStatusCard } from './IndexStatusCard';

export const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { 
    conversations, 
    activeThreadId, 
    selectThread, 
    startNewThread, 
    documents,
    renameThread,
    deleteThread
  } = useChat();
  
  const location = useLocation();
  const navigate = useNavigate();

  const [editingThreadId, setEditingThreadId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const isWorkspaceActive = location.pathname === '/workspace' || location.pathname === '/chat';
  const isDocumentsActive = location.pathname === '/documents';

  const handleWorkspaceClick = () => {
    navigate('/workspace');
  };

  const handleDocumentsClick = () => {
    navigate('/documents');
  };

  const handleNewThread = () => {
    startNewThread();
    navigate('/workspace');
  };

  return (
    <aside className="w-[280px] h-full flex flex-col border border-border-light/50 dark:border-border-dark/40 bg-sidebar-bg-light/45 dark:bg-sidebar-bg-dark/65 backdrop-blur-2xl text-slate-900/70 dark:text-white/70 font-sans transition-all duration-300 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.55)] select-none z-10">
      
      {/* Workspace Header */}
      <div className="p-5 flex items-center gap-3 select-none">
        <div className="w-9 h-9 rounded-full bg-card-bg-light/60 dark:bg-card-bg-dark/60 flex items-center justify-center font-bold text-slate-800 dark:text-white border border-border-light/60 dark:border-border-dark/80 shadow-[0_2px_8px_rgba(6,182,212,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] shrink-0">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 dark:text-white text-[16px] tracking-tight leading-none mb-1">
            Atlas
          </span>
          <span className="text-[8px] font-extrabold tracking-[0.22em] text-slate-400 dark:text-slate-500 uppercase leading-none">
            KNOWLEDGE WORKSPACE
          </span>
        </div>
      </div>

      {/* New Thread Button */}
      <div className="px-5 py-1">
        <button
          onClick={handleNewThread}
          aria-label="Create new conversation thread"
          className="w-full flex items-center justify-between px-3.5 py-2.5 border border-border-light/75 dark:border-border-dark bg-card-bg-light/40 dark:bg-card-bg-dark/30 hover:bg-card-bg-light/80 dark:hover:bg-cyan-950/10 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 rounded-2xl transition-all duration-200 cursor-pointer text-left shadow-sm hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(6,186,212,0.08)] focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 outline-none"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white/90">
              New thread
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-border-light/60 dark:border-border-dark bg-sidebar-bg-light dark:bg-workspace-bg-dark/40 text-slate-400 select-none">
            ⌘K
          </span>
        </button>
      </div>

      {/* Navigation section */}
      <div className="px-3.5 py-3 flex flex-col gap-1.5">
        <button
          onClick={handleWorkspaceClick}
          aria-label="Go to workspace"
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer hover:pl-5 focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 outline-none ${
            isWorkspaceActive
              ? 'bg-card-bg-light/90 dark:bg-active-nav-dark text-slate-950 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-border-light/20 dark:border-border-dark/30'
              : 'hover:bg-card-bg-light/40 dark:hover:bg-card-bg-dark/40 text-slate-500 dark:text-slate-400 border border-transparent'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Workspace
        </button>

        <button
          onClick={handleDocumentsClick}
          aria-label="Go to documents management"
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer hover:pl-5 focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 outline-none ${
            isDocumentsActive
              ? 'bg-card-bg-light/90 dark:bg-active-nav-dark text-slate-955 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-border-light/20 dark:border-border-dark/30'
              : 'hover:bg-card-bg-light/40 dark:hover:bg-card-bg-dark/40 text-slate-500 dark:text-slate-400 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Documents
          </div>
          {documents.length > 0 && (
            <span className="text-[9px] font-extrabold flex items-center justify-center px-1.5 py-0.5 rounded-full bg-sidebar-bg-light dark:bg-workspace-bg-dark text-slate-900/60 dark:text-white/60 border border-border-light/60 dark:border-border-dark/80 shadow-sm leading-none shrink-0">
              {documents.length}
            </span>
          )}
        </button>
      </div>

      {/* History section */}
      <div className="flex-1 flex flex-col overflow-hidden px-5 mt-2.5">
        <div className="text-[9px] font-extrabold tracking-[0.18em] text-slate-400 dark:text-slate-500/85 uppercase mb-3">
          HISTORY
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 select-none">
          {conversations.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-slate-600 italic px-2.5 py-1">
              No threads yet
            </div>
          ) : (
            conversations.map((thread) => {
              const isActive = activeThreadId === thread.id && isWorkspaceActive;
              const isEditing = editingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className="relative group w-full flex items-center justify-between rounded-xl transition-all duration-200 select-none mb-0.5 last:mb-0"
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          renameThread(thread.id, editingTitle);
                          setEditingThreadId(null);
                        } else if (e.key === 'Escape') {
                          setEditingThreadId(null);
                        }
                      }}
                      onBlur={() => {
                        renameThread(thread.id, editingTitle);
                        setEditingThreadId(null);
                      }}
                      autoFocus
                      className="w-full text-xs px-3 py-2 bg-sidebar-bg-light dark:bg-card-bg-dark border border-cyan-500/50 rounded-xl outline-none text-slate-900 dark:text-white"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          selectThread(thread.id);
                          navigate('/workspace');
                        }}
                        className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer truncate pr-14 hover:pl-5 focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 outline-none ${
                          isActive
                            ? 'bg-card-bg-light/90 dark:bg-active-nav-dark text-slate-955 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-border-light/20 dark:border-border-dark/30'
                            : 'hover:bg-card-bg-light/40 dark:hover:bg-card-bg-dark/40 text-slate-500 dark:text-slate-400 border border-transparent'
                        }`}
                      >
                        {thread.title}
                      </button>

                      {/* Edit/Delete Actions overlay on hover */}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingThreadId(thread.id);
                            setEditingTitle(thread.title);
                          }}
                          aria-label="Rename thread"
                          className="p-1 rounded-md hover:bg-sidebar-bg-light/60 dark:hover:bg-border-dark/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500/50 outline-none"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.id);
                          }}
                          aria-label="Delete thread"
                          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500/50 outline-none"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom widgets */}
      <div className="p-5 flex flex-col gap-4">
        {/* Index Status Card */}
        <IndexStatusCard />

        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-border-light/40 dark:hover:border-border-dark/60 hover:bg-card-bg-light/40 dark:hover:bg-card-bg-dark/40 rounded-xl transition-all duration-200 cursor-pointer w-fit"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              Dark mode
            </>
          )}
        </button>
      </div>

    </aside>
  );
};
