import React from 'react';
import { FileText } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-purple-600/20 rounded-full animate-ping"></div>
            <div className="relative bg-gray-800 rounded-full p-4 flex items-center justify-center">
              <FileText size={40} className="text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-purple-400 mb-4">
            Generuję prezentację...
          </h2>
          <p className="text-gray-300">
            Proszę czekać, trwa tworzenie Twojej prezentacji w Google Docs.
          </p>
          <div className="mt-8 space-y-3">
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 