
import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (text: string) => void;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

const useSpeechRecognition = ({ onResult }: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Define SpeechRecognition with correct type handling
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  const startListening = useCallback(() => {
    setError(null);
    
    // Check if speech recognition is supported
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition: SpeechRecognitionType = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = transcript;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript);
        
        if (onResult) {
          onResult(finalTranscript + interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        setError(`Error occurred in recognition: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);

      // Store recognition instance so we can stop it later
      window.currentRecognition = recognition;
    } catch (err) {
      console.error('Speech recognition error:', err);
      setError('Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [SpeechRecognition, onResult, transcript]);

  const stopListening = useCallback(() => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setTranscript,
  };
};

export default useSpeechRecognition;
