
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface MedicationCardProps {
  medications: Medication[];
  addMedication: () => void;
  updateMedication: (id: string, field: string, value: string) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medications, addMedication, updateMedication }) => {
  return (
    <Card className="mb-4 w-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm sm:text-base text-medical-700">Medications</CardTitle>
        <Button onClick={addMedication} size="sm" variant="outline" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Medication
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {medications.map((medication, index) => (
            <div key={medication.id} className="p-3 border rounded-md bg-gray-50">
              <h4 className="font-medium mb-2 text-xs sm:text-sm">Medication #{index + 1}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`med-name-${medication.id}`} className="text-xs">Medication Name</Label>
                  <Input
                    id={`med-name-${medication.id}`}
                    value={medication.name}
                    onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                    placeholder="Enter medication name"
                    className="h-8 text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor={`med-dosage-${medication.id}`} className="text-xs">Dosage</Label>
                  <Input
                    id={`med-dosage-${medication.id}`}
                    value={medication.dosage}
                    onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                    className="h-8 text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor={`med-frequency-${medication.id}`} className="text-xs">Frequency</Label>
                  <Select 
                    value={medication.frequency} 
                    onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                  >
                    <SelectTrigger id={`med-frequency-${medication.id}`} className="h-8 text-xs">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily" className="text-xs">Once Daily</SelectItem>
                      <SelectItem value="twice-daily" className="text-xs">Twice Daily</SelectItem>
                      <SelectItem value="thrice-daily" className="text-xs">Three Times Daily</SelectItem>
                      <SelectItem value="four-times-daily" className="text-xs">Four Times Daily</SelectItem>
                      <SelectItem value="as-needed" className="text-xs">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor={`med-duration-${medication.id}`} className="text-xs">Duration</Label>
                  <Input
                    id={`med-duration-${medication.id}`}
                    value={medication.duration}
                    onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor={`med-instructions-${medication.id}`} className="text-xs">Special Instructions</Label>
                <Input
                  id={`med-instructions-${medication.id}`}
                  value={medication.instructions}
                  onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                  placeholder="e.g., Take with food"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ))}
          
          {medications.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-xs">
              No medications added yet. Click the "Add Medication" button to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationCard;
