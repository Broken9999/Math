export interface Problem {
  id: string;
  imageUri: string;
  solution: string;
  timestamp: number;
  status: 'analyzing' | 'completed' | 'error';
  error?: string;
}

export interface GeminiError {
  message: string;
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  SOLUTION = 'SOLUTION',
  HISTORY = 'HISTORY'
}