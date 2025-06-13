import React from 'react';
import { FileCheck } from 'lucide-react';

export function SuccessScreen({ documentUrl }) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="bg-purple-600/20 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
            <FileCheck size={40} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-purple-400 mb-4">
            Prezentacja gotowa!
          </h2>
          <p className="text-gray-300 mb-8">
            Twoja prezentacja została wygenerowana pomyślnie. Możesz ją teraz otworzyć w Google Docs.
          </p>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors duration-200"
          >
            Otwórz prezentację
          </a>
        </div>
      </div>
    </div>
  );
} 