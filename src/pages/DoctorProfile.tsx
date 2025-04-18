import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Save, X, Image, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clinicLogoPreview, setClinicLogoPreview] = useState<string | null>(null);
  const { profile, updateProfile, uploadProfileImage, uploadClinicLogo, isLoading, user } = useAuth();
  
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    email: '',
    clinicName: '',
    address: '',
    phone: '',
    clinicWhatsApp: '', 
    qualification: '',
    registrationNumber: '',
    profilePic: null as string | null,
    clinicLogo: null as string | null,
    prescriptionStyle: {
      headerColor: '#1E88E5',
      fontFamily: 'Inter',
      showLogo: true,
    }
  });

  useEffect(() => {
    console.log("Profile updated in DoctorProfile component:", profile);
    
    if (profile) {
      setDoctorInfo({
        name: profile.name || '',
        email: profile.email || '',
        clinicName: profile.clinicName || '',
        address: profile.address || '',
        phone: profile.phone || '',
        clinicWhatsApp: profile.clinicWhatsApp || '',
        qualification: profile.qualification || '',
        registrationNumber: profile.registrationNumber || '',
        profilePic: profile.profilePic || null,
        clinicLogo: profile.clinicLogo || null,
        prescriptionStyle: profile.prescriptionStyle || doctorInfo.prescriptionStyle
      });
      
      if (profile.clinicLogo) {
        setClinicLogoPreview(profile.clinicLogo);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to view your profile',
        variant: 'destructive'
      });
      navigate('/login');
    }
  }, [isLoading, user, navigate, toast]);

  const handleProfilePicUpload = async (file: File) => {
    try {
      const imageUrl = await uploadProfileImage(file);
      
      if (imageUrl) {
        setDoctorInfo(prev => ({
          ...prev,
          profilePic: imageUrl
        }));
        
        toast({
          title: "Image uploaded",
          description: "Your profile picture has been updated",
        });
      }
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleClinicLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image less than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const imageUrl = await uploadClinicLogo(file);
      
      if (imageUrl) {
        setClinicLogoPreview(imageUrl);
        setDoctorInfo(prev => ({
          ...prev,
          clinicLogo: imageUrl
        }));
        
        toast({
          title: "Logo uploaded",
          description: "Your clinic logo has been updated",
        });
      }
    } catch (error: any) {
      console.error("Error uploading clinic logo:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctorInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStyleChange = (name: string, value: string | boolean) => {
    setDoctorInfo(prev => ({
      ...prev,
      prescriptionStyle: {
        ...prev.prescriptionStyle,
        [name]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!doctorInfo.name || !doctorInfo.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateProfile({
        name: doctorInfo.name,
        clinicName: doctorInfo.clinicName,
        address: doctorInfo.address,
        phone: doctorInfo.phone,
        clinicWhatsApp: doctorInfo.clinicWhatsApp,
        qualification: doctorInfo.qualification,
        registrationNumber: doctorInfo.registrationNumber,
        prescriptionStyle: doctorInfo.prescriptionStyle
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDoctorInfo({
        name: profile.name || '',
        email: profile.email || '',
        clinicName: profile.clinicName || '',
        address: profile.address || '',
        phone: profile.phone || '',
        clinicWhatsApp: profile.clinicWhatsApp || '',
        qualification: profile.qualification || '',
        registrationNumber: profile.registrationNumber || '',
        profilePic: profile.profilePic || null,
        clinicLogo: profile.clinicLogo || null,
        prescriptionStyle: profile.prescriptionStyle || doctorInfo.prescriptionStyle
      });
      
      setClinicLogoPreview(profile.clinicLogo || null);
    }
    
    setIsEditing(false);
  };

  const triggerLogoUpload = () => {
    logoInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-3 py-4 md:py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading profile data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-3 py-4 md:py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">No profile data found. Please sign in.</p>
            <Button 
              onClick={() => navigate('/login')}
              className="mt-4"
            >
              Go to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-3 py-4 md:py-6">
        <div className="flex items-center mb-4 gap-2">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            size="sm" 
            className="flex gap-1 items-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Profile Details</TabsTrigger>
            <TabsTrigger value="prescription">Prescription Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="w-full md:w-1/3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <ProfileImageUploader 
                    currentImage={doctorInfo.profilePic}
                    name={doctorInfo.name}
                    isEditing={isEditing}
                    onUpload={handleProfilePicUpload}
                  />
                  <h3 className="text-lg font-semibold mt-2">{doctorInfo.name}</h3>
                  <p className="text-gray-600 text-sm">{doctorInfo.qualification}</p>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <FileEdit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button variant="default" size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Doctor's Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        value={doctorInfo.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email*</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={doctorInfo.email}
                        onChange={handleChange}
                        disabled={true}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">Contact Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={doctorInfo.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Personal contact number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicWhatsApp" className="text-sm font-medium text-gray-700 mb-1">Medical Shop WhatsApp</Label>
                      <Input
                        id="clinicWhatsApp"
                        name="clinicWhatsApp"
                        value={doctorInfo.clinicWhatsApp}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Include country code (e.g. +91xxxxxxxxxx)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="qualification" className="text-sm font-medium text-gray-700 mb-1">Qualification</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={doctorInfo.qualification}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700 mb-1">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        value={doctorInfo.registrationNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicName" className="text-sm font-medium text-gray-700 mb-1">Clinic Name*</Label>
                      <Input
                        id="clinicName"
                        name="clinicName"
                        value={doctorInfo.clinicName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicLogo" className="text-sm font-medium text-gray-700 mb-1">Clinic Logo</Label>
                      <div className="flex items-center space-x-2">
                        {clinicLogoPreview && (
                          <div className="w-10 h-10 rounded-md overflow-hidden">
                            <img 
                              src={clinicLogoPreview} 
                              alt="Clinic Logo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={logoInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleClinicLogoUpload}
                        />
                        {isEditing && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={triggerLogoUpload}
                          >
                            <Image className="h-4 w-4 mr-1" />
                            {clinicLogoPreview ? "Change Logo" : "Upload Logo"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1">Clinic Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={doctorInfo.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="prescription" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Prescription Layout Settings</span>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <FileEdit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button variant="default" size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="headerColor" className="text-sm font-medium text-gray-700 mb-1">
                      Header Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        id="headerColor"
                        value={doctorInfo.prescriptionStyle.headerColor}
                        onChange={e => handleStyleChange('headerColor', e.target.value)}
                        disabled={!isEditing}
                        className="w-20 h-10"
                      />
                      <span className="text-sm text-gray-500">{doctorInfo.prescriptionStyle.headerColor}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fontFamily" className="text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </Label>
                    <select
                      id="fontFamily"
                      value={doctorInfo.prescriptionStyle.fontFamily}
                      onChange={e => handleStyleChange('fontFamily', e.target.value)}
                      disabled={!isEditing}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showLogo"
                      checked={doctorInfo.prescriptionStyle.showLogo}
                      onChange={e => handleStyleChange('showLogo', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="showLogo" className="text-sm font-medium text-gray-700">
                      Show Logo on Prescription
                    </Label>
                  </div>
                </div>
                
                <div className="mt-6 border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                  <div className="border rounded-md overflow-hidden">
                    <div 
                      style={{ backgroundColor: doctorInfo.prescriptionStyle.headerColor }}
                      className="p-3 text-white"
                    >
                      <div className="flex items-center justify-between">
                        {doctorInfo.prescriptionStyle.showLogo && (clinicLogoPreview || doctorInfo.profilePic) && (
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center">
                            <img 
                              src={clinicLogoPreview || doctorInfo.profilePic} 
                              alt="Logo" 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        <div className={`text-right ${doctorInfo.prescriptionStyle.showLogo ? '' : 'w-full text-center'}`}>
                          <h3 className="font-bold" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                            {doctorInfo.clinicName || 'Clinic Name'}
                          </h3>
                          <p className="text-xs" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                            {doctorInfo.address || 'Clinic Address'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between text-sm">
                        <div>
                          <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                            <strong>Dr. {doctorInfo.name || 'Doctor Name'}</strong>
                          </p>
                          <p className="text-xs" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                            {doctorInfo.qualification || 'Qualifications'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Date: {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 border-t pt-2">
                        <p className="text-xs text-gray-500" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                          This is a preview of how your prescription header will look.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Preview Full Prescription</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Full Prescription Layout</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Prescription Preview</DialogTitle>
                      <DialogDescription>
                        This is how your prescriptions will look when downloaded or shared.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="border rounded-md overflow-hidden mt-4">
                      <div 
                        style={{ backgroundColor: doctorInfo.prescriptionStyle.headerColor }}
                        className="p-4 text-white"
                      >
                        <div className="flex items-center justify-between">
                          {doctorInfo.prescriptionStyle.showLogo && (clinicLogoPreview || doctorInfo.profilePic) && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                              <img 
                                src={clinicLogoPreview || doctorInfo.profilePic} 
                                alt="Logo" 
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                          <div className={`text-right ${doctorInfo.prescriptionStyle.showLogo ? '' : 'w-full text-center'}`}>
                            <h3 className="text-xl font-bold" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              {doctorInfo.clinicName || 'Clinic Name'}
                            </h3>
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              {doctorInfo.address || 'Clinic Address'}
                            </p>
                            <p className="text-sm" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              Phone: {doctorInfo.phone || 'Contact Number'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              <strong>Dr. {doctorInfo.name || 'Doctor Name'}</strong>
                            </p>
                            <p className="text-sm" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              {doctorInfo.qualification || 'Qualifications'}
                            </p>
                            <p className="text-sm" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              Reg. No: {doctorInfo.registrationNumber || 'Registration Number'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Date: {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-2 border rounded-md">
                          <p className="font-semibold" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Patient Information:</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Name: John Doe</p>
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Age: 45 years</p>
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Gender: Male</p>
                            <p style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Contact: +1 234 567 8900</p>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 flex items-center justify-center text-2xl">
                              ℞
                            </div>
                            <h3 className="font-bold" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>Prescription</h3>
                          </div>
                          
                          <div className="ml-10 space-y-4">
                            <div>
                              <p className="font-medium" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                                1. Paracetamol 500mg
                              </p>
                              <p className="ml-4 text-sm" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                                1 tablet three times a day after meals for 5 days
                              </p>
                            </div>
                            
                            <div>
                              <p className="font-medium" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                                2. Amoxicillin 250mg
                              </p>
                              <p className="ml-4 text-sm" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                                1 capsule twice a day for 7 days
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t">
                          <p className="text-right italic text-sm" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                            Doctor's Signature
                          </p>
                          <div className="text-right">
                            <p className="font-medium" style={{ fontFamily: doctorInfo.prescriptionStyle.fontFamily }}>
                              Dr. {doctorInfo.name || 'Doctor Name'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline">Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorProfile;
