import jwt from "jsonwebtoken"
import { db } from "../libs/db.js"

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.jwt;

    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized - No token provided"
        });
    }

    let decode;

    try {
        decode = jwt.verify(token, process.env.JWT_SECRET);

        if(!decode){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token"
        });
    }

}