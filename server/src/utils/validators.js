import Joi from "joi";
import { UserRole } from "../generated/prisma/index.js";
import { create } from "node:domain";


// Validation Schemas using Joi
export const validationSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  createScan: Joi.object({
    patientId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid patient ID format",
      "string.empty": "Patient ID cannot be empty",
      "any.required": "Patient ID is required",
    }),
  }),

  createPatient: Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters",
      "any.required": "Full name is required",
    }),
    age: Joi.number().integer().min(1).max(150).required().messages({
      "number.min": "Age must be at least 1",
      "number.max": "Age must be less than 150",
      "any.required": "Age is required",
    }),
    gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
      "any.only": "Gender must be Male, Female, or Other",
      "any.required": "Gender is required",
    }),
    medicalHistory: Joi.string().max(5000).optional().allow('', null),
  }),

  updatePatient: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    age: Joi.number().integer().min(1).max(150).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    medicalHistory: Joi.string().max(5000).optional().allow('', null),
  }),
};