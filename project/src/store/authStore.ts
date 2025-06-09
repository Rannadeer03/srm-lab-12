import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { ProfileData } from '../types';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
  requires_password_change?: boolean;
  auth_provider?: 'email';
  created_at: string;
  updated_at: string;
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
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  registerUser: (
    userData: RegisterData
  ) => Promise<{ success: boolean; message: string }>;
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
  isLoading: false,
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
  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // First, sign in to get the session
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        if (authError.message === 'Email not confirmed') {
          throw new Error(
            "Please check your email and click the confirmation link before signing in. If you haven't received the email, check your spam folder or try registering again."
          );
        }
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      console.log('User authenticated successfully:', authData.user.id);

      // Get the current session to ensure we have a valid token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(
          'Failed to get authentication session. Please try again.'
        );
      }

      if (!session) {
        throw new Error(
          'No active session found. Please try logging in again.'
        );
      }

      console.log('Session obtained successfully');

      // Fetch the user's profile with retry logic
      let profile = null;
      let profileError;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { data: profileData, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (fetchError) {
            console.error(
              `Profile fetch attempt ${retryCount + 1} failed:`,
              fetchError
            );
            profileError = fetchError;
            retryCount++;

            if (retryCount < maxRetries) {
              // Wait for 1 second before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            profile = profileData;
            break;
          }
        } catch (error) {
          console.error(
            `Profile fetch attempt ${retryCount + 1} failed with error:`,
            error
          );
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }
      }

      if (!profile) {
        console.error('Failed to fetch profile after retries:', profileError);

        // Try to create the profile if it doesn't exist
        try {
          const payload: ProfileData = {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || 'User',
            role: authData.user.user_metadata?.role || 'student',
            auth_provider: 'email',
            requires_password_change: false,
          };
          const newProfile = await authService.createProfile(payload);

          profile = newProfile;
        } catch (error) {
          console.error('Profile creation error:', error);
          throw new Error(
            'Failed to create user profile. Please try registering again.'
          );
        }
      }

      set({
        user: authData.user,
        profile: profile,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Email sign in error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to sign in with email',
      });
      return { success: false, error: error.message };
    }
  },
  registerUser: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      // Validate verification codes for special roles
      if (
        userData.role === 'teacher' &&
        userData.verification_code !== 'TEACHER2024'
      ) {
        throw new Error('Invalid teacher verification code');
      }
      // if (
      //   userData.role === 'admin' &&
      //   userData.verification_code !== 'ADMIN2024'
      // ) {
      //   throw new Error('Invalid admin verification code');
      // }

      console.log('Starting registration process for:', userData.email);

      const { data: existingUser, error: existingError } = await supabase.rpc(
        'check_email_exists',
        {
          input_email: userData.email,
        }
      );

      if (existingError) {
        console.error('Error checking email:', existingError.message);
        throw new Error('Failed to check email');
      }

      if (existingUser) {
        throw new Error('Email is already in use');
      }

      // Sign up the user with explicit email confirmation settings
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('Auth signup response:', data);

      if (data.user) {
        console.log(data.user);
        // Create profile
        const profileData: any = {
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          auth_provider: 'email',
          requires_password_change: false,
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

        console.log('Creating profile with data:', profileData);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        // Check if email confirmation is required
        const { data: authSettings } = await supabase.auth.getSession();
        console.log('Auth settings:', authSettings);

        // Try to sign in immediately after registration
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
          });

        if (signInError) {
          console.log('Sign in failed after registration:', signInError);
          // If sign in fails (likely due to email not confirmed), just return success
          set({
            user: data.user,
            profile: profileData,
            error: null,
          });

          return {
            success: true,
            message:
              "Registration successful! Please check your email (including spam folder) for the confirmation link. If you don't receive it within a few minutes, please try registering again.",
          };
        }

        // If sign in succeeds, set the user and profile
        set({
          user: signInData.user,
          profile: profileData,
          error: null,
        });

        return {
          success: true,
          message:
            'Registration successful! You have been automatically signed in.',
        };
      }

      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      set({ error: error.message || 'Error registering user' });
      return {
        success: false,
        message: error.message || 'Error registering user',
      };
    } finally {
      set({ isLoading: false });
    }
  },
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profile) {
          set({
            user: session.user,
            profile,
            error: null,
          });
        } else {
          set({
            user: session.user,
            profile: null,
            error: null,
          });
        }
      }
    } catch (error: any) {
      set({ error: error.message || 'Error initializing auth' });
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
