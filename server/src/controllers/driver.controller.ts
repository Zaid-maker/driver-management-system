import type { Request, Response, NextFunction } from 'express';
import { Driver, type IDriver } from '../models/driver.model.js';
import { AppError } from '../utils/AppError.js';

// Get all drivers
export const getAllDrivers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [drivers, total] = await Promise.all([
      Driver.find(query)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Driver.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: drivers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get driver by ID
export const getDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const driver = await Driver.findById(id);
    
    if (!driver) {
      throw new AppError('Driver not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Create new driver
export const createDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const driverData = req.body;
    
    // Check if email already exists
    const existingEmail = await Driver.findOne({ email: driverData.email });
    if (existingEmail) {
      throw new AppError('Email already exists', 400);
    }
    
    // Check if license number already exists
    const existingLicense = await Driver.findOne({ licenseNumber: driverData.licenseNumber });
    if (existingLicense) {
      throw new AppError('License number already exists', 400);
    }
    
    const driver = await Driver.create(driverData);
    
    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Update driver
export const updateDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if driver exists
    const existingDriver = await Driver.findById(id);
    if (!existingDriver) {
      throw new AppError('Driver not found', 404);
    }
    
    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== existingDriver.email) {
      const emailExists = await Driver.findOne({ email: updateData.email });
      if (emailExists) {
        throw new AppError('Email already exists', 400);
      }
    }
    
    // Check if license number is being changed and if it already exists
    if (updateData.licenseNumber && updateData.licenseNumber !== existingDriver.licenseNumber) {
      const licenseExists = await Driver.findOne({ licenseNumber: updateData.licenseNumber });
      if (licenseExists) {
        throw new AppError('License number already exists', 400);
      }
    }
    
    const driver = await Driver.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Delete driver
export const deleteDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const driver = await Driver.findByIdAndDelete(id);
    
    if (!driver) {
      throw new AppError('Driver not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get driver statistics
export const getDriverStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, active, inactive, pending, expiredLicenses] = await Promise.all([
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'active' }),
      Driver.countDocuments({ status: 'inactive' }),
      Driver.countDocuments({ status: 'pending' }),
      Driver.countDocuments({ licenseExpiry: { $lt: new Date() } })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        pending,
        expiredLicenses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics data for charts
export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get monthly registration data for the last 10 months
    const monthlyRegistrations = await Driver.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          drivers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
            }
          },
          drivers: 1
        }
      }
    ]);

    // Reverse to show oldest to newest
    monthlyRegistrations.reverse();

    // Get license class distribution
    const licenseClassDistribution = await Driver.aggregate([
      {
        $group: {
          _id: '$licenseClass',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          class: '$_id',
          count: 1
        }
      },
      { $sort: { class: 1 } }
    ]);

    // Get expiration timeline for next 6 months
    const today = new Date();
    const expirationTimeline = [];
    
    for (let i = 0; i < 6; i++) {
      const startDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
      
      const count = await Driver.countDocuments({
        licenseExpiry: {
          $gte: startDate,
          $lte: endDate
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[startDate.getMonth()];
      
      expirationTimeline.push({
        month: monthName,
        expiring: count
      });
    }

    res.status(200).json({
      success: true,
      data: {
        monthlyRegistrations,
        licenseClassDistribution,
        expirationTimeline
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activities
export const getRecentActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;

    // Get recently created drivers
    const recentlyCreated = await Driver.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name createdAt updatedAt status licenseExpiry');

    // Get recently updated drivers (excluding just created)
    const recentlyUpdated = await Driver.find({
      $expr: {
        $ne: [
          { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$createdAt' } },
          { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$updatedAt' } }
        ]
      }
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name createdAt updatedAt status licenseExpiry');

    // Get drivers with licenses expiring soon (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const expiringSoon = await Driver.find({
      licenseExpiry: {
        $gte: now,
        $lte: thirtyDaysFromNow
      },
      status: 'active'
    })
      .sort({ licenseExpiry: 1 })
      .limit(limit)
      .select('name createdAt updatedAt status licenseExpiry');

    // Get recently deactivated drivers
    const recentlyDeactivated = await Driver.find({ status: 'inactive' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name createdAt updatedAt status licenseExpiry');

    // Combine and format activities
    interface Activity {
      type: 'created' | 'updated' | 'expiring' | 'deactivated';
      driverName: string;
      timestamp: Date;
      status: string;
      licenseExpiry?: Date;
    }
    
    const activities: Activity[] = [];

    // Add created activities
    recentlyCreated.forEach((driver) => {
      activities.push({
        type: 'created',
        driverName: driver.name,
        timestamp: driver.createdAt,
        status: driver.status
      });
    });

    // Add updated activities
    recentlyUpdated.forEach((driver) => {
      activities.push({
        type: 'updated',
        driverName: driver.name,
        timestamp: driver.updatedAt,
        status: driver.status
      });
    });

    // Add expiring soon activities
    expiringSoon.forEach((driver) => {
      activities.push({
        type: 'expiring',
        driverName: driver.name,
        timestamp: driver.licenseExpiry,
        status: driver.status,
        licenseExpiry: driver.licenseExpiry
      });
    });

    // Add deactivated activities
    recentlyDeactivated.forEach((driver) => {
      activities.push({
        type: 'deactivated',
        driverName: driver.name,
        timestamp: driver.updatedAt,
        status: driver.status
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // Return limited number of activities
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    next(error);
  }
};
