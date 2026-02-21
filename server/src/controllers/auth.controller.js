import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../libs/db.js";
import { userRole } from "../generated/prisma/index.js";

export const register = async(req, res) => {
    const {email, password, name} = req.body;

    if(!email || !password || !name) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields",
        });
    }

    try {
        const existingUser = await db.user.findUnique({
            where: {
                email,
            },
        });

        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists...!",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: userRole
            }
        });

        const token = jwt.sign(
            {id: newUser.id}, 
            process.env.JWT_SECRET, 
            {expiresIn: "7d"}
        );

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: precess.env.NODE_ENV !== "development",
            maxAge: 5 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating user",
        });
    }
};

export const login = async(req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return req.status(400).json({
            success: false,
            message: "Please enter all fields"
        });
    }

    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        });

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials! Try again"
            });
        }

        const token = jwt.sign(
            {id: user.id}, 
            process.env.JWT_SECRET, 
            {expiresIn: "7d"}
        );

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: precess.env.NODE_ENV !== "development",
            maxAge: 5 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while logging in",
        });
    }
};

export const logout = async(req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: precess.env.NODE_ENV !== "development",
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error in Logout user"
        });
    }
};

export const verify = async(req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: req.user
        });
    } catch (error) {
        console.error("Error in check user", error);
        res.status(500).json({
            success: false,
            error: "Error in check user"
        });
    }
};