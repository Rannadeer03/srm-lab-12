
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Settings, 
  BarChart3, 
  Shield,
  FileText,
  Database,
  Activity
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  department?: string;
  registration_number?: string;
  faculty_id?: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeTests: 0
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        department: 'Computer Science',
        registration_number: 'CS2021001',
        created_at: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'teacher',
        department: 'Computer Science',
        faculty_id: 'FAC001',
        created_at: '2024-01-10',
        status: 'active'
      }
    ];

    setUsers(mockUsers);
    setStats({
      totalUsers: mockUsers.length,
      totalStudents: mockUsers.filter(u => u.role === 'student').length,
      totalTeachers: mockUsers.filter(u => u.role === 'teacher').length,
      activeTests: 5
    });
  }, []);

  const handleUserStatusToggle = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, monitor system performance, and oversee platform activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon={<UserCheck className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Teachers"
            value={stats.totalTeachers}
            icon={<Shield className="h-6 w-6 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Active Tests"
            value={stats.activeTests}
            icon={<Activity className="h-6 w-6 text-white" />}
            color="bg-orange-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Department</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'teacher' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-sm">{user.department}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className={`p-1 rounded ${
                              user.status === 'active' 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border">
                <BarChart3 className="h-5 w-5 text-gray-600 mr-3" />
                <span>View Analytics</span>
              </button>
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border">
                <FileText className="h-5 w-5 text-gray-600 mr-3" />
                <span>Generate Reports</span>
              </button>
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border">
                <Database className="h-5 w-5 text-gray-600 mr-3" />
                <span>Backup Data</span>
              </button>
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border">
                <Settings className="h-5 w-5 text-gray-600 mr-3" />
                <span>System Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
