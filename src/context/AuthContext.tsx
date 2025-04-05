
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  clinicName: string;
  address: string;
  imageUrl?: string;
  prescriptionSettings?: {
    headerColor: string;
    footerText: string;
    logo?: string;
  };
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Omit<UserProfile, 'id'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check active session and fetch user profile
    const getUser = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch profile from profiles table
        const { data } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setUser({
            id: session.user.id,
            name: data.name,
            email: data.email,
            clinicName: data.clinic_name,
            address: data.address,
            imageUrl: data.image_url,
            prescriptionSettings: data.prescription_settings,
          });
        }
      }
      
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        } else if (session && event === 'SIGNED_IN') {
          // Fetch the user profile when they sign in
          const { data } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (data) {
            setUser({
              id: session.user.id,
              name: data.name,
              email: data.email,
              clinicName: data.clinic_name,
              address: data.address,
              imageUrl: data.image_url,
              prescriptionSettings: data.prescription_settings,
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (
    email: string, 
    password: string, 
    userData: Omit<UserProfile, 'id'>
  ) => {
    try {
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Store additional user data in profiles table
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: userData.name,
            clinic_name: userData.clinicName,
            address: userData.address,
            image_url: userData.imageUrl || null,
            prescription_settings: userData.prescriptionSettings || {
              headerColor: '#4F46E5',
              footerText: `© ${new Date().getFullYear()} ${userData.clinicName}`
            }
          });

        if (profileError) {
          console.error('Error creating profile', profileError);
          throw profileError;
        }

        toast({
          title: "Account created",
          description: "Welcome to ScriptScribe! Please verify your email."
        });

        // For demo purposes, immediately log the user in
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // On successful sign in, navigate to home
      toast({
        title: "Login successful",
        description: "Welcome back to ScriptScribe"
      });
      navigate('/');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully logged out."
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Format data for the database schema
      const formattedUpdates: any = {};
      
      if ('name' in updates) formattedUpdates.name = updates.name;
      if ('email' in updates) formattedUpdates.email = updates.email;
      if ('clinicName' in updates) formattedUpdates.clinic_name = updates.clinicName;
      if ('address' in updates) formattedUpdates.address = updates.address;
      if ('imageUrl' in updates) formattedUpdates.image_url = updates.imageUrl;
      if ('prescriptionSettings' in updates) formattedUpdates.prescription_settings = updates.prescriptionSettings;
      
      const { error } = await supabase
        .from('doctor_profiles')
        .update(formattedUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({ ...user, ...updates });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
