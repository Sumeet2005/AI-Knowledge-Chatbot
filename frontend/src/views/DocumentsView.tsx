import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Check, AlertCircle, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { PanelHeader } from '../components/ui/PanelHeader';
import { Dropzone } from '../components/documents/Dropzone';
import { CorpusList } from '../components/documents/CorpusList';
import { formatBytes } from '../utils/helpers';
import toast from 'react-hot-toast';

interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'processing' | 'embedding' | 'indexed' | 'failed';
}

export const DocumentsView = () => {
  const { uploadFile, fetchDocuments } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'docx' | 'txt'>('all');
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const uploadCounterRef = useRef(0);

  const handleFilesAdded = async (files: FileList) => {
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase();

      // Validation check
      if (!extension || !allowedExtensions.includes(extension)) {
        toast.error(`"${file.name}" has an unsupported format. Use PDF, DOCX, or TXT.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      // Add to queue
      uploadCounterRef.current += 1;
      const queueId = `${uploadCounterRef.current}-${file.name}-${i}`;
      const newQueueItem: UploadQueueItem = {
        id: queueId,
        name: file.name,
        size: file.size,
        progress: 5,
        status: 'uploading'
      };

      setUploadQueue((prev) => [...prev, newQueueItem]);

      // Trigger upload process in background
      processFileUpload(file, queueId);
    }
  };

  const processFileUpload = async (file: File, queueId: string) => {
    // Start progress interval ticks to simulate backend stages (Processing -> Embedding)
    let currentProgress = 5;
    let isUploadComplete = false;

    const interval = setInterval(() => {
      setUploadQueue((prev) =>
        prev.map((item) => {
          if (item.id !== queueId) return item;

          // If upload is still in network stage, don't simulate ticks yet
          if (!isUploadComplete && item.status === 'uploading') {
            return item;
          }

          let nextProgress = currentProgress;
          let nextStatus = item.status;

          if (currentProgress < 75) {
            nextProgress += Math.random() * 5 + 1;
            nextStatus = 'processing';
          } else if (currentProgress < 95) {
            nextProgress += Math.random() * 2 + 0.5;
            nextStatus = 'embedding';
          }

          // Bound nextProgress to max 95% until API responds
          nextProgress = Math.min(nextProgress, 95);
          currentProgress = nextProgress;

          return { ...item, progress: nextProgress, status: nextStatus };
        })
      );
    }, 250);

    try {
      // Dispatch API request with network progress reporter callback
      const success = await uploadFile(file, (pct) => {
        // Map 0-100% of network upload directly to 0-40% progress bar
        const mappedPct = Math.round(pct * 0.4);
        if (pct >= 100) {
          isUploadComplete = true;
          currentProgress = 40;
        }
        setUploadQueue((prev) =>
          prev.map((item) => {
            if (item.id !== queueId) return item;
            return {
              ...item,
              progress: Math.max(item.progress, mappedPct),
              status: pct < 100 ? 'uploading' : 'processing'
            };
          })
        );
      });

      clearInterval(interval);

      if (success) {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? { ...item, progress: 100, status: 'indexed' }
              : item
          )
        );
        // Refresh corpus lists
        fetchDocuments();
        
        // Remove item from queue after a brief success display delay
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
        }, 2000);
      } else {
        throw new Error('Upload returned fail status');
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? { ...item, status: 'failed' }
            : item
        )
      );
      toast.error(`Failed to index "${file.name}"`);
    }
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent select-none">
      <PanelHeader title="Documents" subtitle="CORPUS & INDEXING" />
      
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-[800px] mx-auto w-full flex flex-col gap-6">
          
          {/* Upload Area */}
          <Dropzone onFilesAdded={handleFilesAdded} />

          {/* Active Uploads Queue (if items are active) */}
          <AnimatePresence>
            {uploadQueue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col gap-2.5"
              >
                <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                  ACTIVE INDEXING QUEUE ({uploadQueue.length})
                </span>
                
                <div className="flex flex-col gap-2">
                  {uploadQueue.map((item) => {
                    const isFailed = item.status === 'failed';
                    const isIndexed = item.status === 'indexed';
                    
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col gap-2.5 p-3.5 bg-white dark:bg-card-bg-dark/40 border border-slate-200/80 dark:border-border-dark/80 rounded-2xl shadow-sm relative overflow-hidden"
                      >
                        {/* Top row info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {isFailed ? (
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            ) : isIndexed ? (
                              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-cyan-500 animate-spin shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate pr-4">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-455 shrink-0 select-none">
                            <span>{formatBytes(item.size)}</span>
                            <span>•</span>
                            <span className={`uppercase ${
                              isFailed 
                                ? 'text-red-500' 
                                : isIndexed 
                                ? 'text-emerald-500' 
                                : 'text-cyan-500'
                            }`}>
                              {item.status === 'uploading' && `Uploading (${Math.round(item.progress)}%)`}
                              {item.status === 'processing' && `Processing (${Math.round(item.progress)}%)`}
                              {item.status === 'embedding' && `Embedding (${Math.round(item.progress)}%)`}
                              {item.status === 'indexed' && 'Indexed'}
                              {item.status === 'failed' && 'Failed'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Track */}
                        {!isFailed && (
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/20 dark:border-slate-800/20 overflow-hidden relative">
                            <motion.div
                              initial={{ width: '5%' }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 0.3 }}
                              className={`h-full rounded-full bg-gradient-to-r ${
                                isIndexed 
                                  ? 'from-emerald-500 to-teal-500' 
                                  : 'from-cyan-500 to-indigo-500'
                              }`}
                            />
                          </div>
                        )}

                        {/* Failed error actions overlay */}
                        {isFailed && (
                          <button
                            onClick={() => removeQueueItem(item.id)}
                            className="absolute right-3.5 top-3.5 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            title="Close failed upload status"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filters Toolbar Container */}
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 select-none">
            
            {/* Instant Search input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search indexed files..."
                className="w-full pl-9 pr-8 py-2 border border-slate-200/60 dark:border-border-dark/65 bg-white/60 dark:bg-[#12151e]/30 hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/40 outline-none text-slate-900 dark:text-white text-xs md:text-sm rounded-xl transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Extension Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'pdf', 'docx', 'txt'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    filterType === type
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                      : 'bg-white/40 dark:bg-card-bg-dark/20 text-slate-505 dark:text-slate-450 border-slate-200/60 dark:border-border-dark hover:border-slate-350 dark:hover:border-slate-800 hover:bg-white/65 dark:hover:bg-[#12151e]/40'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

          </div>

          {/* Main corpus file list */}
          <CorpusList searchQuery={searchQuery} filterType={filterType} />

        </div>
      </div>
    </div>
  );
};
export default DocumentsView;
