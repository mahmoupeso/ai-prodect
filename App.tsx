
import React from 'react';
import ImageEditor from './components/ImageEditor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            Gemini Image Scene Creator
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Transform product shots into cinematic scenes with AI.
          </p>
        </header>
        <ImageEditor />
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by Google Gemini 2.5 Flash Image</p>
      </footer>
    </div>
  );
};

export default App;
