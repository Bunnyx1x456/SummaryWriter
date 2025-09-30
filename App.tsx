import React, { useState, useCallback, useEffect } from 'react';
import { RecordingStatus } from './types';
import { useSpeechToText } from './hooks/useSpeechToText';
import { summarizeLecture } from './services/geminiService';
import Recorder from './components/Recorder';
import SummaryDisplay from './components/SummaryDisplay';
import { LogoIcon, EditIcon } from './components/Icons';
import ApiKeyInput from './components/ApiKeyInput';

const App: React.FC = () => {
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('gemini-api-key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    } catch (e) {
      console.error("Could not access localStorage:", e);
    }
  }, []);

  const { transcript, startListening, stopListening, isSupported } = useSpeechToText();

  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      const trimmedKey = key.trim();
      try {
        localStorage.setItem('gemini-api-key', trimmedKey);
        setApiKey(trimmedKey);
      } catch(e) {
        console.error("Could not save to localStorage:", e);
        // Fallback for environments where localStorage is blocked
        setApiKey(trimmedKey);
      }
    }
  };
  
  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('gemini-api-key');
    } catch(e) {
       console.error("Could not clear localStorage:", e);
    }
    setApiKey(null);
    setStatus(RecordingStatus.IDLE);
    setError('');
    setSummary('');
  };

  const handleStart = useCallback(() => {
    setError('');
    setSummary('');
    startListening();
    setStatus(RecordingStatus.RECORDING);
  }, [startListening]);

  const handleStop = useCallback(async () => {
    stopListening();
    setStatus(RecordingStatus.PROCESSING);
    
    setTimeout(async () => {
      if (!apiKey) {
        setError('API ключ не встановлено. Будь ласка, оновіть сторінку та введіть ключ.');
        setStatus(RecordingStatus.ERROR);
        return;
      }
      if (!transcript.trim()) {
        setError('Не вдалося розпізнати мовлення. Спробуйте ще раз у тихішому середовищі.');
        setStatus(RecordingStatus.ERROR);
        return;
      }
      try {
        const result = await summarizeLecture(transcript, apiKey);
        setSummary(result);
        setStatus(RecordingStatus.DONE);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Сталася невідома помилка.';
        setError(errorMessage);
        setStatus(RecordingStatus.ERROR);
        if (errorMessage.includes('недійсний')) {
            handleClearApiKey();
        }
      }
    }, 500);
  }, [stopListening, transcript, apiKey]);

  const handleReset = useCallback(() => {
    setStatus(RecordingStatus.IDLE);
    setSummary('');
    setError('');
  }, []);

  const renderContent = () => {
    if (!isSupported) {
        return (
            <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg">
                <h2 className="text-xl font-bold text-red-800">Браузер не підтримується</h2>
                <p className="mt-2 text-red-700">На жаль, ваш браузер не підтримує Web Speech API, яка необхідна для роботи цього застосунку. Будь ласка, спробуйте в останній версії Google Chrome.</p>
            </div>
        );
    }
    
    switch (status) {
      case RecordingStatus.IDLE:
      case RecordingStatus.RECORDING:
      case RecordingStatus.PROCESSING:
      case RecordingStatus.ERROR:
        return <Recorder status={status} onStart={handleStart} onStop={handleStop} error={error} />;
      case RecordingStatus.DONE:
        return <SummaryDisplay summary={summary} onReset={handleReset} />;
      default:
        return null;
    }
  };

  if (!apiKey) {
    return <ApiKeyInput onSave={handleSaveApiKey} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4">
            <LogoIcon className="w-12 h-12 text-sky-500" />
            <h1 className="text-4xl font-bold text-slate-800">Писар Конспектів</h1>
        </div>
        <p className="mt-2 text-slate-500 text-lg">Ваш особистий помічник для створення конспектів лекцій</p>
      </header>
      <main className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-10 transition-all duration-300 ease-in-out">
        {renderContent()}
      </main>
      <footer className="mt-8 text-center text-slate-400 text-sm">
        <p>Працює на базі Gemini 2.5 Flash</p>
        <button
          onClick={handleClearApiKey}
          className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-sky-600 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          aria-label="Змінити API ключ"
        >
          <EditIcon className="w-4 h-4" />
          <span>Змінити API ключ</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
