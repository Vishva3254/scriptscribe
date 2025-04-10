
import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileImageUploaderProps {
  currentImage: string | null | undefined;
  name: string;
  isEditing: boolean;
  onUpload: (file: File) => Promise<void>;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImage,
  name,
  isEditing,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5000000) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image less than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpload(file);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-32 w-32 mb-4">
        {currentImage ? (
          <AvatarImage src={currentImage} alt={name} />
        ) : (
          <AvatarFallback className="bg-medical-100 text-medical-800 text-3xl">
            {name ? getInitials(name) : <User className="h-12 w-12" />}
          </AvatarFallback>
        )}
      </Avatar>
      
      {isEditing && (
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-3 right-0 rounded-full p-1 h-8 w-8" 
          onClick={triggerFileUpload}
        >
          <Camera className="h-4 w-4" />
          <span className="sr-only">Upload picture</span>
        </Button>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      
      {isEditing && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2" 
          onClick={triggerFileUpload}
        >
          Change Picture
        </Button>
      )}
    </div>
  );
};

export default ProfileImageUploader;
