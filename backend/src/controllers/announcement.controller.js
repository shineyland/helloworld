import { query } from '../db/index.js';

// Admin methods
export const listAnnouncements = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, targetAudience, expiresAt } = req.body;

    if (!title || !content || !targetAudience) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and target audience are required'
      });
    }

    const result = await query(
      `INSERT INTO announcements (author_id, title, content, priority, target_audience, published_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)
       RETURNING *`,
      [req.user.sub, title, content, priority || 'normal', targetAudience, expiresAt]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, priority, targetAudience, isPublished, expiresAt } = req.body;

    const result = await query(
      `UPDATE announcements
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           priority = COALESCE($3, priority),
           target_audience = COALESCE($4, target_audience),
           is_published = COALESCE($5, is_published),
           expires_at = COALESCE($6, expires_at),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, content, priority, targetAudience, isPublished, expiresAt, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
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

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM announcements WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Student methods
export const getStudentAnnouncements = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             ar.read_at
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = $1
      WHERE a.is_published = true
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
        AND ('all' = ANY(a.target_audience) OR 'students' = ANY(a.target_audience))
      ORDER BY a.published_at DESC
    `, [req.user.sub]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      `INSERT INTO announcement_reads (announcement_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (announcement_id, user_id) DO NOTHING`,
      [id, req.user.sub]
    );

    res.json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getStudentAnnouncements,
  markAsRead
};
