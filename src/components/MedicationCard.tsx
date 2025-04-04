
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
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-medical-700">Medications</CardTitle>
        <Button onClick={addMedication} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" /> Add Medication
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((medication, index) => (
            <div key={medication.id} className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-medium mb-3">Medication #{index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`med-name-${medication.id}`}>Medication Name</Label>
                  <Input
                    id={`med-name-${medication.id}`}
                    value={medication.name}
                    onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                    placeholder="Enter medication name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`med-dosage-${medication.id}`}>Dosage</Label>
                  <Input
                    id={`med-dosage-${medication.id}`}
                    value={medication.dosage}
                    onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                    placeholder="e.g., 500mg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`med-frequency-${medication.id}`}>Frequency</Label>
                  <Select 
                    value={medication.frequency} 
                    onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                  >
                    <SelectTrigger id={`med-frequency-${medication.id}`}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily">Once Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="thrice-daily">Three Times Daily</SelectItem>
                      <SelectItem value="four-times-daily">Four Times Daily</SelectItem>
                      <SelectItem value="as-needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`med-duration-${medication.id}`}>Duration</Label>
                  <Input
                    id={`med-duration-${medication.id}`}
                    value={medication.duration}
                    onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`med-instructions-${medication.id}`}>Special Instructions</Label>
                <Input
                  id={`med-instructions-${medication.id}`}
                  value={medication.instructions}
                  onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                  placeholder="e.g., Take with food"
                />
              </div>
            </div>
          ))}
          
          {medications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No medications added yet. Click the "Add Medication" button to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationCard;
