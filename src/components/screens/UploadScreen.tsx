import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  CloudUpload, 
  FileText, 
  X, 
  Lock, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassButton } from '../common/GlassButton';

export const UploadScreen: React.FC = () => {
  const { 
    documents, 
    removeDocument, 
    addDocument, 
    startAnalysis,
    navigateTo 
  } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const f = files[0];
      const type = f.name.endsWith('.docx') ? 'docx' : 'pdf';
      const sizeStr = `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
      addDocument({
        name: f.name,
        size: sizeStr,
        type,
        rawFile: f
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const f = files[0];
      const type = f.name.endsWith('.docx') ? 'docx' : 'pdf';
      const sizeStr = `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
      addDocument({
        name: f.name,
        size: sizeStr,
        type,
        rawFile: f
      });
    }
  };

  const handleUploadAndAnalyze = () => {
    startAnalysis();
  };

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto flex flex-col justify-between">
      {/* Header */}
      <div>
        <AppHeader title="Upload Document" />

        <div className="px-5 pt-4 space-y-6">
          {/* Large Glass Upload Area */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
              isDragging 
                ? 'bg-[#FF6B22]/10 border-[#FF6B22] scale-[1.01]' 
                : 'glass-card border-white/80 hover:border-[#FF6B22]/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />

            {/* Cloud Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF2EA] border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22] mb-4 shadow-sm">
              <CloudUpload className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-[#151515] mb-1">
              Upload your legal document
            </h3>
            <p className="text-xs text-[#6F6A64] mb-3">
              Drag & drop a file here or tap to browse
            </p>

            <span className="inline-block px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[11px] font-medium text-[#6F6A64]">
              Supports PDF, DOCX (Max 20MB)
            </span>
          </motion.div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6F6A64] uppercase tracking-wider">
                Ready for Analysis ({documents.length})
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#FF6B22] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another
              </button>
            </div>

            <div className="space-y-2.5">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  className="glass-card p-3.5 rounded-2xl flex items-center justify-between border border-white/80"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        doc.type === 'pdf'
                          ? 'bg-red-50 text-red-600 border border-red-200/60'
                          : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="text-left">
                      <h4 className="text-xs font-semibold text-[#151515] line-clamp-1">
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-[#6F6A64]">
                        {doc.size} · {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDocument(doc.id);
                    }}
                    className="w-7 h-7 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="px-5 pt-8 space-y-3">
        <GlassButton
          fullWidth
          size="lg"
          variant="primary"
          onClick={handleUploadAndAnalyze}
        >
          Upload & Analyze
        </GlassButton>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#6F6A64]">
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          <span>Your documents are private and secure.</span>
        </div>
      </div>
    </div>
  );
};
