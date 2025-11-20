import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Layers } from 'lucide-react';
import { Button } from './Button';

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files);
      onFilesSelect(validFiles);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out
        ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className={`
          p-4 rounded-full mb-6 transition-colors duration-300
          ${dragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}
        `}>
          {dragActive ? <Layers className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Upload your math problems
        </h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Drag & drop multiple images here, or click to browse. <br/>We support JPG, PNG, and WebP.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md mx-auto">
          <Button 
            onClick={onButtonClick} 
            className="w-full"
            icon={<ImageIcon className="w-4 h-4" />}
          >
            Select Images
          </Button>
        </div>
      </div>
    </div>
  );
};