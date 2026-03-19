import { abort } from "process";
import { validationSchemas } from "../utils/validators.js";

// To validate request body against schemas
export const validate = (schemaName) => {
    return (req, res, next) => {
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