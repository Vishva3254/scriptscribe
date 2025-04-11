import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { uploadFile } from '@/integrations/supabase/storage';

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
  sessionExpiresAt: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session duration in seconds (24 hours)
const SESSION_DURATION = 24 * 60 * 60;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
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
        
        if (newSession) {
          // Calculate and set session expiry time
          const expiryTime = new Date();
          expiryTime.setSeconds(expiryTime.getSeconds() + SESSION_DURATION);
          setSessionExpiresAt(expiryTime);
          
          // Store expiry time in localStorage to persist across page reloads
          localStorage.setItem('sessionExpiryTime', expiryTime.toISOString());
          
          // If we have a user, fetch their profile using setTimeout to avoid deadlocks
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          localStorage.removeItem('sessionExpiryTime');
          setSessionExpiresAt(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Check if session has expired based on our custom expiry time
        const storedExpiryTime = localStorage.getItem('sessionExpiryTime');
        
        if (storedExpiryTime) {
          const expiryTime = new Date(storedExpiryTime);
          const currentTime = new Date();
          
          if (currentTime > expiryTime) {
            // Session has expired, sign out the user
            console.log('Session expired, signing out...');
            supabase.auth.signOut().then(() => {
              toast({
                title: 'Session expired',
                description: 'Please sign in again to continue.',
              });
              navigate('/login');
            });
            return;
          }
          
          // Session still valid, set the expiry time
          setSessionExpiresAt(expiryTime);
        } else {
          // No stored expiry time, set a new one
          const expiryTime = new Date();
          expiryTime.setSeconds(expiryTime.getSeconds() + SESSION_DURATION);
          setSessionExpiresAt(expiryTime);
          localStorage.setItem('sessionExpiryTime', expiryTime.toISOString());
        }
        
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Set up a timer to check session expiry every minute
    const intervalId = setInterval(() => {
      const storedExpiryTime = localStorage.getItem('sessionExpiryTime');
      
      if (storedExpiryTime && user) {
        const expiryTime = new Date(storedExpiryTime);
        const currentTime = new Date();
        
        if (currentTime > expiryTime) {
          console.log('Session expired during active use, signing out...');
          supabase.auth.signOut().then(() => {
            toast({
              title: 'Session expired',
              description: 'Please sign in again to continue.',
            });
            navigate('/login');
          });
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [navigate, toast]);

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

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile-${Date.now()}.${fileExt}`;
      
      // Use the utility function to upload the file
      const publicUrl = await uploadFile('avatars', filePath, file);
      
      if (!publicUrl) {
        toast({
          title: 'Upload failed',
          description: 'Could not upload profile image',
          variant: 'destructive',
        });
        return null;
      }
      
      // Update the profile with the new image URL
      await updateProfile({ profilePic: publicUrl });
      
      return publicUrl;
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

  const uploadClinicLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/clinic-logo-${Date.now()}.${fileExt}`;
      
      // Use the utility function to upload the file
      const publicUrl = await uploadFile('logos', filePath, file);
      
      if (!publicUrl) {
        toast({
          title: 'Upload failed',
          description: 'Could not upload clinic logo',
          variant: 'destructive',
        });
        return null;
      }
      
      // Update the profile with the new logo URL
      await updateProfile({ clinicLogo: publicUrl });
      
      return publicUrl;
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

      // Set session expiry time (24 hours from now)
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + SESSION_DURATION);
      setSessionExpiresAt(expiryTime);
      localStorage.setItem('sessionExpiryTime', expiryTime.toISOString());

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
      
      // Clear session expiry data
      localStorage.removeItem('sessionExpiryTime');
      setSessionExpiresAt(null);
      
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
    uploadClinicLogo,
    sessionExpiresAt
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
