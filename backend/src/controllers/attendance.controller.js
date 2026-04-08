import { query } from '../db/index.js';

// Teacher methods
export const getClassAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;

    let sql = `
      SELECT a.*, u.first_name, u.last_name, s.student_id
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.class_id = $1
    `;
    const params = [id];

    if (date) {
      params.push(date);
      sql += ` AND a.date = $${params.length}`;
    } else if (startDate && endDate) {
      params.push(startDate, endDate);
      sql += ` AND a.date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    sql += ` ORDER BY a.date DESC, u.last_name, u.first_name`;

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const recordAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: 'Date and attendance records array are required'
      });
    }

    const teacherResult = await query(
      `SELECT id FROM teachers WHERE user_id = $1`,
      [req.user.sub]
    );

    const teacherId = teacherResult.rows[0]?.id;

    let recorded = 0;
    for (const record of records) {
      const { studentId, status, notes } = record;

      // Get student record id from user id
      const studentResult = await query(
        `SELECT id FROM students WHERE user_id = $1`,
        [studentId]
      );

      if (studentResult.rows.length > 0) {
        await query(`
          INSERT INTO attendance (class_id, student_id, date, status, notes, recorded_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (class_id, student_id, date) DO UPDATE SET
            status = $4, notes = $5, recorded_by = $6
        `, [id, studentResult.rows[0].id, date, status, notes, teacherId]);
        recorded++;
      }
    }

    res.json({
      success: true,
      message: `${recorded} attendance record(s) saved`
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const result = await query(
      `UPDATE attendance SET status = COALESCE($1, status), notes = COALESCE($2, notes)
       WHERE id = $3 RETURNING *`,
      [status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
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

// Student methods
export const getStudentAttendance = async (req, res, next) => {
  try {
    const { classId, startDate, endDate } = req.query;

    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    let sql = `
      SELECT a.*, c.name as class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = $1
    `;
    const params = [studentResult.rows[0].id];

    if (classId) {
      params.push(classId);
      sql += ` AND a.class_id = $${params.length}`;
    }

    if (startDate && endDate) {
      params.push(startDate, endDate);
      sql += ` AND a.date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    sql += ` ORDER BY a.date DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceSummary = async (req, res, next) => {
  try {
    const studentResult = await query(
      `SELECT id FROM students WHERE user_id = $1`,
      [req.user.sub]
    );

    if (studentResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const result = await query(`
      SELECT c.id as class_id, c.name as class_name,
             COUNT(*) FILTER (WHERE a.status = 'present') as present_count,
             COUNT(*) FILTER (WHERE a.status = 'absent') as absent_count,
             COUNT(*) FILTER (WHERE a.status = 'late') as late_count,
             COUNT(*) FILTER (WHERE a.status = 'excused') as excused_count,
             COUNT(*) as total_days
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      LEFT JOIN attendance a ON c.id = a.class_id AND a.student_id = cs.student_id
      WHERE cs.student_id = $1 AND cs.status = 'active'
      GROUP BY c.id, c.name
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

export default {
  getClassAttendance,
  recordAttendance,
  updateAttendance,
  getStudentAttendance,
  getAttendanceSummary
};
