
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // In a real app, these would come from user's session or database
  const doctorInfo = {
    name: "Dr. Sarah Johnson",
    clinicName: "City Health Clinic",
    address: "123 Medical Street, Healthcare City, HC 12345",
    phone: "+1 (555) 123-4567",
    email: "dr.johnson@cityhealthclinic.com",
  };

  // Get prescription data from location state or use default values
  const prescriptionData = location.state?.prescriptionData || {
    patientInfo: {
      name: "John Doe",
      age: "45",
      gender: "Male",
      contactNumber: "+1 (555) 987-6543",
    },
    prescriptionText: "Patient presents with symptoms of seasonal allergies. Recommended antihistamines and nasal spray.",
    medications: [
      {
        id: "1",
        name: "Loratadine",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take in the morning",
      },
      {
        id: "2",
        name: "Fluticasone Nasal Spray",
        dosage: "50mcg/spray",
        frequency: "2 sprays each nostril",
        duration: "30 days",
        instructions: "Use once daily",
      }
    ],
    date: new Date().toLocaleDateString()
  };

  const downloadPrescription = async () => {
    setLoading(true);
    try {
      const element = document.getElementById('prescription-to-print');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`prescription_${prescriptionData.patientInfo.name.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "Prescription Downloaded",
        description: "The prescription has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading prescription:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareViaWhatsApp = () => {
    const { patientInfo, medications } = prescriptionData;
    
    let message = `*Prescription from ${doctorInfo.clinicName}*\n\n`;
    message += `*Dr:* ${doctorInfo.name}\n`;
    message += `*Date:* ${prescriptionData.date}\n\n`;
    message += `*Patient:* ${patientInfo.name}\n`;
    message += `*Age/Gender:* ${patientInfo.age}/${patientInfo.gender}\n\n`;
    
    message += `*MEDICATIONS:*\n`;
    medications.forEach((med, idx) => {
      message += `${idx + 1}. ${med.name} - ${med.dosage}\n`;
      message += `   Frequency: ${med.frequency}\n`;
      message += `   Duration: ${med.duration}\n`;
      if (med.instructions) {
        message += `   Instructions: ${med.instructions}\n`;
      }
      message += `\n`;
    });
    
    message += `\n*Doctor's Notes:*\n${prescriptionData.prescriptionText}\n\n`;
    message += `For any queries, please contact: ${doctorInfo.phone}`;
    
    // Encode the message for the URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${patientInfo.contactNumber.replace(/\D+/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
    
    toast({
      title: "WhatsApp Sharing",
      description: "Opening WhatsApp to share the prescription.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow p-3 sm:p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-800">Prescription Details</h2>
            <div className="flex gap-2">
              <Button 
                onClick={downloadPrescription} 
                disabled={loading} 
                size="sm"
                className="bg-medical-600 hover:bg-medical-700"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {loading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button 
                onClick={shareViaWhatsApp} 
                variant="outline" 
                size="sm" 
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Share via WhatsApp
              </Button>
            </div>
          </div>
          
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <div id="prescription-to-print" className="p-6 bg-white">
                {/* Clinic Header */}
                <div className="text-center border-b pb-4 mb-4">
                  <h1 className="text-xl font-bold text-medical-700">{doctorInfo.clinicName}</h1>
                  <p className="text-sm text-gray-600">{doctorInfo.name}</p>
                  <p className="text-xs text-gray-500">{doctorInfo.address}</p>
                  <p className="text-xs text-gray-500">Phone: {doctorInfo.phone} | Email: {doctorInfo.email}</p>
                </div>
                
                {/* Prescription Title & Date */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1.5 text-medical-600" />
                    <span className="font-medium">Prescription</span>
                  </div>
                  <div className="text-sm">
                    Date: <span className="font-medium">{prescriptionData.date}</span>
                  </div>
                </div>
                
                {/* Patient Information */}
                <div className="mb-4 bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-1">Patient Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                    <div>Name: <span className="font-medium">{prescriptionData.patientInfo.name}</span></div>
                    <div>Age/Gender: <span className="font-medium">{prescriptionData.patientInfo.age}/{prescriptionData.patientInfo.gender}</span></div>
                    <div className="col-span-1 sm:col-span-2">Contact: <span className="font-medium">{prescriptionData.patientInfo.contactNumber}</span></div>
                  </div>
                </div>
                
                {/* Doctor's Notes */}
                {prescriptionData.prescriptionText && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-1">Doctor's Notes</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-line">{prescriptionData.prescriptionText}</p>
                  </div>
                )}
                
                {/* Medications */}
                {prescriptionData.medications.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Medications</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Medication</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Dosage</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Frequency</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {prescriptionData.medications.map((med) => (
                            <tr key={med.id}>
                              <td className="px-3 py-2">{med.name}</td>
                              <td className="px-3 py-2">{med.dosage}</td>
                              <td className="px-3 py-2">{med.frequency}</td>
                              <td className="px-3 py-2">{med.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Instructions */}
                    <div className="mt-3">
                      {prescriptionData.medications.map((med) => (
                        med.instructions && (
                          <div key={`inst-${med.id}`} className="text-sm mb-1">
                            <span className="font-medium">{med.name}</span>: {med.instructions}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Signature */}
                <div className="mt-8 flex justify-end">
                  <div className="text-center">
                    <div className="h-10 border-b border-dashed border-gray-400 w-40 mb-1"></div>
                    <p className="text-sm">{doctorInfo.name}</p>
                    <p className="text-xs text-gray-500">Signature</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              size="sm"
            >
              Back to Prescription Creator
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Prescription;
