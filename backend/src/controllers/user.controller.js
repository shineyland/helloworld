  import { query } from '../db/index.js';
  import { hashPassword } from '../utils/password.js';

  export const listUsers = async (req, res, next) => {
    try {
      const { role, search, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT id, email, role, first_name, last_name, phone, is_active, created_at
        FROM users WHERE 1=1
      `;
      const params = [];

      if (role) {
        params.push(role);
        sql += ` AND role = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE
  $${params.length})`;
      }

      const countResult = await query(
        `SELECT COUNT(*) FROM (${sql}) AS count_query`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  export const createUser = async (req, res, next) => {
    try {
      const { email, password, role, firstName, lastName, phone } = req.body;

      if (!email || !password || !role || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, role, firstName, and lastName are required'
        });
      }

      if (!['admin', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      const passwordHash = await hashPassword(password);

      const result = await query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, role, first_name, last_name, created_at`,
        [email.toLowerCase(), passwordHash, role, firstName, lastName, phone]
      );

      const user = result.rows[0];

      if (role === 'teacher') {
        const employeeId = `TCH${Date.now().toString().slice(-6)}`;
        await query(
          `INSERT INTO teachers (user_id, employee_id) VALUES ($1, $2)`,
          [user.id, employeeId]
        );
      } else if (role === 'student') {
        const studentId = `STU${Date.now().toString().slice(-6)}`;
        await query(
          `INSERT INTO students (user_id, student_id) VALUES ($1, $2)`,
          [user.id, studentId]
        );
      } else if (role === 'admin') {
        await query(
          `INSERT INTO administrators (user_id) VALUES ($1)`,
          [user.id]
        );
      }

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      next(error);
    }
  };

  export const getUser = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT id, email, role, first_name, last_name, phone, is_active, created_at
         FROM users WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  };

  export const updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, isActive } = req.body;

      const result = await query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             is_active = COALESCE($4, is_active),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, email, role, first_name, last_name, phone, is_active`,
        [firstName, lastName, phone, isActive, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  };

  export const deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await query(
        `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  };

  export const listTeachers = async (req, res, next) => {
    try {
      const result = await query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
               t.employee_id, t.department, t.specialization
        FROM users u
        JOIN teachers t ON u.id = t.user_id
        WHERE u.role = 'teacher'
        ORDER BY u.last_name, u.first_name
      `);

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  };

  export const getTeacher = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
               t.employee_id, t.department, t.specialization, t.qualifications
        FROM users u
        JOIN teachers t ON u.id = t.user_id
        WHERE u.id = $1 AND u.role = 'teacher'
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Teacher not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  };

  export const listStudents = async (req, res, next) => {
    try {
      const result = await query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
               s.student_id, s.enrollment_date, s.graduation_year
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.role = 'student'
        ORDER BY u.last_name, u.first_name
      `);

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  };

  export const getStudent = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
               s.student_id, s.date_of_birth, s.enrollment_date, s.graduation_year,
               s.parent_name, s.parent_email, s.parent_phone, s.address
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.id = $1 AND u.role = 'student'
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  };

  export const getStudentForTeacher = async (req, res, next) => {
    try {
      const { id } = req.params;

      const teacherResult = await query(
        `SELECT id FROM teachers WHERE user_id = $1`,
        [req.user.sub]
      );

      if (teacherResult.rows.length === 0) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }

      const teacherId = teacherResult.rows[0].id;

      // Only allow access if student is in one of this teacher's classes
      const accessCheck = await query(`
        SELECT 1
        FROM class_students cs
        JOIN class_teachers ct ON cs.class_id = ct.class_id
        JOIN students s ON cs.student_id = s.id
        WHERE ct.teacher_id = $1 AND s.user_id = $2 AND cs.status = 'active'
        LIMIT 1
      `, [teacherId, id]);

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ success: false, error: 'Student not in your classes' });
      }

      const result = await query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
               s.student_id, s.date_of_birth, s.enrollment_date, s.graduation_year,
               s.parent_name, s.parent_email, s.parent_phone, s.address
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.id = $1 AND u.role = 'student'
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  };

  export default {
    listUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    listTeachers,
    getTeacher,
    listStudents,
    getStudent,
    getStudentForTeacher
  };

  ---
  File 2 — backend/src/routes/teacher.routes.js

  import { Router } from 'express';
  import { authenticate } from '../middleware/auth.js';
  import { isTeacher } from '../middleware/rbac.js';
  import * as assignmentController from '../controllers/assignment.controller.js';
  import * as attendanceController from '../controllers/attendance.controller.js';
  import * as classController from '../controllers/class.controller.js';
  import * as userController from '../controllers/user.controller.js';

  const router = Router();

  // All teacher routes require authentication and teacher role
  router.use(authenticate, isTeacher);

  // Dashboard
  router.get('/dashboard', (req, res) => {
    res.json({ success: true, message: 'Teacher dashboard - coming soon' });
  });

  // My Classes
  router.get('/classes', classController.getMyClasses);
  router.get('/classes/:id', classController.getClassDetails);
  router.get('/classes/:id/roster', classController.getClassRoster);

  // Assignments
  router.get('/assignments', assignmentController.listTeacherAssignments);
  router.post('/assignments', assignmentController.createAssignment);
  router.get('/assignments/:id', assignmentController.getAssignment);
  router.put('/assignments/:id', assignmentController.updateAssignment);
  router.delete('/assignments/:id', assignmentController.deleteAssignment);
  router.post('/assignments/:id/publish', assignmentController.publishAssignment);

  // Submissions & Grading
  router.get('/assignments/:id/submissions', assignmentController.getSubmissions);
  router.get('/submissions/:id', assignmentController.getSubmission);
  router.post('/submissions/:id/grade', assignmentController.gradeSubmission);

  // Students (only students in teacher's classes)
  router.get('/students/:id', userController.getStudentForTeacher);

  // Attendance
  router.get('/classes/:id/attendance', attendanceController.getClassAttendance);
  router.post('/classes/:id/attendance', attendanceController.recordAttendance);
  router.put('/attendance/:id', attendanceController.updateAttendance);

  export default router;

  ---
  File 3 — frontend/src/pages/teacher/ClassesPage.jsx

  import { useState, useEffect } from 'react';
  import api from '../../api/axios';

  const TeacherClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [roster, setRoster] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingStudent, setLoadingStudent] = useState(false);

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
      setSelectedStudent(null);
      await loadRoster(cls.id);
    };

    const handleViewStudent = async (student) => {
      setLoadingStudent(true);
      try {
        const response = await api.get(`/teacher/students/${student.id}`);
        setSelectedStudent(response.data.data);
      } catch (error) {
        console.error('Failed to load student details:', error);
      } finally {
        setLoadingStudent(false);
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString();
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100
  text-primary-800">
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
                    <p className="text-sm text-gray-500">Class Roster — click a student to view details</p>
                  </div>
                  <button
                    onClick={() => { setSelectedClass(null); setSelectedStudent(null); }}
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
                        <tr
                          key={student.id}
                          className="border-b border-gray-100 hover:bg-primary-50 cursor-pointer transition-colors"
                          onClick={() => handleViewStudent(student)}
                        >
                          <td className="py-3 px-4 text-sm text-gray-600">{student.student_id}</td>
                          <td className="py-3 px-4 text-sm font-medium text-primary-700 underline">
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

        {/* Student Detail Modal */}
        {(selectedStudent || loadingStudent) && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60" style={{ zIndex: 60
  }}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Loading...'}
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {loadingStudent ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : selectedStudent ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Student
  Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Student ID</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.student_id || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.email || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Date of Birth</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedStudent.date_of_birth)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Enrollment Date</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedStudent.enrollment_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Graduation Year</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.graduation_year || '—'}</p>
                        </div>
                      </div>
                      {selectedStudent.address && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-400">Address</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.address}</p>
                        </div>
                      )}
                    </div>

                    {/* Parent/Guardian Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Parent /
  Guardian</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">Name</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.parent_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.parent_email || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedStudent.parent_phone || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default TeacherClassesPage;
