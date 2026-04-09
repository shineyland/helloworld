import * as authService from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.login(email, password);

    // Block suspended / inactive users
    if (
      result?.user &&
      (
        result.user.isActive === false ||
        result.user.status === 'suspended'
      )
    ) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact your teacher.'
      });
    }

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    // Optional extra safety check
    if (
      result?.user &&
      (
        result.user.isActive === false ||
        result.user.status === 'suspended'
      )
    ) {
      res.clearCookie('refreshToken');
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact your teacher.'
      });
    }

    // Set new refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logout(refreshToken);

    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.sub);

    // Optional extra safety check
    if (user && (user.isActive === false || user.status === 'suspended')) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact your teacher.'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }

    await authService.changePassword(req.user.sub, currentPassword, newPassword);

    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  refresh,
  logout,
  me,
  changePassword
};
