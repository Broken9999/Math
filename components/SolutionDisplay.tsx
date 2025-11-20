import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CheckCircle, Copy, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Problem } from '../types';

interface SolutionDisplayProps {
  problem: Problem;
  onDelete: (id: string) => void;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ problem, onDelete }) => {
  
  const handleCopy = () => {
    if (problem.solution) {
      navigator.clipboard.writeText(problem.solution);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Image Section */}
        <div className="lg:w-1/3 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-6 flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Original Question
              </span>
              <button 
                onClick={() => onDelete(problem.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Remove problem"
              >
                <Trash2 className="w-4 h-4" />
              </button>
           </div>
           
           <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
             <img 
               src={problem.imageUri} 
               alt="Homework problem" 
               className="h-full w-full object-contain p-2"
             />
           </div>

           <div className="mt-auto pt-6">
              {problem.status === 'analyzing' && (
                 <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 px-4 py-3 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                    <span className="text-sm font-medium">Analyzing image...</span>
                 </div>
              )}
              {problem.status === 'error' && (
                 <div className="flex items-start gap-3 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Analysis Failed</p>
                      <p className="opacity-90 mt-1 text-xs">{problem.error}</p>
                    </div>
                 </div>
              )}
              {problem.status === 'completed' && (
                 <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Explanation Ready</span>
                 </div>
              )}
           </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-h-[300px] lg:min-h-[500px] flex flex-col relative">
          {problem.status === 'analyzing' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
               <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <h3 className="text-lg font-semibold text-slate-900">Working on it...</h3>
               <p className="text-slate-500 max-w-xs mt-2">Identifying the subject and generating a step-by-step explanation.</p>
            </div>
          ) : problem.status === 'error' ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-50">
               <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
               <p className="text-slate-400">Content unavailable</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                 <div className="flex items-center gap-2 text-indigo-700">
                   <span className="font-semibold">AI Explanation</span>
                 </div>
                 <button 
                   onClick={handleCopy}
                   className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                   title="Copy Solution"
                 >
                   <Copy className="w-4 h-4" />
                 </button>
               </div>
               
               <div className="flex-1 p-6 lg:p-8 overflow-y-auto prose prose-slate prose-indigo max-w-none">
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
                  {problem.solution}
                </ReactMarkdown>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};