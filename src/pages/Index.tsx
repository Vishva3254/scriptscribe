
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PatientInfoCard from '@/components/PatientInfoCard';
import SpeechToTextCard from '@/components/SpeechToTextCard';
import MedicationCard from '@/components/MedicationCard';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow w-full px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Create Prescription</h2>
          
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
          
          <div className="mt-3 sm:mt-4 flex justify-center sm:justify-end">
            <Button onClick={generatePrescription} size="sm" className="w-full sm:w-auto sm:text-sm md:text-base">
              <FileText className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Generate Prescription
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
