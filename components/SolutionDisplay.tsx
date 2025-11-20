import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CheckCircle, Copy, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface SolutionDisplayProps {
  imageUri: string;
  solution: string;
  onReset: () => void;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ imageUri, solution, onReset }) => {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(solution);
    // Could add toast notification here
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Image Column */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Original Problem
          </h3>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
            <img 
              src={imageUri} 
              alt="Math problem" 
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        
        <Button variant="secondary" onClick={onReset} icon={<RotateCcw className="w-4 h-4" />} className="w-full">
          Analyze Another Problem
        </Button>
      </div>

      {/* Solution Column */}
      <div className="flex flex-col h-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
            <div className="flex items-center gap-2 text-indigo-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Step-by-Step Solution</span>
            </div>
            <button 
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
              title="Copy Solution"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 lg:p-8 overflow-y-auto max-h-[800px] prose prose-slate prose-indigo max-w-none">
             <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-700" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-slate-800 mb-3 mt-6" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-medium text-slate-800 mb-2 mt-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 mb-4 text-slate-700" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                code: ({node, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !className ? (
                        <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                        </code>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    )
                }
              }}
            >
              {solution}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
