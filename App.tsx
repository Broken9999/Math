import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SolutionDisplay } from './components/SolutionDisplay';
import { MathProblem } from './types';
import { fileToBase64, solveMathProblem } from './services/geminiService';
import { Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    setError(null);
    setIsAnalyzing(true);
    
    // Create a temporary preview
    const objectUrl = URL.createObjectURL(file);
    
    const newProblem: MathProblem = {
      id: Date.now().toString(),
      imageUri: objectUrl,
      solution: '',
      timestamp: Date.now(),
      status: 'analyzing'
    };
    
    setCurrentProblem(newProblem);

    try {
      const base64 = await fileToBase64(file);
      const solution = await solveMathProblem(base64, file.type);
      
      setCurrentProblem(prev => prev ? {
        ...prev,
        solution: solution,
        status: 'completed'
      } : null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while analyzing the image.");
      setCurrentProblem(prev => prev ? { ...prev, status: 'error', error: err.message } : null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleReset = () => {
    setCurrentProblem(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Hero Section - Only show when no problem is selected */}
        {!currentProblem && (
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

        {/* Upload Section */}
        {!currentProblem && (
          <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
            <UploadZone onImageSelect={handleImageSelect} />
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { title: "Snap", desc: "Take a clear photo of your math problem" },
                { title: "Upload", desc: "Drop the image into the secure solver" },
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
        )}

        {/* Loading State */}
        {isAnalyzing && currentProblem && !currentProblem.solution && (
          <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-2xl">π</span>
               </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Problem...</h2>
            <p className="text-slate-500 animate-pulse">Identifying numbers and symbols</p>
            
            <div className="mt-8 w-64 h-32 rounded-xl overflow-hidden shadow-lg border border-slate-200 relative">
                <img src={currentProblem.imageUri} alt="Preview" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Analysis Failed</h3>
              <p className="text-sm mt-1 opacity-90">{error}</p>
              <button 
                onClick={handleReset}
                className="mt-3 text-sm font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {currentProblem && currentProblem.status === 'completed' && (
          <SolutionDisplay 
            imageUri={currentProblem.imageUri} 
            solution={currentProblem.solution} 
            onReset={handleReset}
          />
        )}

      </main>
    </div>
  );
};

export default App;
