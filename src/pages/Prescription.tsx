
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Send, ShoppingCart, User, ArrowLeft, Share2, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { profile } = useAuth();

  // Format the date as DD/MM/YYYY
  const formatDateString = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
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

  // Format the prescription date
  const formattedDate = formatDateString(prescriptionData.date);

  // Generate PDF on component mount to have it ready for sharing
  useEffect(() => {
    generatePDF();
  }, []);

  const generatePDF = async (): Promise<string | null> => {
    setLoading(true);
    try {
      // Create a new jsPDF instance with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define A4 dimensions in mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // margin in mm
      
      // Add hospital/clinic header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(profile?.clinicName || "City Health Clinic", pageWidth / 2, margin + 5, { align: 'center' });
      
      // Add doctor information
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Dr. ${profile?.name || "Sarah Johnson"}`, pageWidth / 2, margin + 12, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(profile?.address || "123 Medical Street, Healthcare City, HC 12345", pageWidth / 2, margin + 17, { align: 'center' });
      pdf.text(`Phone: ${profile?.phone || "+1 (555) 123-4567"} | Email: ${profile?.email || "dr.johnson@cityhealthclinic.com"}`, pageWidth / 2, margin + 22, { align: 'center' });
      
      // Add horizontal line
      pdf.setDrawColor(100, 100, 100);
      pdf.line(margin, margin + 25, pageWidth - margin, margin + 25);
      
      // Add Prescription title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRESCRIPTION', margin, margin + 35);
      
      // Add date in DD/MM/YYYY format
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${formattedDate}`, pageWidth - margin - 30, margin + 35, { align: 'right' });
      
      // Add patient information section
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, margin + 40, pageWidth - (margin * 2), 20, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Patient Details:', margin + 2, margin + 46);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${prescriptionData.patientInfo.name}`, margin + 2, margin + 52);
      pdf.text(`Age/Gender: ${prescriptionData.patientInfo.age}/${prescriptionData.patientInfo.gender}`, margin + 80, margin + 52);
      pdf.text(`Contact: ${prescriptionData.patientInfo.contactNumber}`, margin + 2, margin + 58);
      
      // Add doctor's notes
      let currentY = margin + 70;
      
      if (prescriptionData.prescriptionText) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text("Doctor's Notes:", margin, currentY);
        
        currentY += 6;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        // Handle text wrapping for doctor's notes
        const splitText = pdf.splitTextToSize(prescriptionData.prescriptionText, pageWidth - (margin * 2));
        pdf.text(splitText, margin, currentY);
        
        currentY += (splitText.length * 4) + 6;
      }
      
      // Add medications section
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Medications:', margin, currentY);
        currentY += 6;
        
        // Create table header
        pdf.setFillColor(230, 230, 230);
        pdf.rect(margin, currentY, pageWidth - (margin * 2), 6, 'F');
        
        pdf.setFontSize(8.5);
        pdf.text('Medication', margin + 2, currentY + 4);
        pdf.text('Dosage', margin + 50, currentY + 4);
        pdf.text('Frequency', margin + 80, currentY + 4);
        pdf.text('Duration', margin + 120, currentY + 4);
        
        currentY += 6;
        
        // Add medication rows
        prescriptionData.medications.forEach((med, index) => {
          const rowHeight = 6;
          
          if (index % 2 === 0) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, 'F');
          }
          
          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'normal');
          pdf.text(med.name, margin + 2, currentY + 4);
          pdf.text(med.dosage, margin + 50, currentY + 4);
          pdf.text(med.frequency, margin + 80, currentY + 4);
          pdf.text(med.duration, margin + 120, currentY + 4);
          
          currentY += rowHeight;
        });
        
        // Add instructions
        currentY += 6;
        prescriptionData.medications.forEach((med) => {
          if (med.instructions) {
            pdf.setFontSize(8);
            const instText = `${med.name}: ${med.instructions}`;
            const splitInst = pdf.splitTextToSize(instText, pageWidth - (margin * 2));
            pdf.text(splitInst, margin, currentY);
            currentY += (splitInst.length * 3.5) + 1;
          }
        });
      }
      
      // Add signature section
      currentY = Math.max(currentY + 20, pageHeight - 30);
      
      pdf.setDrawColor(100, 100, 100);
      pdf.line(pageWidth - margin - 50, currentY, pageWidth - margin, currentY);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${profile?.name || "Dr. Sarah Johnson"}`, pageWidth - margin - 25, currentY + 5, { align: 'center' });
      pdf.setFontSize(8);
      pdf.text('Signature', pageWidth - margin - 25, currentY + 9, { align: 'center' });
      
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

  const printPrescription = async () => {
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
      
      // Open the PDF in a new window and print it
      const printWindow = window.open(url, '_blank');
      
      if (!printWindow) {
        throw new Error("Failed to open print window. Please check your popup blocker settings.");
      }
      
      // Wait for PDF to load before printing
      printWindow.addEventListener('load', () => {
        try {
          printWindow.print();
          toast({
            title: "Printing Prescription",
            description: "The print dialog has been opened.",
          });
        } catch (printError) {
          console.error("Error during printing:", printError);
          toast({
            title: "Print Failed",
            description: "There was an error while trying to print. Please try again.",
            variant: "destructive",
          });
        }
        setLoading(false);
      }, { once: true });
      
      // Fallback in case load event doesn't fire
      setTimeout(() => {
        if (loading) setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error printing prescription:", error);
      toast({
        title: "Print Failed",
        description: "There was an error preparing the prescription for printing. Please try again.",
        variant: "destructive",
      });
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
      
      // Add medications
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        message += "*Medications:*\n";
        prescriptionData.medications.forEach((med, idx) => {
          message += `${idx + 1}. ${med.name} - ${med.dosage} (${med.frequency}) for ${med.duration}\n`;
          if (med.instructions) {
            message += `   → ${med.instructions}\n`;
          }
        });
      }
      
      // Add doctor's notes if available
      if (prescriptionData.prescriptionText) {
        message += `\n*Notes:* ${prescriptionData.prescriptionText}\n\n`;
      }
      
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
                {loading ? 'Processing...' : 'Download'}
              </Button>
              <Button 
                onClick={printPrescription} 
                disabled={loading} 
                size="sm"
                variant="secondary"
                className="flex-1 sm:flex-initial"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                {loading ? 'Processing...' : 'Print'}
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
                    Date: <span className="font-medium">{formattedDate}</span>
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
