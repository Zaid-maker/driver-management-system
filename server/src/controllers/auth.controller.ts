import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { Driver } from '../models/driver.model.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Login user (admin or driver)
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password').populate('driver');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register first admin (one-time setup)
// @route   POST /api/auth/register-admin
// @access  Public (but should be restricted in production)
export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, adminSecret } = req.body;

    // Validate admin secret (for security)
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-this-secret';
    if (adminSecret !== ADMIN_SECRET) {
      throw new AppError('Invalid admin secret', 403);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new AppError('Admin already exists', 400);
    }

    // Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Create admin user
    const admin = await User.create({
      email,
      password,
      role: 'admin',
      isActive: true,
    });

    // Generate token
    const token = generateToken(admin);

    // Remove password from response
    const adminResponse: any = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        token,
        user: adminResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create driver account (admin only)
// @route   POST /api/auth/create-driver-account
// @access  Private/Admin
export const createDriverAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { driverId, email, password, sendCredentials } = req.body;

    // Validate input
    if (!driverId || !email || !password) {
      throw new AppError('Please provide driver ID, email, and password', 400);
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Check if user account already exists for this driver
    const existingUser = await User.findOne({
      $or: [{ email }, { driver: driverId }],
    });

    if (existingUser) {
      throw new AppError(
        'User account already exists for this email or driver',
        400
      );
    }

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'driver',
      driver: driverId,
      isActive: true,
    });

    // Update driver with userId reference
    driver.userId = user._id as any;
    await driver.save();

    // Generate token for the driver
    const token = generateToken(user);

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    // TODO: Send credentials via email if sendCredentials is true
    if (sendCredentials) {
      // Implement email sending logic here
      console.log(`Send credentials to ${email}: ${password}`);
    }

    res.status(201).json({
      success: true,
      message: 'Driver account created successfully',
      data: {
        user: userResponse,
        driver,
        temporaryPassword: sendCredentials ? undefined : password, // Only send if not emailing
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authorized', 401);
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('driver');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    // Get user with password
    const user = await User.findById(req.user?._id).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user account (admin only)
// @route   PUT /api/auth/deactivate/:userId
// @access  Private/Admin
export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate user account (admin only)
// @route   PUT /api/auth/activate/:userId
// @access  Private/Admin
export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account activated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
