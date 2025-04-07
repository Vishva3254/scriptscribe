
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
  qualification?: string;
  registrationNumber?: string;
  profilePic?: string;
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Defer profile fetching to avoid Supabase deadlock
        if (newSession?.user) {
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const userProfile: UserProfile = {
          name: data.name,
          email: data.email,
          clinicName: data.clinicname,
          address: data.address,
          phone: data.phone || undefined,
          qualification: data.qualification || undefined,
          registrationNumber: data.registrationnumber || undefined,
          profilePic: data.profilepic || undefined,
          prescriptionStyle: data.prescriptionstyle as UserProfile['prescriptionStyle'] || undefined
        };
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Omit<UserProfile, 'email'>
  ) => {
    try {
      setIsLoading(true);
      
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
        return;
      }

      if (data.user) {
        // Insert the user profile data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name: userData.name,
            clinicname: userData.clinicName,
            address: userData.address,
            phone: userData.phone || null,
            qualification: userData.qualification || null,
            registrationnumber: userData.registrationNumber || null,
          });

        if (profileError) {
          toast({
            title: 'Profile creation failed',
            description: profileError.message,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Account created',
          description: 'Your account has been created successfully',
        });
        
        navigate('/');
      }
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
      
      // Convert the UserProfile updates to match the database column names
      const dbUpdates: Partial<ProfileRow> = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.clinicName) dbUpdates.clinicname = updates.clinicName;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.qualification !== undefined) dbUpdates.qualification = updates.qualification;
      if (updates.registrationNumber !== undefined) dbUpdates.registrationnumber = updates.registrationNumber;
      if (updates.profilePic !== undefined) dbUpdates.profilepic = updates.profilePic;
      if (updates.prescriptionStyle !== undefined) dbUpdates.prescriptionstyle = updates.prescriptionStyle;
      
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
        return;
      }

      // Refresh the profile data
      fetchProfile(user.id);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
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

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile
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
