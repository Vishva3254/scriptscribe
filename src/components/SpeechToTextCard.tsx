
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
    navigator.clipboard.writeText(localText);
    toast({
      title: "Copied to clipboard",
      description: "Prescription text has been copied to clipboard."
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-medical-700">
          Prescription
          {isListening && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse-light">
              Recording
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Click the microphone button below to start dictating your prescription, or type directly here..."
          className="min-h-[200px] resize-y"
          value={localText}
          onChange={handleTextChange}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button 
            onClick={toggleRecording} 
            variant={isListening ? "destructive" : "default"}
            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isListening ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard}>
            <Clipboard className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SpeechToTextCard;
