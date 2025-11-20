import React from 'react';
import { Brain, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            StudySnap AI
          </span>
        </div>
        
        <nav className="flex items-center gap-4">
          <a 
            href="#" 
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            onClick={(e) => e.preventDefault()} // Placeholder
          >
            History
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </div>
    </header>
  );
};