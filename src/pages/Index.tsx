
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PatientInfoCard from '@/components/PatientInfoCard';
import SpeechToTextCard from '@/components/SpeechToTextCard';
import MedicationCard from '@/components/MedicationCard';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const generatePrescription = () => {
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
    // Validate essential fields before proceeding
    if (!patientInfo.name || !patientInfo.contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide at least the patient's name and contact number.",
        variant: "destructive"
      });
      return;
    }
    
    if (medications.length === 0) {
      toast({
        title: "No Medications",
        description: "Please add at least one medication to the prescription.",
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
