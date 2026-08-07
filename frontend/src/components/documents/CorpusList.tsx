import { useState } from 'react';
import { FileText, Trash2, Inbox } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { formatBytes, getChunkCount } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface CorpusListProps {
  searchQuery: string;
  filterType: 'all' | 'pdf' | 'docx' | 'txt';
}

export const CorpusList = ({ searchQuery, filterType }: CorpusListProps) => {
  const { documents, deleteDocument, loadingDocs } = useChat();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    setDeletingId(id);
    const toastId = toast.loading(`Deleting and de-indexing "${name}"...`);
    try {
      await deleteDocument(id);
      toast.success(`"${name}" deleted and de-indexed.`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete "${name}".`, { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch {
      return 'Recent';
    }
  };

  // Filter logic
  const filteredDocuments = documents.filter((doc) => {
    const nameMatch = doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const ext = doc.original_filename.split('.').pop()?.toLowerCase();
    const typeMatch = filterType === 'all' || ext === filterType;
    return nameMatch && typeMatch;
  });

  if (loadingDocs && documents.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400 select-none">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-semibold">Loading corpus...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mt-8 select-none">
      {/* List Header */}
      <div className="flex items-center justify-between mb-4.5 border-b border-border-light/40 dark:border-border-dark/30 pb-2">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
          Indexed corpus
        </h2>
        <span className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'DOCUMENT' : 'DOCUMENTS'}
        </span>
      </div>

      {/* Empty State: Empty Corpus */}
      {documents.length === 0 ? (
        <div className="border border-dashed border-border-light dark:border-border-dark rounded-2xl p-10 text-center text-slate-400 dark:text-slate-600 bg-card-bg-light/10 dark:bg-card-bg-dark/10 flex flex-col items-center justify-center gap-3">
          <Inbox className="w-8 h-8 text-slate-350 dark:text-slate-750" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-400">Empty corpus</span>
            <span className="text-[11px]">No documents indexed yet. Upload files above to ground your workspace.</span>
          </div>
        </div>
      ) : /* Empty State: No search matches */
      filteredDocuments.length === 0 ? (
        <div className="border border-dashed border-border-light dark:border-border-dark rounded-2xl p-10 text-center text-slate-400 dark:text-slate-600 bg-card-bg-light/10 dark:bg-card-bg-dark/10 flex flex-col items-center justify-center gap-2">
          <Inbox className="w-7 h-7 text-slate-350 dark:text-slate-750" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-400">No search matches</span>
            <span className="text-[11px]">Try adjusting your query or extension filters.</span>
          </div>
        </div>
      ) : (
        /* List Items */
        <div className="flex flex-col gap-2.5">
          {filteredDocuments.map((doc) => {
            const chunkCount = getChunkCount(doc.original_filename, doc.file_size);
            const isDeleting = deletingId === doc.id;
            
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 bg-card-bg-light/60 dark:bg-card-bg-dark/60 border border-border-light/50 dark:border-border-dark/80 rounded-2xl shadow-sm hover:border-border-light/80 dark:hover:border-border-dark/80 hover:shadow-md transition-all duration-200 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-card-bg-light/50 dark:bg-card-bg-dark/60 flex items-center justify-center border border-border-light/60 dark:border-border-dark shrink-0">
                    <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight mb-1 pr-4">
                      {doc.original_filename}
                    </span>
                    <span className="text-[9px] font-mono text-slate-550 dark:text-slate-500 leading-none">
                      {formatBytes(doc.file_size)} • {chunkCount} {chunkCount === 1 ? 'chunk' : 'chunks'} • {formatDate(doc.uploaded_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-2 select-none">
                  {/* Ready Status Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/40 dark:border-emerald-900/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    READY
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(doc.id, doc.original_filename)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg border border-border-light/40 dark:border-border-dark hover:border-red-200 dark:hover:border-red-900/40 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CorpusList;
