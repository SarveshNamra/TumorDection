import { abort } from "process";
import { validationSchemas } from "../utils/validators.js";

// To validate request body against schemas
export const validate = (schemaName) => {
    return (req, res, next) => {
        // validate(schemaName) → factory that creates a middleware based on the schema name.
        // (req, res, next) => { ... } → actual worker that handles each request.
        
        const schema = validateSchemas[schemaName];

        if (!schema) {
            return res.status(500).json({
                success: false,
                message: "Invalid schema name",
            });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((details) => ({
                field: details.path.join("."),
                message: details.message,
            }))
            
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors,
            });
        }

        req.body = value;
        next();
    };
};

// The outer arrow function lets you configure middleware dynamically (schemaName in this case).

// The inner arrow function is the actual middleware Express will call on every request.

// Without returning (req, res, next) => {} you cannot access the request/response objects in your middleware.