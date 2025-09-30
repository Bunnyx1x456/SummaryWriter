
import React, { useState, useCallback } from 'react';
import { RecordingStatus } from './types';
import { useSpeechToText } from './hooks/useSpeechToText';
import { summarizeLecture } from './services/geminiService';
import Recorder from './components/Recorder';
import SummaryDisplay from './components/SummaryDisplay';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechToText();

  const handleStart = useCallback(() => {
    setError('');
    setSummary('');
    startListening();
    setStatus(RecordingStatus.RECORDING);
  }, [startListening]);

  const handleStop = useCallback(async () => {
    stopListening();
    setStatus(RecordingStatus.PROCESSING);
    
    // A short delay to allow final transcript processing
    setTimeout(async () => {
      if (!transcript.trim()) {
        setError('Не вдалося розпізнати мовлення. Спробуйте ще раз у тихішому середовищі.');
        setStatus(RecordingStatus.ERROR);
        return;
      }
      try {
        const result = await summarizeLecture(transcript);
        setSummary(result);
        setStatus(RecordingStatus.DONE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Сталася невідома помилка.');
        setStatus(RecordingStatus.ERROR);
      }
    }, 500);
  }, [stopListening, transcript]);

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
      </footer>
    </div>
  );
};

export default App;
