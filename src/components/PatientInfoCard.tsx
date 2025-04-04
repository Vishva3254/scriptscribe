
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
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-medical-700">Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input 
              id="patientName" 
              placeholder="Enter patient name"
              value={patientInfo.name}
              onChange={(e) => updatePatientInfo('name', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientAge">Age</Label>
            <Input 
              id="patientAge" 
              placeholder="Enter age"
              value={patientInfo.age}
              onChange={(e) => updatePatientInfo('age', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientGender">Gender</Label>
            <Input 
              id="patientGender" 
              placeholder="Enter gender"
              value={patientInfo.gender}
              onChange={(e) => updatePatientInfo('gender', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientContact">Contact Number</Label>
            <Input 
              id="patientContact" 
              placeholder="Enter contact number"
              value={patientInfo.contactNumber}
              onChange={(e) => updatePatientInfo('contactNumber', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
