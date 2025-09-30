
import React from 'react';
import { RecordingStatus } from '../types';
import { MicIcon, StopIcon } from './Icons';
import Loader from './Loader';

interface RecorderProps {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
  error?: string;
}

const StatusIndicator: React.FC<{ status: RecordingStatus }> = ({ status }) => {
    if (status === RecordingStatus.RECORDING) {
        return (
            <div className="flex items-center justify-center gap-2 text-red-600">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span>Йде запис...</span>
            </div>
        )
    }
    if (status === RecordingStatus.PROCESSING) {
        return <Loader text="Обробка запису та створення конспекту..." />
    }
    return <p className="text-slate-500 text-center">Натисніть кнопку, щоб почати запис лекції</p>;
}


const Recorder: React.FC<RecorderProps> = ({ status, onStart, onStop, error }) => {
  const isRecording = status === RecordingStatus.RECORDING;
  const isProcessing = status === RecordingStatus.PROCESSING;

  return (
    <div className="flex flex-col items-center justify-center h-64">
        <div className="mb-8">
            <StatusIndicator status={status}/>
        </div>
        
        <button
            onClick={isRecording ? onStop : onStart}
            disabled={isProcessing}
            className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' : 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400'}
            ${isProcessing ? 'bg-slate-300 cursor-not-allowed' : ''}
            shadow-lg transform hover:scale-105 active:scale-100`}
        >
            {isRecording ? <StopIcon className="w-10 h-10" /> : <MicIcon className="w-10 h-10" />}
        </button>

        {error && (
            <div className="mt-6 text-center bg-red-100 text-red-700 p-3 rounded-lg">
                <p className="font-semibold">Помилка</p>
                <p>{error}</p>
            </div>
        )}
    </div>
  );
};

export default Recorder;
