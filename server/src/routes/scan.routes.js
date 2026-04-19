import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createScan, getScansByPatientId, getScanById, deleteScan } from "../controllers/scan.controller.js";
import { handleUploadError, uploadScanToMemory } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const scanRouter = express.Router();

scanRouter.use(authenticate);

scanRouter.post('/', uploadScanToMemory.single('file'), handleUploadError, validate('createScan'), createScan);
scanRouter.get("/patient/:patientId", getScansByPatientId);
scanRouter.get("/:id", getScanById);
scanRouter.delete("/:id", deleteScan);

export default scanRouter;