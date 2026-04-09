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
