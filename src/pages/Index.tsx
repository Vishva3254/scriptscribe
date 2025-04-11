
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PatientInfoCard from '@/components/PatientInfoCard';
import SpeechToTextCard from '@/components/SpeechToTextCard';
import MedicationCard from '@/components/MedicationCard';
import { Button } from '@/components/ui/button';
import { FileText, Download, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading, sessionExpiresAt } = useAuth();
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    contactNumber: '',
  });

  const [prescriptionText, setPrescriptionText] = useState('');
  
  const [medications, setMedications] = useState<Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Show session expiry notification
  useEffect(() => {
    if (sessionExpiresAt) {
      const currentTime = new Date();
      const timeRemaining = sessionExpiresAt.getTime() - currentTime.getTime();
      
      // Show a notification when there's less than 5 minutes left
      const fiveMinutesInMs = 5 * 60 * 1000;
      if (timeRemaining > 0 && timeRemaining < fiveMinutesInMs) {
        const minutesRemaining = Math.floor(timeRemaining / 60000);
        toast({
          title: "Session expiring soon",
          description: `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work and re-login.`,
          duration: 10000, // Show for 10 seconds
        });
      }
    }
  }, [sessionExpiresAt, toast]);

  const updatePatientInfo = (field: string, value: string) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePrescriptionText = (text: string) => {
    setPrescriptionText(text);
  };

  const addMedication = () => {
    setMedications(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      }
    ]);
  };

  const updateMedication = (id: string, field: string, value: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id ? {...med, [field]: value} : med
      )
    );
  };
  
  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
    
    toast({
      title: "Medication Removed",
      description: "The medication has been removed from the prescription."
    });
  };

  const generatePrescription = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create prescriptions.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Create a formatted prescription
    let fullPrescription = `Prescription for ${patientInfo.name}\n`;
    fullPrescription += `Age: ${patientInfo.age} | Gender: ${patientInfo.gender}\n`;
    fullPrescription += `Contact: ${patientInfo.contactNumber}\n\n`;
    
    if (prescriptionText) {
      fullPrescription += `Doctor's Notes:\n${prescriptionText}\n\n`;
    }
    
    if (medications.length > 0) {
      fullPrescription += `Medications:\n`;
      medications.forEach((med, index) => {
        fullPrescription += `${index + 1}. ${med.name} - ${med.dosage}\n`;
        fullPrescription += `   Frequency: ${med.frequency}\n`;
        fullPrescription += `   Duration: ${med.duration}\n`;
        if (med.instructions) {
          fullPrescription += `   Instructions: ${med.instructions}\n`;
        }
        fullPrescription += '\n';
      });
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(fullPrescription);
    
    toast({
      title: "Prescription Generated!",
      description: "The complete prescription has been copied to your clipboard."
    });
  };

  const viewPrescription = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view prescriptions.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Validate essential fields before proceeding - only patient's name and contact are required
    if (!patientInfo.name || !patientInfo.contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide at least the patient's name and contact number.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to prescription page with the data
    navigate('/prescription', { 
      state: { 
        prescriptionData: {
          patientInfo,
          prescriptionText,
          medications,
          date: new Date().toLocaleDateString()
        } 
      }
    });
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-medical-500 border-t-transparent mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="mb-6">
              <FileText className="mx-auto h-16 w-16 text-medical-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to ScriptScribe</h1>
              <p className="text-gray-600 mb-4">Create and manage your prescriptions with ease</p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full mb-2">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Continue
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Don't have an account? <Button variant="link" className="p-0" onClick={() => navigate('/signup')}>Sign Up</Button>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Main content when authenticated
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-grow w-full px-3 py-3">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-base font-bold text-gray-800 mb-3">Create Prescription</h2>
          
          <PatientInfoCard 
            updatePatientInfo={updatePatientInfo}
            patientInfo={patientInfo}
          />
          
          <SpeechToTextCard 
            updatePrescriptionText={updatePrescriptionText}
            prescriptionText={prescriptionText}
          />
          
          <MedicationCard 
            medications={medications}
            addMedication={addMedication}
            updateMedication={updateMedication}
            removeMedication={removeMedication}
          />
          
          <div className="mt-3 flex justify-center sm:justify-end flex-wrap gap-2">
            <Button onClick={generatePrescription} size="sm" className="text-sm flex-shrink-0">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Copy to Clipboard
            </Button>
            <Button 
              onClick={viewPrescription} 
              variant="outline" 
              size="sm" 
              className="text-sm flex-shrink-0 bg-medical-600 text-white hover:bg-medical-700"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              View & Download
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
