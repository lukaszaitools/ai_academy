import React from 'react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
        <p className="text-xl text-purple-400 font-semibold">Generuję prezentację...</p>
        <p className="text-gray-400 mt-2">To może potrwać kilka chwil</p>
      </div>
    </div>
  );
} 