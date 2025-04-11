
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Pill, Stethoscope, FileText, Clipboard, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(66);
    }, 500);
    
    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-medical-50 to-medical-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <Stethoscope className="h-8 w-8 text-medical-600" />
            <h1 className="text-2xl font-bold text-medical-700">ScriptScribe</h1>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-medical-50 rounded-lg p-3 text-center">
              <Pill className="h-8 w-8 mx-auto text-medical-500 mb-2" />
              <p className="text-xs text-medical-700 font-medium">Medications</p>
            </div>
            <div className="bg-medical-50 rounded-lg p-3 text-center">
              <FileText className="h-8 w-8 mx-auto text-medical-500 mb-2" />
              <p className="text-xs text-medical-700 font-medium">Prescriptions</p>
            </div>
            <div className="bg-medical-50 rounded-lg p-3 text-center">
              <Clipboard className="h-8 w-8 mx-auto text-medical-500 mb-2" />
              <p className="text-xs text-medical-700 font-medium">Patient Info</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">Loading your medical dashboard</p>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-medical-500" />
                <p className="text-xs text-gray-500">{progress}%</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
          
          <p className="text-xs text-center text-gray-400 pt-4">
            Secure medical prescription platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
