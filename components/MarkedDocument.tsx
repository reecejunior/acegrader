
import React, { useRef, useState } from 'react';
import { GradingResult, Annotation } from '../types';
import { Download, X, AlertCircle, CheckCircle, Highlighter, PenTool, ShieldCheck, FileText, Info } from 'lucide-react';
import { Button } from './Button';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface MarkedDocumentProps {
  result: GradingResult;
  onClose: () => void;
}

export const MarkedDocument: React.FC<MarkedDocumentProps> = ({ result, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Content priority: AI Transcribed Text > Raw Original Text
  const displayContent = result.fullTranscribedText || (result.originalType === 'text' ? result.originalContent : "Text extraction unavailable.");

  const downloadPDF = async () => {
    if (!containerRef.current) return;
    setIsDownloading(true);

    try {
      const { jsPDF } = window.jspdf;
      
      const canvas = await window.html2canvas(containerRef.current, {
        scale: 2, 
        backgroundColor: '#fdfbf7',
        useCORS: true,
        logging: false,
        windowWidth: containerRef.current.scrollWidth,
        windowHeight: containerRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${result.studentName.replace(/\s+/g, '_')}_Marked_Report.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/98 backdrop-blur-xl flex flex-col overflow-hidden animate-fade-in">
      
      {/* Editorial Header Bar */}
      <div className="flex justify-between items-center px-8 py-4 bg-white dark:bg-black border-b border-slate-200 dark:border-white/10 shrink-0">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={20} />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Verified Assessment</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10"></div>
            <p className="text-slate-900 dark:text-white font-serif italic text-lg">
                Dossier: <span className="font-bold">{result.studentName}</span>
            </p>
         </div>
         <div className="flex gap-4">
             <Button variant="outline" onClick={downloadPDF} isLoading={isDownloading} className="rounded-full border-slate-200 dark:border-white/10">
                <Download size={14} className="mr-2" />
                Export Official Transcript
             </Button>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                <X size={24} />
             </button>
         </div>
      </div>

      {/* Main Dossier Workspace */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#050505] p-6 md:p-12 flex justify-center">
         
         <div 
           ref={containerRef} 
           className="w-full max-w-[1200px] bg-[#fdfbf7] shadow-2xl flex flex-col md:flex-row relative min-h-screen border border-slate-200"
         >
            {/* Left Margin: Institutional Identification */}
            <div className="w-16 bg-slate-900 flex flex-col items-center py-12 gap-12 text-white/20 select-none">
                <div className="[writing-mode:vertical-lr] uppercase tracking-[0.5em] text-[10px] font-bold">Ace Grader Atelier • Official Archive</div>
                <div className="mt-auto pb-8">
                    <FileText size={20} />
                </div>
            </div>

            {/* Center Content: The Exam Script */}
            <div className="flex-1 p-12 md:p-20 relative bg-paper-50">
                {/* Official Stamp */}
                <div className="absolute top-12 right-12 z-20 pointer-events-none transform rotate-[-15deg] mix-blend-multiply">
                    <div className="border-[5px] border-red-700/80 rounded-2xl p-4 text-red-700/80 font-black text-center animate-stamp bg-white/10 backdrop-blur-[1px]">
                        <div className="text-[10px] uppercase tracking-widest border-b-2 border-red-700/80 mb-2 pb-1 font-sans">Final Evaluation</div>
                        <div className="text-6xl font-hand leading-none">{Math.round((result.totalScore/result.maxTotalScore)*100)}%</div>
                        <div className="text-[8px] uppercase tracking-tighter mt-2 font-sans">Pedagogical Standard Alpha-7</div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto space-y-16">
                    {/* Script Header */}
                    <div className="border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Student Identity</h2>
                            <p className="text-3xl font-serif italic text-slate-900 font-bold">{result.studentName}</p>
                            <p className="text-sm text-slate-500 font-sans">{result.className || "General Period"}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Exam Date</h2>
                            <p className="text-lg font-serif italic text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    {/* The Work Body */}
                    <div className="relative">
                        {/* Decorative Line Paper Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                             style={{ backgroundImage: `linear-gradient(to bottom, #000 1px, transparent 1px)`, backgroundSize: '100% 2.5rem' }}>
                        </div>
                        
                        <article className="relative z-10 font-serif text-xl leading-[2.5rem] text-slate-800 whitespace-pre-wrap selection:bg-red-100">
                            {displayContent}
                        </article>
                    </div>

                    {/* Summative Conclusion */}
                    <div className="pt-20 border-t border-slate-200">
                        <div className="flex items-center gap-4 mb-6">
                            <PenTool size={20} className="text-red-700" />
                            <h3 className="font-hand text-3xl text-red-800 font-bold">Summative Feedback</h3>
                        </div>
                        <p className="font-hand text-2xl text-slate-900 leading-relaxed bg-slate-100/50 p-8 rounded-2xl border-l-8 border-slate-900 italic">
                            "{result.feedback}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: The Red Ledger (Annotations) */}
            <div className="w-[400px] bg-[#fffdf5] border-l-2 border-red-100/50 relative p-10 hidden lg:block overflow-hidden">
                <div className="sticky top-10 space-y-12">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-800/40 mb-8 flex items-center gap-2">
                           <Info size={12} /> Analytical Ledger
                        </h3>
                        
                        <div className="space-y-10">
                            {result.annotations && result.annotations.length > 0 ? (
                                result.annotations.map((note, idx) => (
                                    <div key={idx} className="relative group animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div className="absolute -left-14 top-0 w-10 h-10 rounded-full border-2 border-red-700 bg-white text-red-700 flex items-center justify-center font-hand font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                                            {idx + 1}
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="bg-red-50/50 border-l-4 border-red-700 p-4 rounded-r-xl shadow-sm">
                                                <div className="text-[9px] font-bold uppercase text-red-800/40 mb-2 truncate">Ref: "{note.originalText}"</div>
                                                <div className="font-hand text-red-900 text-lg font-bold mb-1">{note.correction}</div>
                                                <p className="text-[11px] text-red-800/70 font-sans leading-relaxed">{note.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="font-hand text-slate-300 text-2xl italic">No critical refinements flagged.</div>
                            )}
                        </div>
                    </div>

                    {/* Actionable Points */}
                    <div className="pt-12 border-t border-red-100">
                         <h4 className="font-hand text-2xl text-red-800 font-bold mb-6">Instructor's Notes</h4>
                         <ul className="space-y-4">
                            {result.improvementTips.map((tip, i) => (
                                <li key={i} className="flex gap-3 text-xs text-slate-700 leading-relaxed">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                                    <span className="font-medium italic">{tip}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
