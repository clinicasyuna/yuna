const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const { Employee, User } = require('../models');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation middleware
const validateEmployee = [
  body('full_name').notEmpty().trim(),
  body('cpf').isLength({ min: 11, max: 11 }).isNumeric(),
  body('birth_date').isISO8601().toDate(),
  body('hire_date').isISO8601().toDate(),
  body('position').notEmpty().trim(),
  body('department').notEmpty().trim(),
  body('salary').isDecimal({ decimal_digits: '0,2' }),
];

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Employees]
 *     summary: Get all employees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, VACATION, MEDICAL_LEAVE, TERMINATED]
 *     responses:
 *       200:
 *         description: List of employees
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', roleMiddleware('ADMIN', 'HR', 'MANAGER'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      status,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { employee_id: { [Op.iLike]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    // If user is a manager, only show their department
    if (req.user.role === 'MANAGER') {
      const managerEmployee = await Employee.findOne({
        where: { user_id: req.user.id }
      });
      
      if (managerEmployee) {
        where.department = managerEmployee.department;
      }
    }

    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'active', 'last_login'],
      }],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_count: count,
          per_page: parseInt(limit),
        },
      },
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve employees',
    });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Employee details
 *       404:
 *         description: Employee not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'active', 'last_login'],
        },
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'employee_id', 'full_name', 'position'],
        },
      ],
    });

    if (!employee) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if user can access this employee
    if (req.user.role === 'EMPLOYEE' && employee.user_id !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'MANAGER') {
      const managerEmployee = await Employee.findOne({
        where: { user_id: req.user.id }
      });
      
      if (managerEmployee && employee.department !== managerEmployee.department) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.json({
      success: true,
      employee,
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve employee',
    });
  }
});

/**
 * @swagger
 * /employees:
 *   post:
 *     tags: [Employees]
 *     summary: Create new employee
 *     security:
 *       - bearerAuth: []
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
 *               - cpf
 *               - birth_date
 *               - hire_date
 *               - position
 *               - department
 *               - salary
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
 *               cpf:
 *                 type: string
 *                 minLength: 11
 *                 maxLength: 11
 *               rg:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               marital_status:
 *                 type: string
 *                 enum: [SINGLE, MARRIED, DIVORCED, WIDOWED, OTHER]
 *               phone:
 *                 type: string
 *               hire_date:
 *                 type: string
 *                 format: date
 *               position:
 *                 type: string
 *               department:
 *                 type: string
 *               manager_id:
 *                 type: string
 *                 format: uuid
 *               salary:
 *                 type: number
 *               salary_type:
 *                 type: string
 *                 enum: [HOURLY, MONTHLY, ANNUAL]
 *               role:
 *                 type: string
 *                 enum: [ADMIN, HR, MANAGER, EMPLOYEE]
 *                 default: EMPLOYEE
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Employee already exists
 */
router.post('/', roleMiddleware('ADMIN', 'HR'), validateEmployee, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const {
      email,
      password,
      role = 'EMPLOYEE',
      ...employeeData
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Check if employee_id already exists
    const existingEmployee = await Employee.findOne({
      where: { employee_id: employeeData.employee_id }
    });
    if (existingEmployee) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Employee ID already exists',
      });
    }

    // Check if CPF already exists
    const existingCpf = await Employee.findOne({
      where: { cpf: employeeData.cpf }
    });
    if (existingCpf) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'CPF already exists',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
    });

    // Create employee
    const employee = await Employee.create({
      ...employeeData,
      user_id: user.id,
    });

    // Fetch complete employee data
    const completeEmployee = await Employee.findByPk(employee.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'active'],
      }],
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Employee created successfully',
      employee: completeEmployee,
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create employee',
    });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Update employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 */
router.put('/:id', roleMiddleware('ADMIN', 'HR'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Update employee
    await employee.update(updateData);

    // Fetch updated employee data
    const updatedEmployee = await Employee.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'active'],
      }],
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update employee',
    });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
router.delete('/:id', roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
      }],
    });

    if (!employee) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Delete user and employee (cascade)
    await employee.user.destroy();

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete employee',
    });
  }
});

/**
 * @swagger
 * /employees/stats/overview:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee statistics
 */
router.get('/stats/overview', roleMiddleware('ADMIN', 'HR'), async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'ACTIVE' } });
    const inactiveEmployees = await Employee.count({ where: { status: 'INACTIVE' } });
    const onVacation = await Employee.count({ where: { status: 'VACATION' } });
    const onMedicalLeave = await Employee.count({ where: { status: 'MEDICAL_LEAVE' } });
    
    // Department breakdown
    const departmentStats = await Employee.findAll({
      attributes: [
        'department',
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: ['department'],
      raw: true,
    });

    res.json({
      success: true,
      stats: {
        total_employees: totalEmployees,
        active_employees: activeEmployees,
        inactive_employees: inactiveEmployees,
        on_vacation: onVacation,
        on_medical_leave: onMedicalLeave,
        department_breakdown: departmentStats,
      },
    });

  } catch (error) {
    console.error('Employee stats error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve employee statistics',
    });
  }
});

module.exports = router;