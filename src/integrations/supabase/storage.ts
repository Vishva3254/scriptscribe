
import { supabase } from './client';

/**
 * This file contains utility functions for interacting with Supabase Storage
 * 
 * Note: The storage buckets 'avatars' and 'logos' have been created
 * in the Supabase project with appropriate RLS policies.
 */

/**
 * Uploads a file to the specified storage bucket
 * 
 * @param bucket The name of the storage bucket ('avatars' or 'logos')
 * @param filePath The path to store the file at
 * @param file The file to upload
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (
  bucket: string, 
  filePath: string, 
  file: File
): Promise<string | null> => {
  try {
    // Upload the file
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    if (!publicUrlData.publicUrl) {
      console.error('Could not generate public URL');
      return null;
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Deletes a file from storage
 * 
 * @param bucket The storage bucket containing the file ('avatars' or 'logos')
 * @param filePath The path of the file to delete
 * @returns true if successful, false otherwise
 */
export const deleteFile = async (bucket: string, filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
      
    if (error) {
      console.error(`Error deleting file from ${bucket}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

/**
 * Extract file path from a public URL
 * 
 * @param url The public URL of the file
 * @param bucket The bucket name
 * @returns The file path
 */
export const getPathFromUrl = (url: string, bucket: string): string | null => {
  try {
    // URLs are in format: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>/<file-path>
    const regex = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`);
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
};
