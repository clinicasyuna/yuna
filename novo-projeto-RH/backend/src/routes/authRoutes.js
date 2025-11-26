const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { StatusCodes } = require('http-status-codes');

const { User, Employee } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty().trim(),
  body('employee_id').notEmpty().trim(),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *               - employee_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               full_name:
 *                 type: string
 *               employee_id:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, HR, MANAGER, EMPLOYEE]
 *                 default: EMPLOYEE
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { email, password, full_name, employee_id, role = 'EMPLOYEE' } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Check if employee_id already exists
    const existingEmployee = await Employee.findOne({ where: { employee_id } });
    if (existingEmployee) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Employee ID already exists',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
    });

    // Create employee profile
    await Employee.create({
      user_id: user.id,
      employee_id,
      full_name,
      hire_date: new Date(),
      position: 'Not specified',
      department: 'Not specified',
      salary: 0,
    });

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Registration failed',
    });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               totp_token:
 *                 type: string
 *                 description: TOTP token for 2FA (if enabled)
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or 2FA required
 */
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { email, password, totp_token } = req.body;

  try {
    // Find user with employee data
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Employee,
        as: 'employee',
      }],
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check 2FA if enabled
    if (user.two_factor_enabled) {
      if (!totp_token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'TOTP token required',
          requires_2fa: true,
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: totp_token,
        window: 2,
      });

      if (!verified) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid TOTP token',
        });
      }
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee ? {
          id: user.employee.id,
          employee_id: user.employee.employee_id,
          full_name: user.employee.full_name,
          position: user.employee.position,
          department: user.employee.department,
        } : null,
      },
      tokens,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Login failed',
    });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Employee,
        as: 'employee',
      }],
      attributes: { exclude: ['password'] },
    });

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authMiddleware, async (req, res) => {
  // In a full implementation, you would invalidate the token in Redis
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     tags: [Authentication]
 *     summary: Setup two-factor authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data
 */
router.post('/2fa/setup', authMiddleware, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `${process.env.TOTP_SERVICE_NAME || 'RH Plus'} (${req.user.email})`,
      issuer: process.env.TOTP_ISSUER || 'RH Plus',
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qr_code: qrCodeUrl,
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to setup 2FA',
    });
  }
});

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify and enable two-factor authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secret
 *               - token
 *             properties:
 *               secret:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid token
 */
router.post('/2fa/verify', authMiddleware, async (req, res) => {
  const { secret, token } = req.body;

  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Enable 2FA for user
    await req.user.update({
      two_factor_secret: secret,
      two_factor_enabled: true,
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to verify 2FA',
    });
  }
});

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Disable two-factor authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid password
 */
router.post('/2fa/disable', authMiddleware, async (req, res) => {
  const { password } = req.body;

  try {
    // Verify password
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Disable 2FA
    await req.user.update({
      two_factor_secret: null,
      two_factor_enabled: false,
    });

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to disable 2FA',
    });
  }
});

module.exports = router;