import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createScan, getScansByPatientId, getScanById, deleteScan, updateScanMLResults } from "../controllers/scan.controller.js";

const scanRouter = express.Router();

scanRouter.use(authenticate);

scanRouter.post("/", createScan);
scanRouter.get("/patient/:patientId", getScansByPatientId);
scanRouter.get("/:id", getScanById);
scanRouter.delete("/:id", deleteScan);
scanRouter.put("/:id/ml-results", updateScanMLResults);

export default scanRouter;