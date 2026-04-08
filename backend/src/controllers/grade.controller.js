import { query } from '../db/index.js';

export const getStudentGrades = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT g.*, a.title as assignment_title, a.max_points, a.assignment_type,
             c.name as class_name, s.name as subject_name
      FROM grades g
      JOIN assignment_submissions sub ON g.submission_id = sub.id
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE sub.student_id = $1
      ORDER BY g.graded_at DESC
    `, [studentResult.rows[0].id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getGradeSummary = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT c.id as class_id, c.name as class_name, s.name as subject_name,
             COUNT(g.id) as graded_count,
             AVG(g.percentage) as average_percentage,
             SUM(g.points_earned) as total_points,
             SUM(a.max_points) as total_max_points
      FROM classes c
      JOIN class_students cs ON c.id = cs.class_id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN assignments a ON c.id = a.class_id AND a.is_published = true
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = cs.student_id
      LEFT JOIN grades g ON sub.id = g.submission_id
      WHERE cs.student_id = $1 AND cs.status = 'active'
      GROUP BY c.id, c.name, s.name
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

export const getGradeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT g.*, a.title as assignment_title, a.description, a.max_points, a.assignment_type,
             c.name as class_name, sub.submission_text, sub.submitted_at
      FROM grades g
      JOIN assignment_submissions sub ON g.submission_id = sub.id
      JOIN assignments a ON sub.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      WHERE g.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found'
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
  getStudentGrades,
  getGradeSummary,
  getGradeDetails
};
