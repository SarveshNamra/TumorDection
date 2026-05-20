import express from "express";
import { createPatient, deletePatient, getPatientById, getPatients, updatePatient } from "../controllers/patient.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const patientRouter = express.Router();

// All routes protected by authentication
patientRouter.use(authenticate);

patientRouter.post("/", validate("createPatient"), createPatient);
patientRouter.get("/", getPatients);
patientRouter.get("/:id", getPatientById);
patientRouter.put("/:id",validate("updatePatient") , updatePatient);
patientRouter.delete("/:id", deletePatient);

export default patientRouter;