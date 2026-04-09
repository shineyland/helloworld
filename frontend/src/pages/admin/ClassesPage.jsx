import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    gradeLevel: '',
    section: '',
    roomNumber: '',
    maxStudents: 30
  });
  const [error, setError] = useState('');

  // View Details state
  const [detailsClass, setDetailsClass] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignPrimary, setAssignPrimary] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Manage Students state
  const [studentsClass, setStudentsClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [rosterRefreshKey, setRosterRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/subjects')
      ]);
      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/classes', formData);
      setShowCreateModal(false);
      setFormData({ name: '', subjectId: '', gradeLevel: '', section: '', roomNumber: '', maxStudents: 30 });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create class');
    }
  };

  // --- View Details ---
  const openDetails = async (cls) => {
    setDetailsClass(null);
    setAssignTeacherId('');
    setAssignPrimary(false);
    setAssignError('');
    setAssignSuccess('');
    setDetailsLoading(true);

    try {
      const [detailRes, teachersRes] = await Promise.all([
        api.get(`/admin/classes/${cls.id}`),
        api.get('/admin/teachers')
      ]);
      setDetailsClass(detailRes.data.data);
      setTeachers(teachersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load class details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!assignTeacherId) return;
    setAssignError('');
    setAssignSuccess('');
    try {
      await api.post(`/admin/classes/${detailsClass.id}/assign-teacher`, {
        teacherId: assignTeacherId,
        isPrimary: assignPrimary
      });
      setAssignSuccess('Teacher assigned successfully');
      setAssignTeacherId('');
      setAssignPrimary(false);
      // Refresh details
      const res = await api.get(`/admin/classes/${detailsClass.id}`);
      setDetailsClass(res.data.data);
    } catch (err) {
      setAssignError(err.response?.data?.error || 'Failed to assign teacher');
    }
  };

  // --- Manage Students ---
  const loadManageStudentsData = async (cls) => {
    setStudentsLoading(true);
    try {
      const [detailRes, rosterRes, studentsRes] = await Promise.all([
        api.get(`/admin/classes/${cls.id}`),
        api.get(`/admin/classes/${cls.id}/roster`),
        api.get('/admin/students')
      ]);
      setStudentsClass(detailRes.data.data);
      setRoster(rosterRes.data.data || []);
      setAllStudents(studentsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const openManageStudents = async (cls) => {
    setStudentsClass(cls);
    setRoster([]);
    setSelectedStudentIds([]);
    setEnrollError('');
    setEnrollSuccess('');
    await loadManageStudentsData(cls);
  };

  const handleEnrollStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    setEnrollError('');
    setEnrollSuccess('');
    try {
      const res = await api.post(`/admin/classes/${studentsClass.id}/enroll-students`, {
        studentIds: selectedStudentIds
      });
      setEnrollSuccess(res.data.message || 'Students enrolled successfully');
      setSelectedStudentIds([]);
      await loadManageStudentsData(studentsClass);
      loadData();
    } catch (err) {
      setEnrollError(err.response?.data?.error || 'Failed to enroll students');
    }
  };

  const handleRemoveStudent = async (studentUserId) => {
    setEnrollError('');
    setEnrollSuccess('');
    try {
      await api.delete(`/admin/classes/${studentsClass.id}/students/${studentUserId}`);
      setEnrollSuccess('Student removed from class');
      await loadManageStudentsData(studentsClass);
      loadData();
    } catch (err) {
      setEnrollError(err.response?.data?.error || 'Failed to remove student');
    }
  };

  const toggleStudentSelect = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          Create Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No classes found. Create your first class to get started.
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">{cls.subject_name || 'No subject'}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cls.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cls.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {cls.grade_level && <p>Grade: {cls.grade_level}</p>}
                {cls.section && <p>Section: {cls.section}</p>}
                {cls.room_number && <p>Room: {cls.room_number}</p>}
                <p>Max Students: {cls.max_students}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => openDetails(cls)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => openManageStudents(cls)}
                  className="flex-1 btn btn-primary text-sm"
                >
                  Manage Students
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input" placeholder="e.g., Math 101" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="input">
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <input type="text" value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="input" placeholder="e.g., 10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input type="text" value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="input" placeholder="e.g., A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input type="text" value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="input" placeholder="e.g., 101" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input type="number" value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                    className="input" min={1} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn btn-primary">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {(detailsClass || detailsLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {detailsClass ? detailsClass.name : 'Loading...'}
              </h2>
              <button onClick={() => setDetailsClass(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : detailsClass && (
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Class Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Class Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-400">Subject</p><p className="font-medium text-gray-900">{detailsClass.subject_name || '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Grade Level</p><p className="font-medium text-gray-900">{detailsClass.grade_level || '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Section</p><p className="font-medium text-gray-900">{detailsClass.section || '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Room</p><p className="font-medium text-gray-900">{detailsClass.room_number || '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Max Students</p><p className="font-medium text-gray-900">{detailsClass.max_students}</p></div>
                    <div><p className="text-xs text-gray-400">Enrolled</p><p className="font-medium text-gray-900">{detailsClass.studentCount ?? 0}</p></div>
                    <div><p className="text-xs text-gray-400">Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${detailsClass.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {detailsClass.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Teachers */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Teachers</h3>
                  {detailsClass.teachers && detailsClass.teachers.length > 0 ? (
                    <ul className="space-y-2">
                      {detailsClass.teachers.map((t) => (
                        <li key={t.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="font-medium text-gray-900">{t.first_name} {t.last_name}</span>
                          <span className="text-gray-500 text-xs">{t.email}{t.is_primary ? ' · Primary' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No teachers assigned yet.</p>
                  )}
                </div>

                {/* Assign Teacher */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Assign Teacher</h3>
                  {assignError && <p className="text-red-600 text-sm mb-2">{assignError}</p>}
                  {assignSuccess && <p className="text-green-600 text-sm mb-2">{assignSuccess}</p>}
                  <div className="flex gap-2">
                    <select value={assignTeacherId}
                      onChange={(e) => setAssignTeacherId(e.target.value)}
                      className="input flex-1 text-sm">
                      <option value="">Select a teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                      <input type="checkbox" checked={assignPrimary}
                        onChange={(e) => setAssignPrimary(e.target.checked)} />
                      Primary
                    </label>
                    <button onClick={handleAssignTeacher} className="btn btn-primary text-sm px-3">
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Students Modal */}
      {studentsClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{studentsClass.name}</h2>
                <p className="text-sm text-gray-500">
                  {studentsClass.studentCount ?? 0} / {studentsClass.max_students} students enrolled
                </p>
              </div>
              <button onClick={() => setStudentsClass(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {studentsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6">
                {enrollError && <p className="text-red-600 text-sm">{enrollError}</p>}
                {enrollSuccess && <p className="text-green-600 text-sm">{enrollSuccess}</p>}

                {/* Enroll Students */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Enroll Students</h3>
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {allStudents.filter((s) => !roster.some((r) => r.id === s.id)).length === 0 ? (
                      <p className="text-sm text-gray-500 p-4">All students are already enrolled.</p>
                    ) : (
                      allStudents.filter((s) => !roster.some((r) => r.id === s.id)).map((s) => (
                        <label key={s.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s.id)}
                            onChange={() => toggleStudentSelect(s.id)}
                          />
                          <span className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</span>
                          <span className="text-xs text-gray-500 ml-auto">{s.student_id}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <button
                    onClick={handleEnrollStudents}
                    disabled={selectedStudentIds.length === 0}
                    className="mt-3 btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enroll Selected ({selectedStudentIds.length})
                  </button>
                </div>

                {/* Remove Students */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Enrolled Students</h3>
                  {roster.length === 0 ? (
                    <p className="text-sm text-gray-500">No students currently enrolled.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {roster.map((s) => (
                        <div key={s.id} className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</span>
                            <span className="text-xs text-gray-500 ml-2">{s.student_id}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(s.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
