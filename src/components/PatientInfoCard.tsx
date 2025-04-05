
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <Card className="mb-3 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base text-medical-700">Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="w-full">
            <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <Input
              id="patient-name"
              placeholder="Enter patient name"
              value={patientInfo.name}
              onChange={(e) => updatePatientInfo('name', e.target.value)}
              className="w-full text-xs sm:text-sm"
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <Input
              id="age"
              placeholder="Enter age"
              value={patientInfo.age}
              onChange={(e) => updatePatientInfo('age', e.target.value)}
              className="w-full text-xs sm:text-sm"
              type="number"
              min="0"
              max="120"
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <RadioGroup 
              value={patientInfo.gender} 
              onValueChange={(value) => updatePatientInfo('gender', value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="gender-male" />
                <Label htmlFor="gender-male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="gender-female" />
                <Label htmlFor="gender-female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="gender-other" />
                <Label htmlFor="gender-other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="w-full">
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <Input
              id="contact"
              placeholder="Enter contact number with country code"
              value={patientInfo.contactNumber}
              onChange={(e) => updatePatientInfo('contactNumber', e.target.value)}
              className="w-full text-xs sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Example: +1 (555) 123-4567</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
