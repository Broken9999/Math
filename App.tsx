import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SolutionDisplay } from './components/SolutionDisplay';
import { Problem } from './types';
import { fileToBase64, solveProblem } from './services/geminiService';
import { RotateCcw, Plus, UploadCloud } from 'lucide-react';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  
  const processFile = async (file: File, id: string) => {
    try {
      const base64 = await fileToBase64(file);
      const solution = await solveProblem(base64, file.type);
      
      setProblems(prev => prev.map(p => 
        p.id === id 
          ? { ...p, solution, status: 'completed' }
          : p
      ));
    } catch (err: any) {
      console.error(err);
      setProblems(prev => prev.map(p => 
        p.id === id 
          ? { ...p, status: 'error', error: err.message || "Failed to solve" }
          : p
      ));
    }
  };

  const handleFilesSelect = useCallback(async (files: File[]) => {
    // Create initial problem entries
    const newProblems: Problem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7) + Date.now(),
      imageUri: URL.createObjectURL(file),
      solution: '',
      timestamp: Date.now(),
      status: 'analyzing'
    }));

    // Add to state (newest first)
    setProblems(prev => [...newProblems, ...prev]);

    // Process each file independently
    files.forEach((file, index) => {
      processFile(file, newProblems[index].id);
    });
  }, []);

  const handleDelete = (id: string) => {
    setProblems(prev => prev.filter(p => p.id !== id));
  };

  const handleReset = () => {
    setProblems([]);
  };

  // Global Drag Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        handleFilesSelect(validFiles);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col font-sans relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10 relative">
        
        {/* Hero Section - Only show when no problems exist */}
        {problems.length === 0 && (
          <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm text-indigo-600 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
              Powered by Gemini 2.5 Flash Reasoning
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Your Personal AI <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Study Companion
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Stuck on a tough question? Just upload a photo. 
              Math, Science, History, or Coding—we break it down for you.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {problems.length === 0 ? (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
            <UploadZone onFilesSelect={handleFilesSelect} />
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { title: "Snap", desc: "Take a photo of any question" },
                { title: "Upload", desc: "Drag and drop multiple images" },
                { title: "Learn", desc: "Get instant step-by-step help" }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-900 font-bold flex items-center justify-center mb-3 shadow-sm">
                    {i + 1}
                  </div>
                  <h4 className="font-semibold text-slate-900">{step.title}</h4>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-20">
             <h2 className="text-lg font-semibold text-slate-800">
               Results ({problems.length})
             </h2>
             <div className="flex gap-3">
               <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesSelect(Array.from(e.target.files));
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button variant="outline" icon={<Plus className="w-4 h-4" />}>Add More</Button>
               </div>
               <Button variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>Clear All</Button>
             </div>
          </div>
        )}

        {/* Results List */}
        {problems.length > 0 && (
          <div className="space-y-8">
            {problems.map(problem => (
              <SolutionDisplay 
                key={problem.id} 
                problem={problem} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </main>

      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="text-white text-center p-8 rounded-2xl bg-white/10 border-2 border-white/30 backdrop-blur-md shadow-2xl transform transition-all scale-105">
            <UploadCloud className="w-24 h-24 mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-bold mb-2">Drop files to solve</h2>
            <p className="text-indigo-100 text-lg">Math, Science, History, or Code.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;