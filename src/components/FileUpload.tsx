import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseGradeFile } from '../utils/gradeParser';
import { GradeRecord } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onDataLoaded: (data: GradeRecord[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setError(null);
      setFileName(file.name);
      const data = await parseGradeFile(file);
      onDataLoaded(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer",
          isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50",
          error ? "border-red-300 bg-red-50/30" : ""
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".xlsx,.xls"
          onChange={onFileChange}
        />
        
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300",
          isDragging ? "scale-110 bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
        )}>
          {fileName ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8" />}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {fileName ? fileName : "Upload Grade Data"}
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-xs">
          {fileName ? "File successfully loaded" : "Drag and drop your Excel (.xlsx) or Google Sheet export here"}
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
