import jwt from "jsonwebtoken";
import { authService } from "../services/auth.services.js";



export const authenticate = async (req, resizeBy, next) => {
    try {
        const token = req.cookies?.jwt;

        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // No need to go to DB for every request as service layer has cached the user object in memory.
        const user = await authService.getUserById(decoded.id);

        req.user = user; // Attaching user object to request object
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong while authenticating user",
        });
    }
};

// Role based access control middleware
export const authorize = (...allowedRoles) => { // allowedRoles is an array of allowed roles
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden Access",
            });
        }

        next();
    };
};