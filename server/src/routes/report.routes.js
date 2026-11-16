import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReport, getReportById } from "../controllers/report.controller.js";

const reportRouter = express.Router();

reportRouter.use(authenticate);

reportRouter.post("/", validate("createReport"), createReport);
reportRouter.get("/:id", getReportById);

export default reportRouter;