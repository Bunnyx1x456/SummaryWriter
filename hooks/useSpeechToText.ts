import { useState, useRef, useEffect, useCallback } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
// In a larger project, these would typically go into a global `.d.ts` file.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  // Overload addEventListener to accept SpeechRecognitionEvent
  addEventListener(type: 'result', listener: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  
  removeEventListener(type: 'result', listener: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}


interface SpeechToTextOptions {
  onResult?: (transcript: string) => void;
}

const getSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
};

export const useSpeechToText = (options?: SpeechToTextOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (isListening || !recognitionRef.current) return;
    
    setIsListening(true);
    recognitionRef.current.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;

    setIsListening(false);
    recognitionRef.current.stop();
  }, [isListening]);

  useEffect(() => {
    recognitionRef.current = getSpeechRecognition();
    const recognition = recognitionRef.current;

    if (!recognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'uk-UA';

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
      if(options?.onResult && finalTranscript){
         options.onResult(finalTranscript);
      }
    };

    const handleEnd = () => {
        // Automatically stop if recognition ends on its own
        if(isListening) {
           setIsListening(false);
        }
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('end', handleEnd);
      if (recognition) {
        recognition.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.onResult]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognitionRef.current,
  };
};
