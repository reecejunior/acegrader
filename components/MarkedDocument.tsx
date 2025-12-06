import React, { useRef, useState } from 'react';
import { GradingResult, Annotation } from '../types';
import { Download, X, AlertCircle, CheckCircle, HelpCircle, Highlighter, PenTool } from 'lucide-react';
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

  // Determine the content to display: Prefer the transcribed text from AI
  const displayContent = result.fullTranscribedText || (result.originalType === 'text' ? result.originalContent : "Text extraction unavailable for this document.");

  const downloadPDF = async () => {
    if (!containerRef.current) return;
    setIsDownloading(true);

    try {
      const { jsPDF } = window.jspdf;
      
      // Capture the container at high resolution
      const canvas = await window.html2canvas(containerRef.current, {
        scale: 2, 
        backgroundColor: '#fdfbf7', // Paper color
        useCORS: true,
        logging: false
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

      pdf.save(`${result.studentName.replace(/\s+/g, '_')}_Marked.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getAnnotationIcon = (type: string) => {
      switch(type) {
          case 'error': return <X size={16} className="text-red-700" />;
          case 'praise': return <CheckCircle size={16} className="text-green-700" />;
          case 'grammar': return <Highlighter size={16} className="text-blue-700" />;
          default: return <AlertCircle size={16} className="text-orange-700" />;
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020408]/95 backdrop-blur-md flex flex-col overflow-hidden animate-fade-in">
      
      {/* Toolbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#0A0F1C] border-b border-white/10 shrink-0">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <span className="font-hand text-red-500 text-3xl rotate-[-3deg] font-bold">Strict Review</span> 
            </h2>
            <div className="h-6 w-px bg-white/10"></div>
            <p className="text-slate-400 text-sm">Paper by: <span className="text-white font-semibold">{result.studentName}</span></p>
         </div>
         <div className="flex gap-3">
             <Button variant="secondary" onClick={downloadPDF} isLoading={isDownloading} className="text-xs px-4 py-2">
                <Download size={16} />
                Download PDF
             </Button>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={24} />
             </button>
         </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#2d3035] flex justify-center">
         
         {/* THE PAPER (Printable Area) */}
         <div 
           ref={containerRef} 
           className="w-full max-w-[1100px] bg-[#fdfbf7] shadow-2xl flex flex-col md:flex-row relative overflow-hidden"
           style={{ minHeight: '1414px' }} // Approx A4 aspect ratio height for width 1000ish
         >
            {/* 1. MAIN CONTENT (Student Work - TEXT ONLY) */}
            <div className="flex-1 p-8 md:p-12 border-r border-slate-300 relative">
                
                {/* Grading Stamps (Overlaid on top left) */}
                <div className="absolute top-8 right-8 z-20 flex flex-col items-center transform rotate-[-12deg] opacity-90 mix-blend-multiply pointer-events-none">
                    <div className="border-[6px] border-red-700 rounded-lg p-3 text-red-700 font-black uppercase text-center animate-stamp">
                        <div className="text-sm tracking-widest border-b-2 border-red-700 mb-1 pb-1">Final Grade</div>
                        <div className="text-7xl leading-none font-hand">{Math.round((result.totalScore/result.maxTotalScore)*100)}%</div>
                        <div className="text-xs font-serif italic mt-1">Examiner ID: AI-01</div>
                    </div>
                </div>

                {/* Header (Simulating Paper Header) */}
                <div className="mb-10 border-b-2 border-slate-800 pb-2 flex justify-between items-end opacity-70">
                    <div>
                        <h1 className="text-xl font-serif font-bold text-slate-900 uppercase tracking-widest">Assessment Record</h1>
                        <p className="font-hand text-slate-600 text-lg">Student: {result.studentName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase">Date</p>
                        <p className="font-hand text-slate-800">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* ACTUAL STUDENT CONTENT RENDER - TEXT */}
                <div className="relative min-h-[800px]">
                    
                    {/* Render Transcribed Text */}
                    <div className="font-serif text-lg leading-[2.5rem] text-slate-800 whitespace-pre-wrap font-medium relative z-10">
                        {displayContent}
                    </div>

                    {/* Harsh Summary Overlay - Stamped at bottom of content */}
                    <div className="mt-12 p-6 border-2 border-red-700/30 bg-red-50 rounded-lg transform -rotate-1 relative mx-4">
                        <h3 className="text-red-800 font-bold uppercase tracking-widest text-xs mb-2 border-b border-red-200 pb-1">Examiner Summary</h3>
                        <p className="font-hand text-xl text-red-900 leading-relaxed font-semibold">
                            "{result.summary}"
                        </p>
                    </div>

                </div>
            </div>

            {/* 2. THE RED MARGIN (Corrections) */}
            <div className="w-[340px] bg-[#fffdf5] border-l-2 border-red-100 relative shrink-0">
                {/* Margin Line */}
                <div className="absolute inset-y-0 left-6 w-0.5 bg-red-300/50 h-full"></div>

                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-8 ml-4">
                       <PenTool size={24} className="text-red-700" />
                       <h3 className="font-hand text-3xl text-red-800 font-bold">Corrections</h3>
                    </div>

                    <div className="space-y-8">
                        {result.annotations && result.annotations.length > 0 ? (
                            result.annotations.map((note, idx) => (
                                <div key={idx} className="relative pl-8 group">
                                    {/* Number Circle */}
                                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full border-2 border-red-700 bg-[#fffdf5] text-red-700 flex items-center justify-center font-hand font-bold text-lg z-20 shadow-sm">
                                        {idx + 1}
                                    </div>
                                    
                                    {/* Connector */}
                                    <div className="absolute left-4 top-8 bottom-[-32px] w-0.5 bg-red-200/50 group-last:hidden"></div>

                                    <div className="bg-white p-3 rounded-br-xl rounded-tr-xl border-l-4 border-red-700 shadow-sm ml-2 transform transition-transform hover:-translate-y-1 hover:shadow-md">
                                        
                                        {/* Original Text Quote */}
                                        <div className="mb-2 text-xs font-serif text-slate-500 italic border-l-2 border-slate-200 pl-2 bg-slate-50 py-1 rounded-r">
                                            "{note.originalText.substring(0, 60)}{note.originalText.length > 60 ? '...' : ''}"
                                        </div>

                                        {/* Correction */}
                                        <div className="font-hand text-red-800 text-lg font-bold leading-6 mb-1">
                                            {note.correction}
                                        </div>
                                        
                                        {/* Comment */}
                                        <p className="text-xs text-red-900/70 font-sans leading-tight">
                                            {note.comment}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="pl-8 text-slate-400 font-hand text-xl rotate-[-2deg]">
                                No specific markup required.
                            </div>
                        )}
                        
                        {/* Overall Feedback in Margin */}
                        <div className="mt-12 pt-6 border-t-2 border-red-100 border-dashed pl-6 relative">
                             <h4 className="font-hand text-2xl text-red-800 font-bold mb-3">Strict Advice</h4>
                             <ul className="list-disc list-outside ml-4 space-y-2">
                                {result.improvementTips.slice(0, 4).map((tip, i) => (
                                    <li key={i} className="text-sm text-slate-700 font-medium leading-tight">
                                        {tip}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};