const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
        });
      }

      if (!user.active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token has expired',
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
        });
      }

      throw jwtError;
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = authMiddleware;