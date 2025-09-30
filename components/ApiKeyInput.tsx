import React, { useState } from 'react';
import { LogoIcon, KeyIcon } from './Icons';

interface ApiKeyInputProps {
    onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-slate-50 text-slate-800">
      <div className="w-full max-w-md">
        <header className="flex items-center justify-center gap-4 mb-8">
          <LogoIcon className="w-12 h-12 text-sky-500" />
          <h1 className="text-4xl font-bold">Писар Конспектів</h1>
        </header>
        <main className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-slate-700 mb-2">Введіть ваш API ключ</h2>
          <p className="text-center text-slate-500 mb-6">
            Для роботи застосунку потрібен ваш Gemini API ключ.
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline ml-1 font-medium">
              Отримати ключ
            </a>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
                 <KeyIcon className="w-5 h-5 text-slate-400" />
               </span>
               <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Вставте ваш API ключ сюди"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                required
                aria-label="Gemini API Key"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sky-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-105 active:scale-100"
            >
              Зберегти та почати
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ApiKeyInput;
