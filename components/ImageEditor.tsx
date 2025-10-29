
import React, { useState, useCallback, useRef } from 'react';
import { INITIAL_IMAGE_BASE64, EXAMPLE_PROMPTS } from '../constants';
import { fileToBase64 } from '../utils/imageUtils';
import { generateEditedImage } from '../services/geminiService';
import Spinner from './Spinner';
import Icon from './Icon';

const ImageCard: React.FC<{ title: string; imageUrl: string | null; isLoading?: boolean }> = ({ title, imageUrl, isLoading }) => (
  <div className="bg-slate-800/50 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col min-w-[300px]">
    <h2 className="text-lg font-semibold text-center py-3 bg-slate-900/70">{title}</h2>
    <div className="p-4 flex-grow flex items-center justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center z-10">
          <Spinner className="w-12 h-12 text-amber-400" />
          <p className="mt-4 text-slate-300 animate-pulse">Creating your scene...</p>
        </div>
      )}
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
      ) : (
        <div className="text-slate-500 flex flex-col items-center gap-4">
          <Icon name="image" className="w-16 h-16"/>
          <p>Your generated image will appear here.</p>
        </div>
      )}
    </div>
  </div>
);


const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>(INITIAL_IMAGE_BASE64);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setOriginalImage(base64);
        setEditedImage(null); // Clear previous edit on new image upload
        setError(null);
      } catch (err) {
        setError('Failed to load image file.');
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt || !originalImage) {
      setError('Please provide a prompt and ensure an image is loaded.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const result = await generateEditedImage(originalImage, prompt);
      setEditedImage(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, originalImage]);
  
  const handleExamplePromptClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative flex justify-between items-center" role="alert">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-800/50 transition-colors">
              <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <ImageCard title="Original Image" imageUrl={originalImage} />
        <ImageCard title="Generated Image" imageUrl={editedImage} isLoading={isLoading} />
      </div>

      <div className="bg-slate-800/50 rounded-lg shadow-lg p-4 md:p-6 mt-4 sticky bottom-4 md:static">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Example Scenes & Edits</label>
           <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p, index) => (
              <button
                key={index}
                onClick={() => handleExamplePromptClick(p.prompt)}
                className="text-xs md:text-sm bg-slate-700 hover:bg-amber-600 hover:text-white text-slate-200 font-semibold py-2 px-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the scene or edit you want to create... e.g., 'Place the bottle on a rainy city street at night with neon reflections.'"
            className="flex-grow bg-slate-900 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors w-full min-h-[80px] md:min-h-0"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
            >
                <Icon name="upload" className="w-5 h-5"/>
                Upload Image
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400"
            >
              {isLoading ? <Spinner /> : <Icon name="sparkles" className="w-5 h-5" />}
              <span>{isLoading ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
