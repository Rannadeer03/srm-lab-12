import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
  requires_password_change?: boolean;
  auth_provider?: 'email' | 'google';
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerUser: (userData: RegisterData) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
  verification_code?: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await supabase.auth.signOut();
      set({ user: null, profile: null });
    } catch (error) {
      set({ error: 'Error signing out. Please try again.' });
      console.error('Error signing out:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message || 'Error signing in with Google' });
      console.error('Google sign in error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        set({ 
          user: data.user,
          profile,
          error: null
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Error signing in' });
      console.error('Email sign in error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  registerUser: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      // Validate verification codes for special roles
      if (userData.role === 'teacher' && userData.verification_code !== 'TEACHER2024') {
        throw new Error('Invalid teacher verification code');
      }
      if (userData.role === 'admin' && userData.verification_code !== 'ADMIN2024') {
        throw new Error('Invalid admin verification code');
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const profileData: any = {
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          auth_provider: 'email',
          requires_password_change: false
        };

        if (userData.role === 'student' && userData.registration_number) {
          profileData.registration_number = userData.registration_number;
        }
        if (userData.role === 'teacher' && userData.faculty_id) {
          profileData.faculty_id = userData.faculty_id;
        }
        if (userData.department) {
          profileData.department = userData.department;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) throw profileError;

        set({ 
          user: data.user,
          profile: profileData,
          error: null
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Error registering user' });
      console.error('Registration error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        set({ 
          user: session.user,
          profile,
          error: null
        });
      }
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      set({ 
        user: null, 
        profile: null,
        error: error.message || 'Error initializing authentication'
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));