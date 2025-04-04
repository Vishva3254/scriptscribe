
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PatientInfoCardProps {
  updatePatientInfo: (field: string, value: string) => void;
  patientInfo: {
    name: string;
    age: string;
    gender: string;
    contactNumber: string;
  };
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ updatePatientInfo, patientInfo }) => {
  return (
    <Card className="mb-4 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base text-medical-700">Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="patientName" className="text-xs sm:text-sm">Patient Name</Label>
            <Input 
              id="patientName" 
              placeholder="Enter patient name"
              value={patientInfo.name}
              onChange={(e) => updatePatientInfo('name', e.target.value)}
              className="w-full text-xs sm:text-sm h-8 sm:h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="patientAge" className="text-xs sm:text-sm">Age</Label>
            <Input 
              id="patientAge" 
              placeholder="Enter age"
              value={patientInfo.age}
              onChange={(e) => updatePatientInfo('age', e.target.value)}
              className="w-full text-xs sm:text-sm h-8 sm:h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="patientGender" className="text-xs sm:text-sm">Gender</Label>
            <Input 
              id="patientGender" 
              placeholder="Enter gender"
              value={patientInfo.gender}
              onChange={(e) => updatePatientInfo('gender', e.target.value)}
              className="w-full text-xs sm:text-sm h-8 sm:h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="patientContact" className="text-xs sm:text-sm">Contact Number</Label>
            <Input 
              id="patientContact" 
              placeholder="Enter contact number"
              value={patientInfo.contactNumber}
              onChange={(e) => updatePatientInfo('contactNumber', e.target.value)}
              className="w-full text-xs sm:text-sm h-8 sm:h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
