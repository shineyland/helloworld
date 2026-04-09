import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';
import * as userController from '../controllers/user.controller.js';
import * as classController from '../controllers/class.controller.js';
import * as announcementController from '../controllers/announcement.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// User Management
router.get('/users', userController.listUsers);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Teachers
router.get('/teachers', userController.listTeachers);
router.get('/teachers/:id', userController.getTeacher);

// Students
router.get('/students', userController.listStudents);
router.get('/students/:id', userController.getStudent);

// Class Management
router.get('/classes', classController.listClasses);
router.post('/classes', classController.createClass);
router.get('/classes/:id', classController.getClass);
router.put('/classes/:id', classController.updateClass);
router.delete('/classes/:id', classController.deleteClass);
router.post('/classes/:id/assign-teacher', classController.assignTeacher);
router.get('/classes/:id/roster', classController.getClassRoster);
router.post('/classes/:id/enroll-students', classController.enrollStudents);
router.delete('/classes/:id/students/:studentId', classController.removeStudent);

// Subjects
router.get('/subjects', classController.listSubjects);
router.post('/subjects', classController.createSubject);

// Announcements
router.get('/announcements', announcementController.listAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);

export default router;
