/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  onFileSelect: (file: File) => void;
  accept?: string;
  currentPreview?: string;
  onClear?: () => void;
  text?: {
    dragDrop?: string;
  }
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onFileSelect,
  accept = "image/*",
  currentPreview,
  onClear,
  text
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (currentPreview) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-square flex items-center justify-center shadow-sm">
        <img src={currentPreview} alt="Preview" className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onClear}
            className="p-2 bg-white/20 text-white rounded-full hover:bg-white hover:text-red-500 transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded text-xs text-zinc-800 font-mono pointer-events-none shadow-sm border border-zinc-200">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group
        ${isDragging 
          ? 'border-[#eac415] bg-[#eac415]/10' 
          : 'border-zinc-300 hover:border-[#eac415] hover:bg-zinc-50'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={accept}
        onChange={handleChange}
      />
      <div className="p-4 text-center pointer-events-none">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
          ${isDragging ? 'bg-[#eac415] text-black' : 'bg-zinc-100 text-zinc-400 group-hover:text-zinc-600'}`}>
          <Upload size={20} />
        </div>
        <p className="text-sm font-medium text-zinc-700 mb-1">{label}</p>
        <p className="text-xs text-zinc-500">{text?.dragDrop || "Drag & drop or click"}</p>
      </div>
    </div>
  );
};