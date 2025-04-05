
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/supabase';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  userId: string;
  onImageUploaded: (url: string) => void;
}

const ImageUploader = ({ currentImageUrl, userId, onImageUploaded }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImage(file, userId);
      
      if (imageUrl) {
        onImageUploaded(imageUrl);
        toast({
          title: "Image uploaded",
          description: "Your profile image has been updated",
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
          {currentImageUrl ? (
            <img 
              src={currentImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-1"
            onClick={() => document.getElementById('imageInput')?.click()}
            disabled={uploading}
          >
            <Upload className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {uploading && (
        <div className="text-sm text-medical-600 mb-2">Uploading...</div>
      )}
      
      <input 
        id="imageInput"
        type="file" 
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => document.getElementById('imageInput')?.click()}
        disabled={uploading}
      >
        {currentImageUrl ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  );
};

export default ImageUploader;
