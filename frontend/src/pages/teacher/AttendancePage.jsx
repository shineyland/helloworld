import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherAttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadRosterAndAttendance();
    }
  }, [selectedClass, date]);

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

  const loadRosterAndAttendance = async () => {
    try {
      const [rosterRes, attendanceRes] = await Promise.all([
        api.get(`/teacher/classes/${selectedClass.id}/roster`),
        api.get(`/teacher/classes/${selectedClass.id}/attendance`, { params: { date } })
      ]);

      const students = rosterRes.data.data || [];
      setRoster(students);

      // Map existing attendance records
      const attendanceMap = {};
      (attendanceRes.data.data || []).forEach((record) => {
        const student = students.find(s => s.student_id === record.student_id);
        if (student) {
          attendanceMap[student.id] = record.status;
        }
      });

      // Set default attendance (present) for students without records
      students.forEach((student) => {
        if (!attendanceMap[student.id]) {
          attendanceMap[student.id] = 'present';
        }
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      await api.post(`/teacher/classes/${selectedClass.id}/attendance`, {
        date,
        records
      });

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
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
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const cls = classes.find(c => c.id === e.target.value);
                setSelectedClass(cls);
              }}
              className="input"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {selectedClass && roster.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              Attendance for {selectedClass.name} - {new Date(date).toLocaleDateString()}
            </h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Excused</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roster.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 text-sm font-medium">
                          {student.first_name?.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{student.student_id}</p>
                      </div>
                    </div>
                  </td>
                  {['present', 'absent', 'late', 'excused'].map((status) => (
                    <td key={status} className="px-6 py-4 text-center">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === status}
                        onChange={() => handleAttendanceChange(student.id, status)}
                        className={`h-4 w-4 ${
                          status === 'present' ? 'text-green-600 focus:ring-green-500' :
                          status === 'absent' ? 'text-red-600 focus:ring-red-500' :
                          status === 'late' ? 'text-yellow-600 focus:ring-yellow-500' :
                          'text-blue-600 focus:ring-blue-500'
                        } border-gray-300`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClass && roster.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          No students enrolled in this class
        </div>
      )}
    </div>
  );
};

export default TeacherAttendancePage;
