import React, { useState } from 'react';
import { SubmissionInput, Rubric } from '../types';
import { FileUpload } from './FileUpload';
import { Button } from './Button';
import { Card } from './Card';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { parseRubric } from '../services/geminiService';
import { Loader } from './Loader';

interface CreateRubricProps {
  onRubricCreated: (rubric: Rubric) => void;
  onCancel: () => void;
}

export const CreateRubric: React.FC<CreateRubricProps> = ({ onRubricCreated, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [subject, setSubject] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRubricTextSubmit = async (inputs: SubmissionInput[]) => {
    // Rubrics are usually single file/text, so take the first one
    const input = inputs[0];
    if (!input) return;

    setIsProcessing(true);
    try {
      // Pass the entire input object to the service so it can handle files via Multimodal API
      const parsedRubric = await parseRubric(input);
      
      // Inject subject
      parsedRubric.subject = subject;
      
      onRubricCreated(parsedRubric);
    } catch (error) {
      alert("Failed to parse rubric. If uploading a file, ensure it is clear and legible. Try again.");
      console.error(error);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <Loader message="Structuring Rubric..." subMessage="AI is analyzing your criteria" />;
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-6 animate-slide-up">
      <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      {step === 1 ? (
        <Card title="Step 1: Define Subject" className="py-10">
          <div className="space-y-6 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Subject Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. AP English Literature, Physics 101, Creative Writing..."
                className="w-full bg-[#050810] border border-indigo-500/10 rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-brand-500 transition-all placeholder-slate-600 shadow-inner"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">This name will be used to organize rubrics on your dashboard.</p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button disabled={!subject.trim()} onClick={() => setStep(2)} className="w-full sm:w-auto">
                Next Step <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title={`Step 2: Upload ${subject} Rubric`}>
          <FileUpload 
            label="Rubric Content"
            description="Paste your rubric text or upload a .txt or PDF file."
            placeholder="e.g. 1. Argument (10 pts): The essay makes a clear claim..."
            onContentSubmit={handleRubricTextSubmit}
            isProcessing={false}
            icon="rubric"
          />
        </Card>
      )}
    </div>
  );
};