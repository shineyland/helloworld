 import { createContext, useContext, useState, useEffect } from 'react';

     const ThemeContext = createContext(null);

     // Available theme colors
     export const themeColors = {
       blue: {
         name: 'Blue',
         primary: '#2563eb',
         primaryHover: '#1d4ed8',
         primaryLight: '#dbeafe',
         accent: '#3b82f6',
       },
       purple: {
         name: 'Purple',
         primary: '#7c3aed',
         primaryHover: '#6d28d9',
         primaryLight: '#ede9fe',
         accent: '#8b5cf6',
       },
       green: {
         name: 'Green',
         primary: '#059669',
         primaryHover: '#047857',
         primaryLight: '#d1fae5',
         accent: '#10b981',
       },
       red: {
         name: 'Red',
         primary: '#dc2626',
         primaryHover: '#b91c1c',
         primaryLight: '#fee2e2',
         accent: '#ef4444',
       },
       orange: {
         name: 'Orange',
         primary: '#ea580c',
         primaryHover: '#c2410c',
         primaryLight: '#ffedd5',
         accent: '#f97316',
       },
       pink: {
         name: 'Pink',
         primary: '#db2777',
         primaryHover: '#be185d',
         primaryLight: '#fce7f3',
         accent: '#ec4899',
       },
       teal: {
         name: 'Teal',
         primary: '#0d9488',
         primaryHover: '#0f766e',
         primaryLight: '#ccfbf1',
         accent: '#14b8a6',
       },
       indigo: {
         name: 'Indigo',
         primary: '#4f46e5',
         primaryHover: '#4338ca',
         primaryLight: '#e0e7ff',
         accent: '#6366f1',
       },
     };

     // Avatar background colors
     export const avatarColors = {
       blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
       purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
       green: { bg: 'bg-green-100', text: 'text-green-600' },
       red: { bg: 'bg-red-100', text: 'text-red-600' },
       orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
       pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
       teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
       indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
       gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
       yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
       cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
       rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
     };

     export const ThemeProvider = ({ children }) => {
       const [theme, setTheme] = useState(() => {
         const saved = localStorage.getItem('app-theme');
         return saved || 'blue';
       });

       const [avatarColor, setAvatarColor] = useState(() => {
         const saved = localStorage.getItem('avatar-color');
         return saved || 'blue';
       });

       const [backgroundImage, setBackgroundImage] = useState(() => {
         const saved = localStorage.getItem('background-image');
         return saved || '';
       });

       useEffect(() => {
         localStorage.setItem('app-theme', theme);
         applyTheme(theme);
       }, [theme]);

       useEffect(() => {
         localStorage.setItem('avatar-color', avatarColor);
       }, [avatarColor]);

       useEffect(() => {
         localStorage.setItem('background-image', backgroundImage);
         applyBackgroundImage(backgroundImage);
       }, [backgroundImage]);

       const applyTheme = (themeName) => {
         const colors = themeColors[themeName];
         if (!colors) return;

         const root = document.documentElement;
         root.style.setProperty('--color-primary', colors.primary);
         root.style.setProperty('--color-primary-hover', colors.primaryHover);
         root.style.setProperty('--color-primary-light', colors.primaryLight);
         root.style.setProperty('--color-accent', colors.accent);
       };

       const applyBackgroundImage = (imageUrl) => {
         const root = document.documentElement;
         if (imageUrl) {
           root.style.setProperty('--background-image', `url(${imageUrl})`);
         } else {
           root.style.removeProperty('--background-image');
         }
       };

       const value = {
         theme,
         setTheme,
         themeColors: themeColors[theme],
         avatarColor,
         setAvatarColor,
         avatarColors: avatarColors[avatarColor],
         backgroundImage,
         setBackgroundImage,
       };

       return (
         <ThemeContext.Provider value={value}>
           {children}
         </ThemeContext.Provider>
       );
     };

     export const useTheme = () => {
       const context = useContext(ThemeContext);
       if (!context) {
         throw new Error('useTheme must be used within a ThemeProvider');
       }
       return context;
     };

     export default ThemeContext;

● Bash(cat /tmp/helloworld/frontend/src/App.jsx)
  ⎿  import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
     import { AuthProvider } from './context/AuthContext';
     import { ThemeProvider } from './context/ThemeContext';
     import ProtectedRoute from './components/auth/ProtectedRoute';
     import DashboardLayout from './components/layout/DashboardLayout';

     // Auth pages
     import LoginPage from './pages/auth/LoginPage';

     // Admin pages
     import AdminDashboard from './pages/admin/DashboardPage';
     import AdminUsersPage from './pages/admin/UsersPage';
     import AdminClassesPage from './pages/admin/ClassesPage';
     import AdminAnnouncementsPage from './pages/admin/AnnouncementsPage';

     // Teacher pages
     import TeacherDashboard from './pages/teacher/DashboardPage';
     import TeacherClassesPage from './pages/teacher/ClassesPage';
     import TeacherAssignmentsPage from './pages/teacher/AssignmentsPage';
     import TeacherAttendancePage from './pages/teacher/AttendancePage';

     // Student pages
     import StudentDashboard from './pages/student/DashboardPage';
     import StudentAssignmentsPage from './pages/student/AssignmentsPage';
     import StudentGradesPage from './pages/student/GradesPage';
     import StudentSchedulePage from './pages/student/SchedulePage';
     import StudentEnrollmentPage from './pages/student/EnrollmentPage';
     import StudentThemePage from './pages/student/ThemePage';

     function App() {
       return (
         <BrowserRouter>
           <AuthProvider>
             <ThemeProvider>
             <Routes>
               {/* Public routes */}
               <Route path="/login" element={<LoginPage />} />

               {/* Admin routes */}
               <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                 <Route element={<DashboardLayout />}>
                   <Route path="/admin" element={<AdminDashboard />} />
                   <Route path="/admin/users" element={<AdminUsersPage />} />
                   <Route path="/admin/classes" element={<AdminClassesPage />} />
                   <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
                 </Route>
               </Route>

               {/* Teacher routes */}
               <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                 <Route element={<DashboardLayout />}>
                   <Route path="/teacher" element={<TeacherDashboard />} />
                   <Route path="/teacher/classes" element={<TeacherClassesPage />} />
                   <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
                   <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
                 </Route>
               </Route>

               {/* Student routes */}
               <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                 <Route element={<DashboardLayout />}>
                   <Route path="/student" element={<StudentDashboard />} />
                   <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
                   <Route path="/student/grades" element={<StudentGradesPage />} />
                   <Route path="/student/schedule" element={<StudentSchedulePage />} />
                   <Route path="/student/enrollment" element={<StudentEnrollmentPage />} />
                   <Route path="/student/theme" element={<StudentThemePage />} />
                 </Route>
               </Route>

               {/* Default redirect */}
               <Route path="/" element={<Navigate to="/login" replace />} />
               <Route path="*" element={<Navigate to="/login" replace />} />
             </Routes>
             </ThemeProvider>
           </AuthProvider>
         </BrowserRouter>
       );
     }

     export default App;

                                                                                      04:15 PM claude-sonnet-4-6
● Now I have everything I need. I'll build all three features:

  1. Students page for teacher — lists all students across their classes
  2. Background/theme page for teacher — same upload feature students already have
  3. Grade submissions in the Assignments page — view & grade what students turned in

● Bash(cat > /tmp/helloworld/frontend/src/pages/teacher/StudentsPage.jsx << 'EOF'
  import { useState, useEffect } from 'react';
  import api from '../../api/axios';

  const TeacherStudentsPage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadAll();
    }, []);

    const loadAll = async () => {
      try {
        const classesRes = await api.get('/teacher/classes');
        const classList = classesRes.data.data || [];
        setClasses(classList);

        // Load rosters for all classes in parallel
        const rosterResults = await Promise.all(
          classList.map((cls) =>
            api.get(`/teacher/classes/${cls.id}/roster`).then((r) =>
              (r.data.data || []).map((s) => ({ ...s, class_name: cls.name, class_id: cls.id }))
            )
          )
        );

        // Flatten and deduplicate by student id
        const allStudents = rosterResults.flat();
        const seen = new Set();
        const unique = [];
        for (const s of allStudents) {
          const key = s.id;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push({ ...s, classes: [{ id: s.class_id, name: s.class_name }] });
          } else {
            const existing = unique.find((u) => u.id === key);
            if (existing) existing.classes.push({ id: s.class_id, name: s.class_name });
          }
        }
        setStudents(unique);
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setLoading(false);
      }
    };

    const filtered =
      selectedClass === 'all'
        ? students
        : students.filter((s) => s.classes.some((c) => c.id === selectedClass));

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value === 'all' ? 'all' : e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No students found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Student ID</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Classes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 text-sm text-gray-600">{student.student_id}</td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 px-6 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {student.classes.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100
  text-primary-800"
                            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  export default TeacherStudentsPage;
  EOF)
  ⎿  (No output)

● Bash(cat > /tmp/helloworld/frontend/src/pages/teacher/ThemePage.jsx << 'EOF'
  import { useState } from 'react';
  import { useTheme, themeColors, avatarColors } from '../../context/ThemeContext';
  import { useAuth } from '../../context/AuthContext';

  const TeacherThemePage = () => {
    const { theme, setTheme, avatarColor, setAvatarColor, backgroundImage, setBackgroundImage } = useTheme();
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [pendingTheme, setPendingTheme] = useState(theme);
    const [pendingAvatarColor, setPendingAvatarColor] = useState(avatarColor);
    const [pendingBackgroundImage, setPendingBackgroundImage] = useState(backgroundImage);

    const themeColorKeys = Object.keys(themeColors);
    const avatarColorKeys = Object.keys(avatarColors);

    const handleSave = () => {
      setTheme(pendingTheme);
      setAvatarColor(pendingAvatarColor);
      setBackgroundImage(pendingBackgroundImage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
      setPendingTheme('blue');
      setPendingAvatarColor('blue');
      setPendingBackgroundImage('');
      setTheme('blue');
      setAvatarColor('blue');
      setBackgroundImage('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPendingBackgroundImage(reader.result);
      reader.readAsDataURL(file);
    };

    return (
      <div className="space-y-8 max-w-4xl">
        {/* Theme Color */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">App Theme Color</h2>
          <p className="text-gray-600 mb-6">Choose a primary color theme for the entire application.</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {themeColorKeys.map((colorKey) => {
              const color = themeColors[colorKey];
              const isSelected = pendingTheme === colorKey;
              return (
                <button
                  key={colorKey}
                  onClick={() => setPendingTheme(colorKey)}
                  className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                    isSelected ? 'bg-gray-100 ring-2 ring-offset-2' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-110 flex items-center
  justify-center"
                    style={{ backgroundColor: color.primary }}
                  >
                    {isSelected && (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
          {pendingTheme !== theme && (
            <div className="mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Avatar Color */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Avatar Color</h2>
          <p className="text-gray-600 mb-6">Customize your profile avatar background color.</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {avatarColorKeys.map((colorKey) => {
              const colors = avatarColors[colorKey];
              const isSelected = pendingAvatarColor === colorKey;
              return (
                <button
                  key={colorKey}
                  onClick={() => setPendingAvatarColor(colorKey)}
                  className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                    isSelected ? 'bg-gray-100 ring-2 ring-offset-2 ring-gray-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${colors.bg}`}>
                    <span className={`text-xl font-bold ${colors.text}`}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                    </span>
                  </div>
                  <span className={`text-xs font-medium capitalize ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {colorKey}
                  </span>
                </button>
              );
            })}
          </div>
          {pendingAvatarColor !== avatarColor && (
            <div className="mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Background Image */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Background Image</h2>
          <p className="text-gray-600 mb-6">Upload a custom background image that appears on every page.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Device</label>
              <div className="flex gap-3 items-center">
                <label
                  className="cursor-pointer px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"
                  style={{ backgroundColor: themeColors[pendingTheme].primary }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16
  16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {pendingBackgroundImage && (
                  <button
                    onClick={() => { setPendingBackgroundImage(''); setBackgroundImage(''); }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or paste a URL</span>
              </div>
            </div>

            <input
              type="url"
              value={pendingBackgroundImage.startsWith('data:') ? '' : pendingBackgroundImage}
              onChange={(e) => setPendingBackgroundImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500
  focus:border-transparent"
            />

            {pendingBackgroundImage && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div
                  className="w-full h-48 rounded-lg bg-cover bg-center border border-gray-200 flex items-center justify-center"
                  style={{ backgroundImage: `url(${pendingBackgroundImage})` }}
                >
                  <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                    Background Preview
                  </span>
                </div>
              </div>
            )}

            {pendingBackgroundImage !== backgroundImage && (
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Reset */}
        <div className="card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Reset Theme</h3>
              <p className="text-sm text-gray-600">Reset all theme settings to default values.</p>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default TeacherThemePage;
  EOF)
