import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/index.js';

const documentSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  path : { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
  
}, {_id: false});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  role: {
    type: String,
    enum: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.DRIVER, USER_ROLES.STORE],
    default: USER_ROLES.USER
  },
  address: {
    type: String,
    trim: true,
    default: null
  },
  documents: {
    type: [
      {
        name: { type: String },
        reference: { type: String },
        document: { type: documentSchema }
      }
    ],
    default: []
  },

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
