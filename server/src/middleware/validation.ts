import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'email' | 'date' | 'number';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

const validateField = (value: any, rule: ValidationRule): string | null => {
  // Check required
  if (rule.required && (!value || value.toString().trim() === '')) {
    return rule.message || `${rule.field} is required`;
  }

  // Skip validation if field is not required and empty
  if (!value && !rule.required) {
    return null;
  }

  // Type validation
  if (rule.type === 'email') {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(value)) {
      return `${rule.field} must be a valid email address`;
    }
  }

  if (rule.type === 'date') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${rule.field} must be a valid date`;
    }
  }

  // String length validation
  if (rule.type === 'string' && typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${rule.field} must be at least ${rule.minLength} characters long`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${rule.field} cannot exceed ${rule.maxLength} characters`;
    }
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.message || `${rule.field} format is invalid`;
  }

  return null;
};

export const validateDriver = (req: Request, res: Response, next: NextFunction): void => {
  const { body } = req;
  
  const rules: ValidationRule[] = [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'email', required: true, type: 'email' },
    { field: 'phone', required: true, type: 'string' },
    { field: 'dateOfBirth', required: true, type: 'date' },
    { field: 'licenseNumber', required: true, type: 'string' },
    { field: 'licenseExpiry', required: true, type: 'date' },
    { field: 'licenseClass', required: true, type: 'string' }
  ];

  const errors: string[] = [];

  for (const rule of rules) {
    const error = validateField(body[rule.field], rule);
    if (error) {
      errors.push(error);
    }
  }

  // Validate status enum
  if (body.status && !['active', 'inactive', 'pending'].includes(body.status)) {
    errors.push('Status must be either active, inactive, or pending');
  }

  // Validate license class enum
  if (body.licenseClass && !['Class A', 'Class B', 'Class C', 'Class D'].includes(body.licenseClass)) {
    errors.push('License class must be Class A, B, C, or D');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400);
  }

  next();
};

export const validateDriverUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { body } = req;
  
  const rules: ValidationRule[] = [
    { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 100 },
    { field: 'email', required: false, type: 'email' },
    { field: 'phone', required: false, type: 'string' },
    { field: 'dateOfBirth', required: false, type: 'date' },
    { field: 'licenseNumber', required: false, type: 'string' },
    { field: 'licenseExpiry', required: false, type: 'date' },
    { field: 'licenseClass', required: false, type: 'string' }
  ];

  const errors: string[] = [];

  for (const rule of rules) {
    if (body[rule.field] !== undefined) {
      const error = validateField(body[rule.field], rule);
      if (error) {
        errors.push(error);
      }
    }
  }

  // Validate status enum
  if (body.status && !['active', 'inactive', 'pending'].includes(body.status)) {
    errors.push('Status must be either active, inactive, or pending');
  }

  // Validate license class enum
  if (body.licenseClass && !['Class A', 'Class B', 'Class C', 'Class D'].includes(body.licenseClass)) {
    errors.push('License class must be Class A, B, C, or D');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400);
  }

  next();
};
