import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SolutionDisplay } from './components/SolutionDisplay';
import { MathProblem } from './types';
import { fileToBase64, solveMathProblem } from './services/geminiService';
import { RotateCcw, Plus } from 'lucide-react';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  
  const processFile = async (file: File, id: string) => {
    try {
      const base64 = await fileToBase64(file);
      const solution = await solveMathProblem(base64, file.type);
      
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
    const newProblems: MathProblem[] = files.map(file => ({
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
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
                Math Tutor
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Stuck on a tough equation? Just upload a photo. 
              Our AI breaks down complex math problems into simple, step-by-step explanations.
            </p>
          </div>
        )}

        {/* Upload Section - Always visible, but styled differently when lists exist? 
            For simplicity, we keep the main upload zone at the top or replace it.
            If problems exist, we can show a smaller "Add more" button or just keep the dropzone if user wants to add more.
            Let's keep the dropzone if list is empty, otherwise show a toolbar.
        */}
        
        {problems.length === 0 ? (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
            <UploadZone onFilesSelect={handleFilesSelect} />
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { title: "Snap", desc: "Take photos of your math problems" },
                { title: "Batch", desc: "Upload multiple images at once" },
                { title: "Solve", desc: "Get instant step-by-step solutions" }
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
          <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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
                        // Reset input
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
    </div>
  );
};

export default App;