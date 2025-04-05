
import { supabase } from '@/lib/supabase';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  contactNumber: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientInfo: PatientInfo;
  prescriptionText: string;
  medications: Medication[];
  date: string;
  createdAt: string;
}

// Demo data for when Supabase is not connected
const DEMO_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'demo-prescription-1',
    doctorId: 'demo-user-id',
    patientInfo: {
      name: 'John Demo',
      age: '42',
      gender: 'Male',
      contactNumber: '555-123-4567'
    },
    prescriptionText: 'Patient complains of headache and fatigue for the past 3 days. Vital signs normal.',
    medications: [
      {
        id: 'med-1',
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        duration: '5 days',
        instructions: 'Take after meals'
      }
    ],
    date: '2025-04-01',
    createdAt: '2025-04-01T10:30:00Z'
  }
];

// Helper to check if we're in demo mode
const isDemoMode = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('prescriptions').select('count', { count: 'exact', head: true });
    return !!error;
  } catch (error) {
    return true;
  }
}

export async function savePrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    // Check if we're in demo mode
    if (await isDemoMode()) {
      console.log('Demo mode: Simulating prescription save');
      const demoId = `demo-${Date.now()}`;
      return demoId;
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        doctor_id: prescription.doctorId,
        patient_info: prescription.patientInfo,
        prescription_text: prescription.prescriptionText,
        medications: prescription.medications,
        date: prescription.date,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving prescription:', error);
      return null;
    }

    return data?.id;
  } catch (error) {
    console.error('Exception saving prescription:', error);
    return null;
  }
}

export async function getDoctorPrescriptions(doctorId: string): Promise<Prescription[]> {
  try {
    // Check if we're in demo mode
    if (await isDemoMode()) {
      console.log('Demo mode: Returning demo prescriptions');
      return DEMO_PRESCRIPTIONS;
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      doctorId: item.doctor_id,
      patientInfo: item.patient_info,
      prescriptionText: item.prescription_text,
      medications: item.medications,
      date: item.date,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Exception fetching prescriptions:', error);
    return [];
  }
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  try {
    // Check if we're in demo mode
    if (await isDemoMode()) {
      console.log('Demo mode: Returning demo prescription');
      return DEMO_PRESCRIPTIONS[0];
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching prescription:', error);
      return null;
    }

    return {
      id: data.id,
      doctorId: data.doctor_id,
      patientInfo: data.patient_info,
      prescriptionText: data.prescription_text,
      medications: data.medications,
      date: data.date,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Exception fetching prescription:', error);
    return null;
  }
}
