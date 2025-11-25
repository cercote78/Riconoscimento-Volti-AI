
import React from 'react';
import { ImageFile } from '../types';

interface ResultsGridProps {
  images: ImageFile[];
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {images.map((imageFile, index) => (
        <div 
          key={index} 
          className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 hover:shadow-blue-500/20"
          style={{ animation: `fadeIn 0.5s ease-in-out ${index * 0.05}s forwards`, opacity: 0 }}
        >
          <img
            src={URL.createObjectURL(imageFile.file)}
            alt={`Match ${index + 1}`}
            className="w-full h-full object-cover"
            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
          />
        </div>
      ))}
      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsGrid;
