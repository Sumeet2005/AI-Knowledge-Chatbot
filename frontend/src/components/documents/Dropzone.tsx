import { useState, useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface DropzoneProps {
  onFilesAdded: (files: FileList) => void;
}

export const Dropzone = ({ onFilesAdded }: DropzoneProps) => {
  const { uploading } = useChat();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      className={`relative w-full rounded-2xl border-2 border-dashed p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 select-none ${
        isDragActive
          ? 'border-cyan-400 bg-cyan-50/5 dark:bg-cyan-950/10 scale-[1.005]'
          : 'border-border-light/60 dark:border-border-dark bg-card-bg-light/20 dark:bg-card-bg-dark/30 hover:border-cyan-500/35 dark:hover:border-cyan-500/35'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />

      {/* Cloud upload icon styling */}
      <div className="w-14 h-14 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-900/60 mb-4 shadow-sm">
        <CloudUpload className="w-6 h-6 text-cyan-500 dark:text-cyan-400 animate-pulse" />
      </div>

      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
        Drop documents to index
      </h3>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        PDF, DOCX and TXT. Each file is chunked, embedded and written to the vector index — answers cite the exact chunk they came from.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onButtonClick}
          disabled={uploading}
          className="px-5 py-2 text-xs font-bold rounded-full bg-cyan-400 hover:bg-cyan-300 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-slate-950 shadow-[0_2px_10px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_16px_rgba(6,182,212,0.4)] scale-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
        >
          Choose files
        </button>
        <span className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          OR DRAG & DROP
        </span>
      </div>
    </div>
  );
};
export default Dropzone;
