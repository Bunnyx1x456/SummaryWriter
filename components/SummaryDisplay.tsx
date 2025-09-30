
import React, { useState } from 'react';
import { CopyIcon, CheckIcon, RedoIcon } from './Icons';
import { marked } from 'marked';

interface SummaryDisplayProps {
  summary: string;
  onReset: () => void;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, onReset }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const htmlSummary = marked.parse(summary);

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-700">Ваш Конспект</h2>
            <div className="flex gap-2">
                 <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                    {copied ? 'Скопійовано!' : 'Копіювати'}
                </button>
                 <button 
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    <RedoIcon className="w-5 h-5" />
                    Записати ще
                </button>
            </div>
        </div>
      
        <div 
            className="prose prose-slate max-w-none p-6 bg-slate-50 rounded-lg border border-slate-200 min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: htmlSummary }}
        />
    </div>
  );
};

export default SummaryDisplay;
