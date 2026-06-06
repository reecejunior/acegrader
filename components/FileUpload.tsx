import React, { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Feather, Image as ImageIcon, X, FileType, User, Users, Plus, Layers } from 'lucide-react';
import { Button } from './Button';
import { SubmissionInput } from '../types';

interface FileUploadProps {
  label: string;
  description: string;
  placeholder: string;
  onContentSubmit: (inputs: SubmissionInput[]) => void;
  isProcessing: boolean;
  icon?: 'rubric' | 'paper';
  requireStudentName?: boolean;
  buttonText?: string;
}

interface FileItem {
    file: File;
    data: string; // base64 or raw text depending on extraction
    id: string;
    overrideMime?: string; // To manually set text/plain if extracted on client
}

declare global {
  interface Window {
    mammoth: any;
  }
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  description, 
  placeholder,
  onContentSubmit, 
  isProcessing,
  icon = 'paper',
  requireStudentName = false,
  buttonText
}) => {
  const [text, setText] = useState('');
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  
  // Batch State
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToBase64 = (file: File): Promise<{ data: string, mimeType?: string }> => {
    return new Promise((resolve, reject) => {
      // 1. Image Optimization
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve({ data: dataUrl.split(',')[1] });
            } else {
                reject(new Error("Canvas context not available"));
            }
          };
          img.onerror = (err) => reject(err);
          img.src = event.target?.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      // 2. Word Documents (.docx) -> Text Extraction via Mammoth
      if (
        file.name.endsWith('.docx') || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        if (!window.mammoth) {
           reject(new Error("Word document parser (Mammoth) not loaded. Please refresh."));
           return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            window.mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then((result: any) => {
                    // We resolve as raw text, not base64. 
                    // This avoids sending binary garbage to the AI.
                    resolve({ data: result.value, mimeType: 'text/plain' });
                })
                .catch((err: any) => reject(err));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
        return;
      }

      // 3. PDF Size Check
      if (file.type === 'application/pdf') {
        const MAX_PDF_SIZE = 4 * 1024 * 1024; // 4MB
        if (file.size > MAX_PDF_SIZE) {
            reject(new Error(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use a file under 4MB.`));
            return;
        }
      }

      // 4. Default (PDF, Text)
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ data: base64 });
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const newItems: FileItem[] = [];
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

    for (const file of Array.from(files)) {
        // Text Files
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            const content = await file.text();
            if (selectedFiles.length === 0 && files.length === 1) {
                setText(content);
                return;
            }
        }

        if (validTypes.includes(file.type) || file.type === 'text/plain' || file.name.endsWith('.docx')) {
            try {
                const { data, mimeType } = await convertFileToBase64(file);
                newItems.push({
                    file,
                    data,
                    id: Math.random().toString(36).substring(7),
                    overrideMime: mimeType
                });
            } catch (err: any) {
                console.error("Error reading file", file.name, err);
                alert(err.message || `Error reading ${file.name}`);
            }
        }
    }

    if (newItems.length > 0) {
        setSelectedFiles(prev => [...prev, ...newItems]);
        setText('');
    }
  };

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    // Mode 1: Text Input (Single)
    if (selectedFiles.length === 0) {
        if (requireStudentName && !studentName.trim()) {
            alert("Please enter a student name.");
            return;
        }
        onContentSubmit([{
            type: 'text',
            content: text,
            studentName: studentName,
            className: className
        }]);
        return;
    }

    const processFiles = (files: FileItem[]): SubmissionInput[] => {
        return files.map(item => {
            // If we extracted text from DOCX on client, send as TEXT
            if (item.overrideMime === 'text/plain') {
                return {
                    type: 'text',
                    content: item.data, // This is raw text
                    fileName: item.file.name,
                    studentName: studentName || "",
                    className: className || ""
                };
            }
            // Otherwise, send as FILE (Base64)
            return {
                type: 'file',
                content: item.data,
                mimeType: item.file.type.startsWith('image/') ? 'image/jpeg' : item.file.type,
                fileName: item.file.name,
                studentName: studentName || "",
                className: className || ""
            };
        });
    };

    // Mode 2: Single File
    if (selectedFiles.length === 1) {
         if (requireStudentName && !studentName.trim()) {
            alert("Please enter a student name.");
            return;
        }
        onContentSubmit(processFiles(selectedFiles));
        return;
    }

    // Mode 3: Batch
    if (selectedFiles.length > 1) {
        onContentSubmit(processFiles(selectedFiles));
    }
  };

  const isBatch = selectedFiles.length > 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <div className="p-3 rounded-full bg-brand-50 dark:bg-white/5 border border-brand-200 dark:border-white/10 mb-2 shadow-lg shadow-brand-500/10 dark:shadow-black/20">
          {icon === 'rubric' ? <Feather className="text-amber-500 dark:text-amber-400" size={24} /> : <FileText className="text-brand-600 dark:text-indigo-400" size={24} />}
        </div>
        <h2 className="text-3xl font-light text-slate-800 dark:text-white font-serif italic">{label}</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed text-sm">{description}</p>
      </div>

      {/* Student Details Input - Hide in Batch Mode */}
      {requireStudentName && !isBatch && selectedFiles.length <= 1 && (
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl mx-auto mb-4 animate-fade-in">
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Student Name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-white dark:bg-[#050810] border border-slate-200 dark:border-indigo-500/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-400 dark:placeholder-slate-600 shadow-sm"
                />
            </div>
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Users size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Class / Period (Optional)"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full bg-white dark:bg-[#050810] border border-slate-200 dark:border-indigo-500/10 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-400 dark:placeholder-slate-600 shadow-sm"
                />
            </div>
        </div>
      )}

      {/* Batch Indicator */}
      {isBatch && (
         <div className="max-w-xl mx-auto mb-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Layers size={18} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">Batch Marking Mode Active</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-300/70">Student names and classes will be automatically extracted from the documents.</p>
            </div>
         </div>
      )}

      <div 
        className={`
          relative group transition-all duration-500 rounded-xl border border-dashed min-h-[280px] flex flex-col
          ${isDragOver 
            ? 'border-brand-500 bg-brand-50/50 dark:bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
            : 'border-slate-300 dark:border-indigo-500/10 hover:border-brand-400 dark:hover:border-indigo-500/20 bg-white/50 dark:bg-indigo-950/5'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-100/50 dark:from-black/20 to-transparent rounded-t-xl pointer-events-none" />
        
        {/* FILE LIST OR TEXT AREA */}
        {selectedFiles.length > 0 ? (
          <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 content-start">
             {selectedFiles.map((item) => (
                 <div key={item.id} className="relative group/item bg-white dark:bg-[#0A0F1C] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex flex-col items-center text-center animate-fade-up shadow-sm">
                    <button 
                        onClick={() => removeFile(item.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover/item:opacity-100"
                    >
                        <X size={14} />
                    </button>
                    <div className="w-12 h-12 mb-3 rounded-lg bg-brand-50 dark:bg-indigo-500/10 flex items-center justify-center text-brand-600 dark:text-indigo-400">
                        {item.file.type.includes('pdf') || item.file.name.includes('.doc') ? <FileType size={24} /> : <ImageIcon size={24} />}
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 w-full truncate px-2">{item.file.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">{(item.file.size / 1024).toFixed(0)} KB</p>
                 </div>
             ))}
             
             {/* Add More Button */}
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-white gap-2"
             >
                <Plus size={24} />
                <span className="text-xs font-medium">Add File</span>
             </button>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full min-h-[280px] bg-transparent p-8 resize-none focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 font-serif text-lg leading-relaxed custom-scrollbar selection:bg-brand-200 dark:selection:bg-indigo-500/30"
              spellCheck={false}
            />
            
            <div className="absolute bottom-6 right-6 flex gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 transition-colors shadow-sm"
                title="Upload Files"
              >
                <Upload size={14} />
                <span>Upload Files</span>
              </button>
              <button 
                onClick={async () => {
                  const clipText = await navigator.clipboard.readText();
                  setText(clipText);
                //   alert("Content pasted from clipboard"); // Removed annoying alert for paste
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 transition-colors shadow-sm"
                title="Paste from Clipboard"
              >
                <Clipboard size={14} />
                <span>Paste</span>
              </button>
            </div>
          </>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          multiple 
          accept=".txt,.md,.pdf,.doc,.docx,image/*" 
          onChange={onInputChange}
        />
      </div>

      <div className="flex justify-center pt-2">
        <Button 
          onClick={handleSubmit} 
          disabled={(!text.trim() && selectedFiles.length === 0) || (!isBatch && requireStudentName && !studentName.trim())} 
          isLoading={isProcessing}
          className="min-w-[200px]"
        >
          {buttonText ? buttonText : (
            isProcessing ? 'Processing Batch...' : 
            selectedFiles.length > 1 ? `Mark ${selectedFiles.length} Papers` :
            selectedFiles.length === 1 ? 'Mark Paper' : 
            'Proceed to Evaluation'
          )}
        </Button>
      </div>
    </div>
  );
};