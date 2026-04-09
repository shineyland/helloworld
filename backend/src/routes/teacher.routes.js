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

// Student management - use listStudents from user controller
router.get('/students', userController.listStudents);

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

// Attendance
router.get('/classes/:id/attendance', attendanceController.getClassAttendance);
router.post('/classes/:id/attendance', attendanceController.recordAttendance);
router.put('/attendance/:id', attendanceController.updateAttendance);

export default router;
