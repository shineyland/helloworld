import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.get('/teacher/classes');
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoster = async (classId) => {
    setLoadingRoster(true);
    try {
      const response = await api.get(`/teacher/classes/${classId}/roster`);
      setRoster(response.data.data || []);
    } catch (error) {
      console.error('Failed to load roster:', error);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleViewRoster = async (cls) => {
    setSelectedClass(cls);
    await loadRoster(cls.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 card">
            You have no classes assigned yet.
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">{cls.subject_name || 'No subject'}</p>
                </div>
                {cls.is_primary && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Primary
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {cls.grade_level && <p>Grade: {cls.grade_level}</p>}
                {cls.room_number && <p>Room: {cls.room_number}</p>}
                <p>Students: {cls.student_count || 0}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewRoster(cls)}
                  className="w-full btn btn-secondary text-sm"
                >
                  View Roster
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Roster Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedClass.name}</h2>
                  <p className="text-sm text-gray-500">Class Roster</p>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingRoster ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : roster.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No students enrolled in this class</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-600">{student.student_id}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassesPage;
