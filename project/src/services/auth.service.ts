import { supabase } from '../lib/supabase';
import { ProfileData } from '../types';

const createProfile = async (data: ProfileData) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Failed to create profile:', error);
      throw new Error(
        'Failed to create user profile. Please try registering again.'
      );
    }
    return profile;
  } catch (e) {
    console.error('Error creating profile', e);
    throw e;
  }
};

const updateProfile = async (id: string, data: Partial<ProfileData>) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

const getProfile = async (id: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const authService = {
  createProfile,
  updateProfile,
  getProfile,
};
