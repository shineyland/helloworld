import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { isStudent } from '../middleware/rbac.js';
import * as assignmentController from '../controllers/assignment.controller.js';
import * as gradeController from '../controllers/grade.controller.js';
import * as attendanceController from '../controllers/attendance.controller.js';
import * as announcementController from '../controllers/announcement.controller.js';
import * as classController from '../controllers/class.controller.js';

const router = Router();

// All student routes require authentication and student role
router.use(authenticate, isStudent);

// Dashboard
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Student dashboard - coming soon' });
});

// Classes & Schedule
router.get('/classes', assignmentController.getStudentClasses);
router.get('/schedule', assignmentController.getStudentSchedule);

// Class Enrollment
router.get('/classes/available', classController.getAvailableClasses);
router.get('/classes/enrolled', classController.getEnrolledClasses);
router.post('/classes/:id/enroll', classController.enrollInClass);
router.delete('/classes/:id/withdraw', classController.withdrawFromClass);

// Profile
router.put('/profile', classController.updateStudentProfile);

// Assignments
router.get('/assignments', assignmentController.listStudentAssignments);
router.get('/assignments/pending', assignmentController.getPendingAssignments);
router.get('/assignments/completed', assignmentController.getCompletedAssignments);
router.get('/assignments/overdue', assignmentController.getOverdueAssignments);
router.get('/assignments/:id', assignmentController.getAssignmentForStudent);
router.post('/assignments/:id/submit', assignmentController.submitAssignment);
router.put('/submissions/:id', assignmentController.updateSubmission);

// Grades
router.get('/grades', gradeController.getStudentGrades);
router.get('/grades/summary', gradeController.getGradeSummary);
router.get('/grades/:id', gradeController.getGradeDetails);

// Attendance
router.get('/attendance', attendanceController.getStudentAttendance);
router.get('/attendance/summary', attendanceController.getAttendanceSummary);

// Announcements
router.get('/announcements', announcementController.getStudentAnnouncements);
router.post('/announcements/:id/read', announcementController.markAsRead);

export default router;
