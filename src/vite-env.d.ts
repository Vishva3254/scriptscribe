
/// <reference types="vite/client" />

interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
  currentRecognition: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}
