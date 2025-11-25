
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageFile } from '../types';
import { UploadCloudIcon, XIcon } from './Icons';

interface ImageUploaderProps {
  id: string;
  onFilesSelected: (files: ImageFile[]) => void;
  multiple: boolean;
  label: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onFilesSelected, multiple, label }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  const handleFileChange = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);
    
    previews.forEach(URL.revokeObjectURL);

    const newPreviews = fileArray.map(file => URL.createObjectURL(file));
    setPreviews(multiple ? prev => [...prev, ...newPreviews] : newPreviews);

    const imageFiles: ImageFile[] = await Promise.all(
      fileArray.map(file => {
        return new Promise<ImageFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                const base64 = event.target.result.split(',')[1];
                resolve({ file, base64 });
            } else {
                reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
    
    onFilesSelected(imageFiles);
  }, [onFilesSelected, multiple, previews]);


  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };
  
  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setPreviews([]);
    onFilesSelected([]);
  }

  return (
    <div className="w-full">
        <label
            htmlFor={id}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
            ${isDragging ? 'border-blue-400 bg-gray-700/80' : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'}`}
        >
            {previews.length > 0 ? (
                <div className="relative w-full h-full p-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 w-full h-full overflow-y-auto">
                        {previews.map((src, index) => (
                            <img key={index} src={src} alt={`preview ${index}`} className="w-full h-full object-cover rounded-md" />
                        ))}
                    </div>
                     <button onClick={handleClear} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors">
                        <XIcon />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <UploadCloudIcon />
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-gray-300">{label}</span> o trascina qui</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                </div>
            )}
            <input
                ref={fileInputRef}
                id={id}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                multiple={multiple}
                onChange={(e) => handleFileChange(e.target.files)}
            />
        </label>
    </div>
  );
};

export default ImageUploader;
