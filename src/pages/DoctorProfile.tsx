
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';
import { getDoctorPrescriptions } from '@/services/prescriptionService';
import { useQuery } from '@tanstack/react-query';

const DoctorProfile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    clinicName: user?.clinicName || '',
    address: user?.address || '',
    email: user?.email || '',
    headerColor: user?.prescriptionSettings?.headerColor || '#4F46E5',
    footerText: user?.prescriptionSettings?.footerText || '',
  });

  // Fetch prescriptions by doctor
  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: () => user?.id ? getDoctorPrescriptions(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      await updateProfile({
        name: formData.name,
        clinicName: formData.clinicName,
        address: formData.address,
        email: formData.email,
        prescriptionSettings: {
          headerColor: formData.headerColor,
          footerText: formData.footerText,
          logo: user.prescriptionSettings?.logo
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUploaded = async (imageUrl: string) => {
    if (!user) return;
    
    try {
      await updateProfile({
        imageUrl
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const viewPrescription = (prescriptionId: string) => {
    navigate(`/prescription?id=${prescriptionId}`);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center">Please log in to view your profile.</p>
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow p-3 sm:p-4">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Doctor Profile</h2>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="prescriptions">My Prescriptions</TabsTrigger>
              <TabsTrigger value="settings">Prescription Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex justify-center mb-2">
                      <ImageUploader 
                        currentImageUrl={user.imageUrl} 
                        userId={user.id}
                        onImageUploaded={handleImageUploaded}
                      />
                    </div>
                    
                    {!isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-gray-500">Doctor Name</Label>
                          <p className="font-medium">{user.name}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Email</Label>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Clinic Name</Label>
                          <p className="font-medium">{user.clinicName}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Address</Label>
                          <p className="font-medium">{user.address}</p>
                        </div>
                        
                        <div className="flex justify-between pt-4">
                          <Button 
                            onClick={() => setIsEditing(true)} 
                            variant="outline"
                          >
                            Edit Profile
                          </Button>
                          
                          <Button 
                            onClick={handleSignOut} 
                            variant="destructive"
                          >
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Doctor Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="clinicName">Clinic Name</Label>
                          <Input
                            id="clinicName"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button type="submit">Save Changes</Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: user.name,
                                clinicName: user.clinicName,
                                address: user.address,
                                email: user.email,
                                headerColor: user.prescriptionSettings?.headerColor || '#4F46E5',
                                footerText: user.prescriptionSettings?.footerText || '',
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prescriptions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  {prescriptions && prescriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Patient</th>
                            <th className="px-4 py-2 text-left">Medications</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions.map((prescription) => (
                            <tr key={prescription.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">{prescription.date}</td>
                              <td className="px-4 py-3">{prescription.patientInfo.name}</td>
                              <td className="px-4 py-3">{prescription.medications.length} medications</td>
                              <td className="px-4 py-3 text-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => viewPrescription(prescription.id)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No prescriptions found</p>
                      <Button 
                        onClick={() => navigate('/')} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Create New Prescription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prescription Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="headerColor">Header Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="headerColor"
                          name="headerColor"
                          type="color"
                          value={formData.headerColor}
                          onChange={handleChange}
                          className="w-16 h-10 p-1"
                        />
                        <span className="text-sm">{formData.headerColor}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="footerText">Footer Text</Label>
                      <Textarea
                        id="footerText"
                        name="footerText"
                        value={formData.footerText}
                        onChange={handleChange}
                        placeholder="© 2025 Your Clinic Name"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This text will appear at the bottom of your prescriptions
                      </p>
                    </div>
                    
                    <Button type="button" onClick={handleSubmit}>
                      Save Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorProfile;
