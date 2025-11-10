import mongoose, { type Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  licenseNumber: string;
  licenseExpiry: Date;
  licenseClass: string;
  status: 'active' | 'inactive' | 'pending';
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    zipCode: {
      type: String,
      trim: true,
      default: ''
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    licenseClass: {
      type: String,
      required: [true, 'License class is required'],
      enum: ['Class A', 'Class B', 'Class C', 'Class D'],
      default: 'Class C'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
// Note: email and licenseNumber already have unique indexes due to unique: true
driverSchema.index({ status: 1 });
driverSchema.index({ name: 'text', email: 'text', licenseNumber: 'text' });

// Virtual field to check if license is expired
driverSchema.virtual('isLicenseExpired').get(function(this: IDriver) {
  return new Date() > this.licenseExpiry;
});

// Method to get driver's age
driverSchema.methods.getAge = function(this: IDriver): number {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const Driver = mongoose.model<IDriver>('Driver', driverSchema);
