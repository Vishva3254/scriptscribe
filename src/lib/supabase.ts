
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key';

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://example.supabase.co' &&
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key';

// Log warning for missing or default credentials
if (!hasValidCredentials) {
  console.warn(`
    =====================================
    IMPORTANT: Missing Supabase credentials
    =====================================
    For this app to work correctly, you need to set up proper Supabase credentials.
    
    1. Get your Supabase URL and Anonymous key from your Supabase dashboard
    2. Set these values in your environment:
       - VITE_SUPABASE_URL
       - VITE_SUPABASE_ANON_KEY
       
    The app will run in demo mode until these are provided.
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if database is connected
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('doctor_profiles').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Helper function to handle image uploads
export async function uploadImage(file: File, userId: string): Promise<string | null> {
  try {
    if (!hasValidCredentials) {
      console.warn('Cannot upload image: Missing valid Supabase credentials');
      return 'https://placehold.co/400x400?text=Demo+Image';
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `doctor-profiles/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }
    
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in upload process:', error);
    return null;
  }
}
