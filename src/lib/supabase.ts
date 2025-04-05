
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key';

// Check if we're in production and variables are missing
if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://example.supabase.co')) {
  console.warn('Production environment detected without proper Supabase credentials.');
  // We don't throw here to allow the app to at least load in production
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle image uploads
export async function uploadImage(file: File, userId: string): Promise<string | null> {
  try {
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
