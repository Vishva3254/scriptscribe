
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { FileText, Search, Eye, Plus, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define the medication type
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Define the prescription type with proper typing for medications
interface SavedPrescription {
  id: string;
  patient_name: string;
  patient_age: string | null;
  patient_gender: string | null;
  patient_contact: string | null;
  prescription_text: string | null;
  medications: Medication[] | null;
  created_at: string;
}

// Type guard function to validate if the Json value is a valid Medication array
const isMedicationArray = (medications: Json | null): medications is any => {
  if (!medications || !Array.isArray(medications)) {
    return false;
  }
  
  return medications.every(med => 
    typeof med === 'object' && 
    med !== null && 
    'id' in med &&
    'name' in med &&
    'dosage' in med &&
    'frequency' in med &&
    'duration' in med &&
    'instructions' in med
  );
};

const SavedPrescriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<SavedPrescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<SavedPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'contact' | 'date'>('name');

  // Load prescriptions when component mounts
  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    } else if (!authLoading) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Fetch prescriptions from Supabase
  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match our SavedPrescription type
        const typedPrescriptions: SavedPrescription[] = data.map(item => ({
          id: item.id,
          patient_name: item.patient_name,
          patient_age: item.patient_age,
          patient_gender: item.patient_gender,
          patient_contact: item.patient_contact,
          prescription_text: item.prescription_text,
          medications: isMedicationArray(item.medications) ? item.medications as Medication[] : null,
          created_at: item.created_at
        }));
        
        setPrescriptions(typedPrescriptions);
        setFilteredPrescriptions(typedPrescriptions);
      }
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: 'Failed to fetch prescriptions',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPrescriptions(prescriptions);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = prescriptions.filter(prescription => {
      if (searchType === 'name' && prescription.patient_name) {
        return prescription.patient_name.toLowerCase().includes(lowerQuery);
      } else if (searchType === 'contact' && prescription.patient_contact) {
        return prescription.patient_contact.toLowerCase().includes(lowerQuery);
      } else if (searchType === 'date') {
        // Format the date for comparison
        const prescriptionDate = formatDate(prescription.created_at);
        return prescriptionDate.includes(lowerQuery);
      }
      return false;
    });

    setFilteredPrescriptions(filtered);
  };

  // View a specific prescription
  const viewPrescription = (prescription: SavedPrescription) => {
    navigate('/prescription', {
      state: {
        prescriptionData: {
          patientInfo: {
            name: prescription.patient_name,
            age: prescription.patient_age || '',
            gender: prescription.patient_gender || '',
            contactNumber: prescription.patient_contact || '',
          },
          prescriptionText: prescription.prescription_text || '',
          medications: prescription.medications || [],
          date: prescription.created_at
        }
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow p-3 sm:p-4">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-base font-bold text-gray-800">Saved Prescriptions</h2>
            <Button 
              onClick={() => navigate('/')} 
              size="sm"
              className="bg-medical-600 hover:bg-medical-700 text-white"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create New Prescription
            </Button>
          </div>

          {/* Search Card */}
          <Card className="mb-4 w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base text-medical-700">Search Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search by ${searchType === 'name' ? 'patient name' : searchType === 'contact' ? 'contact number' : 'date (dd/mm/yyyy)'}`}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setSearchType('name')} 
                    variant={searchType === 'name' ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    <User className="h-3.5 w-3.5 mr-1" />
                    Name
                  </Button>
                  <Button 
                    onClick={() => setSearchType('contact')} 
                    variant={searchType === 'contact' ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Contact
                  </Button>
                  <Button 
                    onClick={() => setSearchType('date')} 
                    variant={searchType === 'date' ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Date
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : filteredPrescriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Gender/Age</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">{prescription.patient_name}</TableCell>
                          <TableCell>
                            {prescription.patient_gender && prescription.patient_age 
                              ? `${prescription.patient_gender}, ${prescription.patient_age}` 
                              : prescription.patient_gender || prescription.patient_age || '-'}
                          </TableCell>
                          <TableCell>{prescription.patient_contact || '-'}</TableCell>
                          <TableCell>{formatDate(prescription.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              onClick={() => viewPrescription(prescription)} 
                              variant="ghost" 
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No prescriptions found</h3>
                  <p className="text-gray-500 mt-1">
                    {searchQuery ? 'Try a different search term' : 'Create your first prescription to see it here'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => navigate('/')} 
                      className="mt-4 bg-medical-600 hover:bg-medical-700"
                    >
                      Create New Prescription
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SavedPrescriptions;
