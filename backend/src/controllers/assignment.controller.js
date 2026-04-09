import { query } from '../db/index.js';

// Teacher methods
export const listTeacherAssignments = async (req, res, next) => {
  try {
    const teacherResult = await query(
      `SELECT id FROM teachers WHERE user_id = $1`,
      [req.user.sub]
    );

    if (teacherResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT a.*, c.name as class_name,
             (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE a.teacher_id = $1
      ORDER BY a.due_date DESC
    `, [teacherResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { classId, title, description, instructions, dueDate, maxPoints, assignmentType, allowLateSubmission } = req.body;

    if (!classId || !title || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Class ID, title, and due date are required'
      });
    }

    const teacherResult = await query(
      `SELECT id FROM teachers WHERE user_id = $1`,
      [req.user.sub]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Teacher profile not found'
      });
    }

    const result = await query(
      `INSERT INTO assignments (class_id, teacher_id, title, description, instructions, due_date, max_points, assignment_type, allow_late_submission)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [classId, teacherResult.rows[0].id, title, description, instructions, dueDate, maxPoints || 100, assignmentType || 'homework', allowLateSubmission || false]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT a.*, c.name as class_name
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
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

export const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, instructions, dueDate, maxPoints, assignmentType, allowLateSubmission } = req.body;

    const result = await query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           instructions = COALESCE($3, instructions),
           due_date = COALESCE($4, due_date),
           max_points = COALESCE($5, max_points),
           assignment_type = COALESCE($6, assignment_type),
           allow_late_submission = COALESCE($7, allow_late_submission),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, instructions, dueDate, maxPoints, assignmentType, allowLateSubmission, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
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

export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM assignments WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const publishAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE assignments SET is_published = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
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

export const getSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT s.*, u.first_name, u.last_name, st.student_id,
             g.points_earned, g.feedback, g.graded_at
      FROM assignment_submissions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      LEFT JOIN grades g ON s.id = g.submission_id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at DESC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT s.*, u.first_name, u.last_name, st.student_id,
             a.title as assignment_title, a.max_points,
             g.points_earned, g.percentage, g.letter_grade, g.feedback, g.graded_at
      FROM assignment_submissions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN grades g ON s.id = g.submission_id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
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

export const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pointsEarned, feedback } = req.body;

    if (pointsEarned === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Points earned is required'
      });
    }

    const teacherResult = await query(
      `SELECT id FROM teachers WHERE user_id = $1`,
      [req.user.sub]
    );

    // Get assignment max points
    const submissionResult = await query(`
      SELECT s.*, a.max_points
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.id = $1
    `, [id]);

    if (submissionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const maxPoints = submissionResult.rows[0].max_points;
    const percentage = (pointsEarned / maxPoints) * 100;

    let letterGrade = 'F';
    if (percentage >= 90) letterGrade = 'A';
    else if (percentage >= 80) letterGrade = 'B';
    else if (percentage >= 70) letterGrade = 'C';
    else if (percentage >= 60) letterGrade = 'D';

    // Upsert grade
    const result = await query(`
      INSERT INTO grades (submission_id, teacher_id, points_earned, percentage, letter_grade, feedback)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (submission_id) DO UPDATE SET
        points_earned = $3, percentage = $4, letter_grade = $5, feedback = $6, updated_at = NOW()
      RETURNING *
    `, [id, teacherResult.rows[0].id, pointsEarned, percentage, letterGrade, feedback]);

    // Update submission status
    await query(
      `UPDATE assignment_submissions SET status = 'graded' WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Student methods
export const getStudentClasses = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT c.*, s.name as subject_name,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN class_teachers ct ON c.id = ct.class_id AND ct.is_primary = true
      LEFT JOIN teachers t ON ct.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE cs.student_id = $1 AND cs.status = 'active'
      ORDER BY c.name
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentSchedule = async (req, res, next) => {
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
        c.room_number,
        c.schedule,
        c.period_number,
        c.start_time,
        c.end_time,
        c.grade_level,
        c.is_advanced,
        s.name as subject_name,
        s.code as subject_code,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE cs.student_id = $1 AND cs.status = 'active' AND c.is_active = true
      ORDER BY c.period_number, c.name
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const listStudentAssignments = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT a.*, c.name as class_name,
             sub.id as submission_id, sub.status as submission_status, sub.submitted_at,
             g.points_earned, g.percentage, g.letter_grade
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN class_students cs ON c.id = cs.class_id
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
      LEFT JOIN grades g ON sub.id = g.submission_id
      WHERE cs.student_id = $1 AND cs.status = 'active' AND a.is_published = true
      ORDER BY a.due_date DESC
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingAssignments = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT a.*, c.name as class_name
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN class_students cs ON c.id = cs.class_id
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
      WHERE cs.student_id = $1 AND cs.status = 'active'
        AND a.is_published = true
        AND sub.id IS NULL
        AND a.due_date >= NOW()
      ORDER BY a.due_date ASC
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getCompletedAssignments = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT a.*, c.name as class_name,
             sub.submitted_at, g.points_earned, g.percentage, g.letter_grade, g.feedback
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN assignment_submissions sub ON a.id = sub.assignment_id
      LEFT JOIN grades g ON sub.id = g.submission_id
      WHERE sub.student_id = $1
      ORDER BY sub.submitted_at DESC
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueAssignments = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT a.*, c.name as class_name
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN class_students cs ON c.id = cs.class_id
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
      WHERE cs.student_id = $1 AND cs.status = 'active'
        AND a.is_published = true
        AND sub.id IS NULL
        AND a.due_date < NOW()
      ORDER BY a.due_date DESC
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentForStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    const result = await query(`
      SELECT a.*, c.name as class_name,
             sub.id as submission_id, sub.submission_text, sub.file_urls, sub.submitted_at, sub.status as submission_status,
             g.points_earned, g.percentage, g.letter_grade, g.feedback
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
      LEFT JOIN grades g ON sub.id = g.submission_id
      WHERE a.id = $2
    `, [studentResult.rows[0]?.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
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

export const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { submissionText, fileUrls } = req.body;

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

    // Check if assignment exists and due date
    const assignmentResult = await query(
      `SELECT due_date, allow_late_submission FROM assignments WHERE id = $1`,
      [id]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const assignment = assignmentResult.rows[0];
    const isLate = new Date() > new Date(assignment.due_date);

    if (isLate && !assignment.allow_late_submission) {
      return res.status(400).json({
        success: false,
        error: 'Late submissions are not allowed for this assignment'
      });
    }

    const result = await query(`
      INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, file_urls, is_late)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (assignment_id, student_id) DO UPDATE SET
        submission_text = $3, file_urls = $4, submitted_at = NOW(), is_late = $5, status = 'submitted'
      RETURNING *
    `, [id, studentResult.rows[0].id, submissionText, fileUrls, isLate]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { submissionText, fileUrls } = req.body;

    const result = await query(`
      UPDATE assignment_submissions
      SET submission_text = COALESCE($1, submission_text),
          file_urls = COALESCE($2, file_urls),
          submitted_at = NOW()
      WHERE id = $3 AND status != 'graded'
      RETURNING *
    `, [submissionText, fileUrls, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found or already graded'
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

export default {
  listTeacherAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  getStudentClasses,
  getStudentSchedule,
  listStudentAssignments,
  getPendingAssignments,
  getCompletedAssignments,
  getOverdueAssignments,
  getAssignmentForStudent,
  submitAssignment,
  updateSubmission
};
