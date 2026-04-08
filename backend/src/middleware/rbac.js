export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const isAdmin = authorize('admin');
export const isTeacher = authorize('teacher', 'admin');
export const isStudent = authorize('student', 'admin');
export const isTeacherOrStudent = authorize('teacher', 'student', 'admin');

export default authorize;
