import express from "express";
import { report } from "process";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const reportRouter = express.Router();

// Only authenticated users can access this route
reportRouter.get("/my-reports", authenticate, getMyReports);

// Only Doctors can access this route
reportRouter.get("/create", authenticate, authorize(UserRole.DOCTOR), createReport);

// Both role can view
reportRouter.get("/:id", authenticate, authorize(UserRole.DOCTOR, UserRole.RADIOLOGIST), getReport);

export default reportRouter;