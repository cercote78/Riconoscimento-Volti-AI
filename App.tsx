
import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { findMatchingFaces } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultsGrid from './components/ResultsGrid';
import Spinner from './components/Spinner';
import { FaceIcon, ImageIcon, SearchIcon, AlertTriangleIcon } from './components/Icons';

export default function App() {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [libraryImages, setLibraryImages] = useState<ImageFile[]>([]);
  const [matchingImages, setMatchingImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSourceImageChange = useCallback((files: ImageFile[]) => {
    setSourceImage(files[0] || null);
    setSearched(false);
    setMatchingImages([]);
  }, []);

  const handleLibraryImagesChange = useCallback((files: ImageFile[]) => {
    setLibraryImages(files);
    setSearched(false);
    setMatchingImages([]);
  }, []);

  const handleSearch = async () => {
    if (!sourceImage || libraryImages.length === 0) {
      setError("Per favore, carica sia un'immagine di riferimento che una galleria di immagini.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMatchingImages([]);
    setSearched(true);

    try {
      const matches = await findMatchingFaces(sourceImage, libraryImages);
      setMatchingImages(matches);
    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore durante l'analisi delle immagini. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Riconoscimento Volti AI
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Carica un'immagine di riferimento e una galleria. La nostra IA troverà tutte le foto in cui appare quel volto.
          </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2"><FaceIcon />1. Scegli il volto da cercare</h2>
              <ImageUploader
                id="source-uploader"
                onFilesSelected={handleSourceImageChange}
                multiple={false}
                label="Carica Immagine di Riferimento"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2"><ImageIcon />2. Scegli le immagini in cui cercare</h2>
              <ImageUploader
                id="library-uploader"
                onFilesSelected={handleLibraryImagesChange}
                multiple={true}
                label="Carica Galleria di Immagini"
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleSearch}
              disabled={!sourceImage || libraryImages.length === 0 || isLoading}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              {isLoading ? <Spinner /> : <SearchIcon />}
              {isLoading ? 'Analisi in corso...' : 'Cerca Volti'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertTriangleIcon />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-12">
          {isLoading && (
            <div className="text-center text-gray-400">
              <p>L'IA sta analizzando le immagini. Questo processo potrebbe richiedere qualche istante...</p>
            </div>
          )}

          {!isLoading && searched && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Risultati: <span className="text-blue-400">{matchingImages.length}</span> corrispondenz{matchingImages.length === 1 ? 'a' : 'e'} trovat{matchingImages.length === 1 ? 'a' : 'e'}
              </h2>
              {matchingImages.length > 0 ? (
                <ResultsGrid images={matchingImages} />
              ) : (
                <p className="text-center text-gray-500 text-lg">Nessuna corrispondenza trovata nella galleria.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-600 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
}
