
import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (result: string) => void;
  onEnd?: () => void;
  language?: string;
}

const useSpeechRecognition = ({
  onResult,
  onEnd,
  language = 'en-US',
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language;

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const updatedTranscript = finalTranscript || interimTranscript;
      setTranscript(updatedTranscript);
      onResult?.(updatedTranscript);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(`Error: ${event.error}`);
      stopListening();
    };

    recognitionInstance.onend = () => {
      if (isListening) {
        recognitionInstance.start();
      } else {
        onEnd?.();
      }
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
    setIsListening(true);
    setError(null);
  }, [language, onResult, onEnd, isListening]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
  };
};

export default useSpeechRecognition;
