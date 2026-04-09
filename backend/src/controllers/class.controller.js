import { query } from '../db/index.js';

export const listClasses = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT c.*, s.name as subject_name, s.code as subject_code
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { name, subjectId, gradeLevel, section, roomNumber, schedule, maxStudents } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    // Get current academic year
    const yearResult = await query(
      `SELECT id FROM academic_years WHERE is_current = true LIMIT 1`
    );
    const academicYearId = yearResult.rows[0]?.id;

    const result = await query(
      `INSERT INTO classes (name, subject_id, academic_year_id, grade_level, section, room_number, schedule, max_students)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, subjectId, academicYearId, gradeLevel, section, roomNumber, JSON.stringify(schedule), maxStudents || 30]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classResult = await query(`
      SELECT c.*, s.name as subject_name, s.code as subject_code
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE c.id = $1
    `, [id]);

    if (classResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Get teachers
    const teachersResult = await query(`
      SELECT u.id, u.first_name, u.last_name, u.email, ct.is_primary
      FROM class_teachers ct
      JOIN teachers t ON ct.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE ct.class_id = $1
    `, [id]);

    // Get student count
    const studentCount = await query(
      `SELECT COUNT(*) FROM class_students WHERE class_id = $1 AND status = 'active'`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...classResult.rows[0],
        teachers: teachersResult.rows,
        studentCount: parseInt(studentCount.rows[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, subjectId, gradeLevel, section, roomNumber, schedule, maxStudents, isActive } = req.body;

    const result = await query(
      `UPDATE classes
       SET name = COALESCE($1, name),
           subject_id = COALESCE($2, subject_id),
           grade_level = COALESCE($3, grade_level),
           section = COALESCE($4, section),
           room_number = COALESCE($5, room_number),
           schedule = COALESCE($6, schedule),
           max_students = COALESCE($7, max_students),
           is_active = COALESCE($8, is_active)
       WHERE id = $9
       RETURNING *`,
      [name, subjectId, gradeLevel, section, roomNumber, schedule ? JSON.stringify(schedule) : null, maxStudents, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE classes SET is_active = false WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const assignTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teacherId, isPrimary } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        error: 'Teacher ID is required'
      });
    }

    // Get teacher record id from user id
    const teacherResult = await query(
      `SELECT id FROM teachers WHERE user_id = $1`,
      [teacherId]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const teacherRecordId = teacherResult.rows[0].id;

    await query(
      `INSERT INTO class_teachers (class_id, teacher_id, is_primary)
       VALUES ($1, $2, $3)
       ON CONFLICT (class_id, teacher_id) DO UPDATE SET is_primary = $3`,
      [id, teacherRecordId, isPrimary || false]
    );

    res.json({
      success: true,
      message: 'Teacher assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const enrollStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        error: 'Student IDs array is required'
      });
    }

    let enrolled = 0;
    for (const studentUserId of studentIds) {
      // Get student record id
      const studentResult = await query(
        `SELECT id FROM students WHERE user_id = $1`,
        [studentUserId]
      );

      if (studentResult.rows.length > 0) {
        await query(
          `INSERT INTO class_students (class_id, student_id)
           VALUES ($1, $2)
           ON CONFLICT (class_id, student_id) DO NOTHING`,
          [id, studentResult.rows[0].id]
        );
        enrolled++;
      }
    }

    res.json({
      success: true,
      message: `${enrolled} student(s) enrolled successfully`
    });
  } catch (error) {
    next(error);
  }
};

export const removeStudent = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;

    const result = await query(
      `UPDATE class_students SET status = 'withdrawn'
       WHERE class_id = $1 AND student_id = (SELECT id FROM students WHERE user_id = $2)
       RETURNING id`,
      [id, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Student removed from class'
    });
  } catch (error) {
    next(error);
  }
};

export const listSubjects = async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM subjects ORDER BY name`);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, credits } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Name and code are required'
      });
    }

    const result = await query(
      `INSERT INTO subjects (name, code, description, credits)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, code, description, credits || 1]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Teacher-specific class methods
export const getMyClasses = async (req, res, next) => {
  try {
    const teacherResult = await query(
      `SELECT id FROM teachers WHERE user_id = $1`,
      [req.user.sub]
    );

    if (teacherResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT c.*, s.name as subject_name, ct.is_primary,
             (SELECT COUNT(*) FROM class_students WHERE class_id = c.id AND status = 'active') as student_count
      FROM classes c
      JOIN class_teachers ct ON c.id = ct.class_id
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE ct.teacher_id = $1 AND c.is_active = true
      ORDER BY c.name
    `, [teacherResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getClassDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT c.*, s.name as subject_name, s.code as subject_code
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getClassRoster = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT u.id, u.first_name, u.last_name, u.email, s.student_id, cs.enrolled_at
      FROM class_students cs
      JOIN students s ON cs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE cs.class_id = $1 AND cs.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Student: Get available classes for enrollment
export const getAvailableClasses = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id, grade_level FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;
    const studentGradeLevel = studentResult.rows[0].grade_level;

    const result = await query(`
      SELECT
        c.id,
        c.name,
        c.grade_level,
        c.section,
        c.room_number,
        c.schedule,
        c.max_students,
        c.is_advanced,
        c.enrollment_test_required,
        c.prerequisite_description,
        s.name as subject_name,
        s.code as subject_code,
        s.credits,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name,
        t.department,
        (SELECT COUNT(*) FROM class_students WHERE class_id = c.id AND status = 'active') as enrolled_count,
        (SELECT passed FROM enrollment_test_results WHERE class_id = c.id AND student_id = $1) as test_passed
      FROM classes c
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_teachers ct ON c.id = ct.class_id AND ct.is_primary = true
      LEFT JOIN teachers t ON ct.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.is_active = true
        AND c.id NOT IN (
          SELECT class_id FROM class_students
          WHERE student_id = $1 AND status = 'active'
        )
      ORDER BY
        CASE WHEN c.grade_level = $2 THEN 0 ELSE 1 END,
        c.is_advanced,
        s.name,
        c.name
    `, [studentId, studentGradeLevel]);

    // Add recommendation flag
    const classesWithRecommendation = result.rows.map(cls => ({
      ...cls,
      is_recommended: cls.grade_level === studentGradeLevel && !cls.is_advanced
    }));

    res.json({
      success: true,
      data: classesWithRecommendation,
      studentGradeLevel
    });
  } catch (error) {
    next(error);
  }
};

// Student: Get enrolled classes
export const getEnrolledClasses = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT
        c.id,
        c.name,
        c.grade_level,
        c.section,
        c.room_number,
        c.schedule,
        s.name as subject_name,
        s.code as subject_code,
        s.credits,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name,
        t.department,
        cs.enrolled_at,
        cs.status
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_teachers ct ON c.id = ct.class_id AND ct.is_primary = true
      LEFT JOIN teachers t ON ct.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE cs.student_id = $1 AND cs.status = 'active'
      ORDER BY s.name, c.name
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Student: Enroll in a class
export const enrollInClass = async (req, res, next) => {
  try {
    const { id: classId } = req.params;
    const { confirmEnrollmentTest } = req.body;

    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;

    // Check if class exists and is active
    const classResult = await query(
      `SELECT id, max_students, name, is_advanced, enrollment_test_required, prerequisite_description
       FROM classes WHERE id = $1 AND is_active = true`,
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found or not available'
      });
    }

    const classInfo = classResult.rows[0];

    // Check enrollment test requirement for advanced classes
    if (classInfo.enrollment_test_required) {
      if (!confirmEnrollmentTest) {
        return res.status(400).json({
          success: false,
          error: 'This is an advanced class that requires passing an enrollment test',
          requiresTestConfirmation: true,
          prerequisiteDescription: classInfo.prerequisite_description
        });
      }

      // Record that student confirmed passing the test
      await query(`
        INSERT INTO enrollment_test_results (class_id, student_id, passed, notes)
        VALUES ($1, $2, true, 'Student confirmed passing enrollment test')
        ON CONFLICT (class_id, student_id) DO UPDATE SET passed = true, test_date = NOW()
      `, [classId, studentId]);
    }

    // Check current enrollment count
    const enrollmentCount = await query(
      `SELECT COUNT(*) as count FROM class_students WHERE class_id = $1 AND status = 'active'`,
      [classId]
    );

    if (parseInt(enrollmentCount.rows[0].count) >= classInfo.max_students) {
      return res.status(400).json({
        success: false,
        error: 'Class is full'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await query(
      `SELECT id, status FROM class_students WHERE class_id = $1 AND student_id = $2`,
      [classId, studentId]
    );

    if (existingEnrollment.rows.length > 0) {
      if (existingEnrollment.rows[0].status === 'active') {
        return res.status(400).json({
          success: false,
          error: 'Already enrolled in this class'
        });
      }
      // Re-enroll if previously withdrawn
      await query(
        `UPDATE class_students SET status = 'active', enrolled_at = NOW() WHERE class_id = $1 AND student_id = $2`,
        [classId, studentId]
      );
    } else {
      // Create new enrollment
      await query(
        `INSERT INTO class_students (class_id, student_id, status) VALUES ($1, $2, 'active')`,
        [classId, studentId]
      );
    }

    res.status(201).json({
      success: true,
      message: `Successfully enrolled in ${classInfo.name}`
    });
  } catch (error) {
    next(error);
  }
};

// Student: Update profile (grade level, date of birth)
export const updateStudentProfile = async (req, res, next) => {
  try {
    const { gradeLevel, dateOfBirth } = req.body;

    const result = await query(
      `UPDATE students
       SET grade_level = COALESCE($1, grade_level),
           date_of_birth = COALESCE($2, date_of_birth)
       WHERE user_id = $3
       RETURNING *`,
      [gradeLevel, dateOfBirth, req.user.sub]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Student: Withdraw from a class
export const withdrawFromClass = async (req, res, next) => {
  try {
    const { id: classId } = req.params;

    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const result = await query(
      `UPDATE class_students
       SET status = 'withdrawn'
       WHERE class_id = $1 AND student_id = $2 AND status = 'active'
       RETURNING *`,
      [classId, studentResult.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Successfully withdrawn from class'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listClasses,
  createClass,
  getClass,
  updateClass,
  deleteClass,
  assignTeacher,
  enrollStudents,
  removeStudent,
  listSubjects,
  createSubject,
  getMyClasses,
  getClassDetails,
  getClassRoster,
  getAvailableClasses,
  getEnrolledClasses,
  enrollInClass,
  withdrawFromClass,
  updateStudentProfile
};
