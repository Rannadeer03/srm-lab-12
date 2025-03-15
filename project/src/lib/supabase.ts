import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" button to set up your project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: fetch.bind(globalThis)
  }
});

// Test connection function with retry logic and longer delays
export const testConnection = async (retries = 5, initialDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // First try a lightweight health check
      const { error: healthError } = await supabase.from('profiles').select('count', { head: true });
      if (!healthError) {
        console.log('Supabase connection successful');
        return true;
      }

      // If health check fails, try a full connection test
      const { error } = await supabase.from('profiles').select('count').single();
      if (!error) {
        console.log('Supabase connection successful');
        return true;
      }

      console.warn(`Connection attempt ${i + 1} failed:`, error.message);
    } catch (err) {
      console.warn(`Connection attempt ${i + 1} failed:`, err);
    }

    if (i < retries - 1) {
      // Exponential backoff: delay increases with each retry
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('Failed to connect to Supabase after multiple attempts');
  return false;
};