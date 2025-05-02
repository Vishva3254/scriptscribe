
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Clipboard, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

interface SpeechToTextCardProps {
  updatePrescriptionText: (text: string) => void;
  prescriptionText: string;
}

// Store the last saved prescription timestamp to prevent duplicate saves
let lastSavedPrescription = {
  text: '',
  timestamp: 0
};

// Time window in milliseconds within which duplicate saves are prevented (3 seconds)
const DUPLICATE_PREVENTION_WINDOW = 3000;

const SpeechToTextCard: React.FC<SpeechToTextCardProps> = ({ updatePrescriptionText, prescriptionText }) => {
  const { toast } = useToast();
  const [localText, setLocalText] = useState(prescriptionText);

  const handleSpeechResult = (result: string) => {
    setLocalText(result);
    updatePrescriptionText(result);
  };

  const {
    isListening,
    startListening,
    stopListening,
    error
  } = useSpeechRecognition({
    onResult: handleSpeechResult
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    updatePrescriptionText(e.target.value);
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const copyToClipboard = () => {
    // If the same content was copied recently, don't show another toast
    const now = Date.now();
    const isDuplicate = 
      localText === lastSavedPrescription.text && 
      now - lastSavedPrescription.timestamp < DUPLICATE_PREVENTION_WINDOW;
    
    if (!isDuplicate) {
      // Update the last saved prescription info
      lastSavedPrescription = {
        text: localText,
        timestamp: now
      };
      
      // Copy to clipboard
      navigator.clipboard.writeText(localText);
      
      // Show toast
      toast({
        title: "Copied to clipboard",
        description: "Prescription text has been copied to clipboard."
      });
    } else {
      // Already copied recently, just copy silently
      navigator.clipboard.writeText(localText);
    }
  };

  return (
    <Card className="mb-4 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base text-medical-700">
          Prescription
          {isListening && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse-light">
              Recording
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Click the microphone button below to start dictating your prescription, or type directly here..."
          className="min-h-[150px] sm:min-h-[200px] resize-y text-xs sm:text-sm"
          value={localText}
          onChange={handleTextChange}
        />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
        <Button 
          onClick={toggleRecording} 
          variant={isListening ? "destructive" : "default"}
          className={`${isListening ? "bg-red-500 hover:bg-red-600" : ""} text-xs h-8 w-full sm:w-auto`}
          size="sm"
        >
          {isListening ? <MicOff className="mr-1.5 h-3 w-3" /> : <Mic className="mr-1.5 h-3 w-3" />}
          {isListening ? "Stop Recording" : "Start Recording"}
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={copyToClipboard} className="text-xs h-8 flex-1 sm:flex-initial">
            <Clipboard className="mr-1.5 h-3 w-3" />
            Copy
          </Button>
          <Button variant="outline" className="text-xs h-8 flex-1 sm:flex-initial">
            <FileText className="mr-1.5 h-3 w-3" />
            Export
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SpeechToTextCard;
