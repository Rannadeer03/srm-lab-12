// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { authService } from '../services/auth.service';
//
// interface ProfileFormData {
//   full_name: string;
//   role: 'student' | 'teacher';
//   bio: string;
//   subjects: string[];
//   qualifications?: string[]; // for teachers
//   grade_level?: string; // for students
// }
//
// export const CreateProfile: React.FC = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<ProfileFormData>({
//     full_name: '',
//     role: 'student',
//     bio: '',
//     subjects: [],
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//
//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setLoading(true);
//     setError('');
//
//     try {
//       const formData = new FormData(event.target as HTMLFormElement);
//       const profileData = {
//         name: formData.get('name'),
//         email: formData.get('email'),
//         role: formData.get('role'),
//       };
//
//       const response = await authService.createProfile(profileData);
//
//       if (response) {
//         navigate(
//           profileData.role === 'student'
//             ? '/student-dashboard'
//             : '/teacher-dashboard'
//         );
//       }
//     } catch (err) {
//       setError('Failed to create profile. Please try again.');
//       console.error('Profile creation error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
//       <div className="relative py-3 sm:max-w-xl sm:mx-auto">
//         <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
//           <div className="max-w-md mx-auto">
//             <div className="divide-y divide-gray-200">
//               <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
//                 <h2 className="text-2xl font-bold mb-8">Create Your Profile</h2>
//
//                 {error && (
//                   <div
//                     className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
//                     role="alert"
//                   >
//                     <span className="block sm:inline">{error}</span>
//                   </div>
//                 )}
//
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.full_name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, full_name: e.target.value })
//                       }
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>
//
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Role
//                     </label>
//                     <select
//                       value={formData.role}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           role: e.target.value as 'student' | 'teacher',
//                           qualifications:
//                             e.target.value === 'teacher' ? [] : undefined,
//                           grade_level:
//                             e.target.value === 'student' ? '' : undefined,
//                         })
//                       }
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     >
//                       <option value="student">Student</option>
//                       <option value="teacher">Teacher</option>
//                     </select>
//                   </div>
//
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Bio
//                     </label>
//                     <textarea
//                       value={formData.bio}
//                       onChange={(e) =>
//                         setFormData({ ...formData, bio: e.target.value })
//                       }
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       rows={3}
//                     />
//                   </div>
//
//                   {formData.role === 'teacher' && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Qualifications (comma-separated)
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.qualifications?.join(', ')}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             qualifications: e.target.value
//                               .split(',')
//                               .map((q) => q.trim()),
//                           })
//                         }
//                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                         required
//                       />
//                     </div>
//                   )}
//
//                   {formData.role === 'student' && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Grade Level
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.grade_level}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             grade_level: e.target.value,
//                           })
//                         }
//                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                         required
//                       />
//                     </div>
//                   )}
//
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Subjects (comma-separated)
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.subjects.join(', ')}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           subjects: e.target.value
//                             .split(',')
//                             .map((s) => s.trim()),
//                         })
//                       }
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>
//
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
//                       loading ? 'opacity-50 cursor-not-allowed' : ''
//                     }`}
//                   >
//                     {loading ? 'Creating Profile...' : 'Create Profile'}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default CreateProfile;
