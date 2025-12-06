import React, { useState } from 'react';
import { Rubric } from '../types';
import { Button } from './Button';
import { Card } from './Card';
import { ChevronLeft, Save, Sparkles, CheckSquare, Square, Lightbulb, AlertTriangle } from 'lucide-react';

interface RubricReviewProps {
  rubric: Rubric;
  onConfirm: (finalRubric: Rubric) => void;
  onRetake: () => void;
}

export const RubricReview: React.FC<RubricReviewProps> = ({ rubric, onConfirm, onRetake }) => {
  // Initialize with all indices selected by default
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set(rubric.criteria.map((_, i) => i)));

  const toggleCriterion = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const handleConfirm = () => {
    if (selectedIndices.size === 0) {
        alert("Please select at least one criterion to grade.");
        return;
    }

    // Filter the rubric to only include selected criteria
    const filteredCriteria = rubric.criteria.filter((_, index) => selectedIndices.has(index));
    
    const finalRubric: Rubric = {
        ...rubric,
        criteria: filteredCriteria
    };

    onConfirm(finalRubric);
  };

  const totalPoints = rubric.criteria
    .filter((_, i) => selectedIndices.has(i))
    .reduce((acc, curr) => acc + curr.maxPoints, 0);

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-4xl mx-auto">
      
      <div className="flex flex-col items-center text-center space-y-4">
         <div className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/20">
           AI Analysis Complete
         </div>
         <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{rubric.title || "Untitled Rubric"}</h2>
         <p className="text-slate-500 dark:text-slate-400 max-w-xl">{rubric.description}</p>
      </div>

      {/* Key Pointers Section */}
      {rubric.keyPointers && rubric.keyPointers.length > 0 && (
          <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lightbulb size={100} className="text-indigo-500" />
              </div>
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider text-sm">Key Focus Areas Detected</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rubric.keyPointers.map((pointer, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/10">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold mt-0.5">
                                  {idx + 1}
                              </span>
                              <span className="text-sm text-indigo-900 dark:text-indigo-200/80 font-medium leading-tight">{pointer}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <Card glow className="bg-white dark:bg-[#0C101A] border-slate-200 dark:border-indigo-500/10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="font-bold text-slate-700 dark:text-white">Grading Criteria</h3>
            <div className="text-xs text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                <span className="font-bold text-brand-600 dark:text-brand-400">{selectedIndices.size}</span> of {rubric.criteria.length} Selected
            </div>
        </div>

        <div className="space-y-4">
          {rubric.criteria.map((criterion, idx) => {
            const isSelected = selectedIndices.has(idx);
            return (
                <div 
                    key={idx} 
                    onClick={() => toggleCriterion(idx)}
                    className={`
                        relative group cursor-pointer flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all duration-300
                        ${isSelected 
                            ? 'bg-white dark:bg-[#050810] border-brand-200 dark:border-brand-500/30 shadow-sm' 
                            : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-60 grayscale-[0.8]'
                        }
                    `}
                >
                    {/* Checkbox */}
                    <div className="absolute top-4 left-4 md:static md:flex md:items-center">
                        {isSelected 
                            ? <CheckSquare className="text-brand-500" size={20} /> 
                            : <Square className="text-slate-400" size={20} />
                        }
                    </div>

                    <div className="flex-1 space-y-1 ml-8 md:ml-0">
                        <h4 className={`font-semibold ${isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {criterion.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{criterion.description}</p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center gap-2 ml-8 md:ml-0">
                        <span className={`text-2xl font-light ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                            {criterion.maxPoints}
                        </span>
                        <span className="text-xs text-slate-400 uppercase font-bold">PTS</span>
                    </div>
                </div>
            );
          })}
        </div>
        
        {selectedIndices.size < rubric.criteria.length && (
             <div className="mt-6 flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <AlertTriangle size={16} />
                <span>Partial grading enabled. AI will only evaluate the selected criteria.</span>
             </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-indigo-500/10 flex justify-between items-center">
           <span className="text-sm text-slate-500 uppercase font-bold">Total Potential Score</span>
           <span className="text-4xl font-light text-slate-900 dark:text-white">
             {totalPoints}
           </span>
        </div>
      </Card>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="secondary" onClick={onRetake}>
          <ChevronLeft size={16} />
          {rubric.id ? 'Back to Dashboard' : 'Edit Criteria'}
        </Button>
        <Button onClick={handleConfirm} className="pl-6 pr-8">
          <Save size={18} />
          {rubric.id ? 'Confirm & Mark' : 'Confirm & Save'}
        </Button>
      </div>
    </div>
  );
};