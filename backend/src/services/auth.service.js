import { query } from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import crypto from 'crypto';

export const login = async (email, password) => {
  const result = await query(
    `SELECT id, email, password_hash, role, first_name, last_name, is_active
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw Object.assign(new Error('Account is deactivated'), { statusCode: 401 });
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: `${user.first_name} ${user.last_name}`
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token hash in database
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  );

  // Update last login
  await query(
    `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
    [user.id]
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`
    }
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Check if token exists and not revoked
  const result = await query(
    `SELECT rt.*, u.email, u.role, u.first_name, u.last_name, u.is_active
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token_hash = $1 AND rt.expires_at > NOW() AND rt.revoked_at IS NULL`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const { user_id, email, role, first_name, last_name, is_active } = result.rows[0];

  if (!is_active) {
    throw Object.assign(new Error('Account is deactivated'), { statusCode: 401 });
  }

  // Revoke old token
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );

  const tokenPayload = {
    sub: user_id,
    email,
    role,
    name: `${first_name} ${last_name}`
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Store new refresh token
  const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user_id, newTokenHash, expiresAt]
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );
};

export const getCurrentUser = async (userId) => {
  const result = await query(
    `SELECT id, email, role, first_name, last_name, phone, profile_image_url, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    phone: user.phone,
    profileImage: user.profile_image_url,
    createdAt: user.created_at
  };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const isValid = await comparePassword(currentPassword, result.rows[0].password_hash);
  if (!isValid) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }

  const newHash = await hashPassword(newPassword);
  await query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
    [newHash, userId]
  );

  // Revoke all refresh tokens for this user
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
};

export default {
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
  changePassword
};
