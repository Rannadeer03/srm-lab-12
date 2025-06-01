import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                {profile && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Role</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.role}</p>
                    </div>
                    {profile.registration_number && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{profile.registration_number}</p>
                      </div>
                    )}
                    {profile.faculty_id && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Faculty ID</h3>
                        <p className="mt-1 text-sm text-gray-900">{profile.faculty_id}</p>
                      </div>
                    )}
                    {profile.department && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                        <p className="mt-1 text-sm text-gray-900">{profile.department}</p>
                      </div>
                    )}
                  </>
                )}
                <div className="pt-4">
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 