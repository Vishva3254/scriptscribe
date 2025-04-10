
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Define types for our user profile based on the Database types
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface UserProfile {
  name: string;
  email: string;
  clinicName: string;
  address: string;
  phone?: string;
  clinicWhatsApp?: string;
  qualification?: string;
  registrationNumber?: string;
  profilePic?: string;
  clinicLogo?: string;
  prescriptionStyle?: {
    headerColor: string;
    fontFamily: string;
    showLogo: boolean;
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Omit<UserProfile, 'email'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string | null>;
  uploadClinicLogo: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener first to avoid missing auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event);
        
        // Only update state synchronously in the callback
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If we have a user, fetch their profile using setTimeout to avoid deadlocks
        if (newSession?.user) {
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        return;
      }

      console.log('Profile data received:', data);

      if (data) {
        const userProfile: UserProfile = {
          name: data.name,
          email: data.email,
          clinicName: data.clinicname,
          address: data.address,
          phone: data.phone || undefined,
          clinicWhatsApp: data.clinicwhatsapp || undefined,
          qualification: data.qualification || undefined,
          registrationNumber: data.registrationnumber || undefined,
          profilePic: data.profilepic || undefined,
          clinicLogo: data.cliniclogo || undefined,
          prescriptionStyle: data.prescriptionstyle as UserProfile['prescriptionStyle'] || {
            headerColor: "#1E88E5",
            fontFamily: "Inter",
            showLogo: true
          }
        };
        console.log('Setting user profile:', userProfile);
        setProfile(userProfile);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setIsLoading(false);
    }
  };

  // Function to upload profile image to Supabase storage
  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile-${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (!publicUrlData.publicUrl) {
        toast({
          title: 'URL generation failed',
          description: 'Could not get public URL for uploaded image',
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
      
      // Return the public URL
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Profile image upload error:', error);
      toast({
        title: 'Upload error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to upload clinic logo to Supabase storage
  const uploadClinicLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/clinic-logo-${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
        
      if (!publicUrlData.publicUrl) {
        toast({
          title: 'URL generation failed',
          description: 'Could not get public URL for uploaded image',
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
      
      // Return the public URL
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Clinic logo upload error:', error);
      toast({
        title: 'Upload error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Omit<UserProfile, 'email'>
  ) => {
    try {
      setIsLoading(true);
      
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Signup failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      if (data.user) {
        console.log('User created:', data.user);
        
        // Now create the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name: userData.name,
            clinicname: userData.clinicName,
            address: userData.address,
            phone: userData.phone || null,
            clinicwhatsapp: userData.clinicWhatsApp || null,
            qualification: userData.qualification || null,
            registrationnumber: userData.registrationNumber || null,
            cliniclogo: userData.clinicLogo || null,
            prescriptionstyle: {
              headerColor: "#1E88E5",
              fontFamily: "Inter",
              showLogo: true
            }
          });

        if (profileError) {
          console.error('Profile creation failed:', profileError);
          toast({
            title: 'Profile creation failed',
            description: profileError.message,
            variant: 'destructive',
          });
          throw profileError;
        }

        console.log('Profile created for user:', data.user.id);

        toast({
          title: 'Account created',
          description: 'Your account has been created successfully',
        });
        
        // Fetch the profile right after creating it
        await fetchProfile(data.user.id);
        
        navigate('/');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // Fetch profile immediately after successful login
      if (data.user) {
        console.log('User logged in:', data.user.id);
        await fetchProfile(data.user.id);
      }

      toast({
        title: 'Login successful',
        description: 'Welcome back to ScriptScribe',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      
      // Clear profile data on signout
      setProfile(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Unexpected error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('Updating profile with:', updates);
      
      const dbUpdates: Partial<ProfileRow> = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.clinicName) dbUpdates.clinicname = updates.clinicName;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.clinicWhatsApp !== undefined) dbUpdates.clinicwhatsapp = updates.clinicWhatsApp;
      if (updates.qualification !== undefined) dbUpdates.qualification = updates.qualification;
      if (updates.registrationNumber !== undefined) dbUpdates.registrationnumber = updates.registrationNumber;
      if (updates.profilePic !== undefined) dbUpdates.profilepic = updates.profilePic;
      if (updates.clinicLogo !== undefined) dbUpdates.cliniclogo = updates.clinicLogo;
      if (updates.prescriptionStyle !== undefined) dbUpdates.prescriptionstyle = updates.prescriptionStyle;
      
      console.log('Database updates:', dbUpdates);
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Profile update failed',
          description: error.message,
          variant: 'destructive',
        });
        console.error('Error updating profile:', error);
        return;
      }

      console.log('Profile updated successfully');
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          ...updates
        });
      }
      
      // Also refresh profile data from database to ensure we have the latest
      await fetchProfile(user.id);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Unexpected error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadProfileImage,
    uploadClinicLogo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
