
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Send, ShoppingCart, User, ArrowLeft, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '@/contexts/AuthContext';

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { profile } = useAuth();

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

  // Generate PDF on component mount to have it ready for sharing
  useEffect(() => {
    generatePDF();
  }, []);

  const generatePDF = async (): Promise<string | null> => {
    setLoading(true);
    try {
      const element = document.getElementById('prescription-to-print');
      if (!element) return null;
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        // Set dimensions to ensure full A4 capture
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Use A4 dimensions (210 x 297 mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the aspect ratio to fit the image into A4 format
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      // Center the image on the page
      const x = (pdfWidth - imgWidth * ratio) / 2;
      const y = 0; // Start from the top
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth * ratio, imgHeight * ratio);
      
      // Create PDF URL for sharing
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      setLoading(false);
      return url;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setLoading(false);
      return null;
    }
  };

  const downloadPrescription = async () => {
    setLoading(true);
    try {
      let url = pdfUrl;
      
      // If PDF URL doesn't exist yet, generate it
      if (!url) {
        url = await generatePDF();
      }
      
      if (!url) {
        throw new Error("Failed to generate PDF");
      }
      
      // Create a download link and trigger it
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription_${prescriptionData.patientInfo.name.replace(/\s+/g, '_')}.pdf`;
      link.click();
      
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

  const shareViaWhatsApp = async (recipient: 'patient' | 'medicalShop') => {
    setLoading(true);
    try {
      let url = pdfUrl;
      
      // If PDF URL doesn't exist yet, generate it
      if (!url) {
        url = await generatePDF();
      }
      
      if (!url) {
        throw new Error("Failed to generate PDF");
      }
      
      // First approach: try to share using the Web Share API if available
      if (navigator.share && navigator.canShare) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const file = new File([blob], `prescription_${prescriptionData.patientInfo.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Prescription',
              text: `Prescription for ${prescriptionData.patientInfo.name}`,
              files: [file]
            });
            
            toast({
              title: "Sharing Successful",
              description: "The prescription has been shared successfully.",
            });
            return;
          }
        } catch (error) {
          console.log("Web Share API failed, falling back to WhatsApp:", error);
          // Fall back to WhatsApp approach
        }
      }
      
      // Fallback: Create a message for WhatsApp with a link to view the prescription
      // Get the appropriate number based on recipient type
      let phoneNumber = '';
      if (recipient === 'patient') {
        phoneNumber = prescriptionData.patientInfo.contactNumber;
      } else if (recipient === 'medicalShop') {
        phoneNumber = profile?.clinicWhatsApp || '';
      }
      
      // Remove non-digit characters from the phone number
      const cleanPhone = phoneNumber.replace(/\D+/g, '');
      
      if (!cleanPhone) {
        toast({
          title: recipient === 'medicalShop' ? "Medical Shop WhatsApp Not Set" : "Patient Phone Missing",
          description: recipient === 'medicalShop' 
            ? "Please add a medical shop WhatsApp number in your profile settings."
            : "Patient's contact number is missing.",
          variant: "destructive"
        });
        return;
      }
      
      // Create a message with prescription details
      let message = `*Prescription from ${profile?.clinicName || 'Doctor'}*\n\n`;
      message += `*Dr:* ${profile?.name || 'Doctor'}\n`;
      message += `*Date:* ${prescriptionData.date}\n\n`;
      message += `*Patient:* ${prescriptionData.patientInfo.name}\n`;
      message += `*Age/Gender:* ${prescriptionData.patientInfo.age}/${prescriptionData.patientInfo.gender}\n\n`;
      
      // Add note that PDF is attached/shared
      message += `Please find the attached prescription PDF or download it from the provided link.\n\n`;
      
      // Encode the message for the URL
      const encodedMessage = encodeURIComponent(message);
      
      const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      window.open(whatsappURL, '_blank');
      
      toast({
        title: "WhatsApp Opening",
        description: `Opening WhatsApp to share prescription with ${recipient === 'medicalShop' ? 'medical shop' : 'patient'}.`,
      });
    } catch (error) {
      console.error("Error sharing prescription:", error);
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing the prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow p-3 sm:p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                size="sm" 
                className="flex gap-1 items-center"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h2 className="text-base font-bold text-gray-800">Prescription Details</h2>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                onClick={downloadPrescription} 
                disabled={loading} 
                size="sm"
                className="bg-medical-600 hover:bg-medical-700 flex-1 sm:flex-initial"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {loading ? 'Processing...' : 'Download PDF'}
              </Button>
              <Button 
                onClick={() => shareViaWhatsApp('patient')} 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-initial"
                disabled={loading}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share with Patient
              </Button>
              <Button 
                onClick={() => shareViaWhatsApp('medicalShop')} 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-initial"
                disabled={loading}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Share with Medical Shop
              </Button>
            </div>
          </div>
          
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <div id="prescription-to-print" className="p-4 sm:p-6 bg-white">
                {/* Clinic Header */}
                <div className="text-center border-b pb-4 mb-4">
                  <div className="flex items-center mb-2">
                    {profile?.prescriptionStyle?.showLogo && profile?.clinicLogo && (
                      <div className="w-32 h-32 mr-4 flex items-center justify-center">
                        <img 
                          src={profile.clinicLogo} 
                          alt="Clinic Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-medical-700">{profile?.clinicName || "City Health Clinic"}</h1>
                      <p className="text-sm text-gray-600">{profile?.name || "Dr. Sarah Johnson"}</p>
                      <p className="text-xs text-gray-500">{profile?.address || "123 Medical Street, Healthcare City, HC 12345"}</p>
                      <p className="text-xs text-gray-500">Phone: {profile?.phone || "+1 (555) 123-4567"} | Email: {profile?.email || "dr.johnson@cityhealthclinic.com"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Prescription Title & Date */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
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
                
                {/* Medications - Only render if there are medications */}
                {prescriptionData.medications && prescriptionData.medications.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Medications</h3>
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-600">Medication</th>
                            <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-600">Dosage</th>
                            <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-600">Frequency</th>
                            <th className="px-2 sm:px-3 py-2 text-left font-medium text-gray-600">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {prescriptionData.medications.map((med) => (
                            <tr key={med.id}>
                              <td className="px-2 sm:px-3 py-2">{med.name}</td>
                              <td className="px-2 sm:px-3 py-2">{med.dosage}</td>
                              <td className="px-2 sm:px-3 py-2">{med.frequency}</td>
                              <td className="px-2 sm:px-3 py-2">{med.duration}</td>
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
                    <p className="text-sm">{profile?.name || "Dr. Sarah Johnson"}</p>
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
