import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, profile, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user?.id);
    setLoading(false);
    if (!error) {
      setProfile({
        id: user?.id || '',
        full_name: fullName,
        email: user?.email || '',
        role: profile?.role || 'student',
        registration_number: profile?.registration_number,
        faculty_id: profile?.faculty_id,
        department: profile?.department,
        requires_password_change: profile?.requires_password_change,
        auth_provider: profile?.auth_provider,
        created_at: profile?.created_at || '',
        updated_at: profile?.updated_at || ''
      });
      navigate('/profile');
    } else {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 