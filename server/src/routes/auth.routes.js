import express from "express";
import { register, login, logout, verify } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validate("register"), register);
router.post("/login", validate("login"), login);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/verify", authenticate, verify);

export default router;