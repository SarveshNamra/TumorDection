import Joi from "joi";
import { UserRole } from "../generated/prisma/index.js";


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
      "any.required": "Patient ID is required",
    }),
  }),
};