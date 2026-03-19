import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import patientRouter from "./routes/patient.routes.js";
import reportRouter from "./routes/report.routes.js";
import scanRouter from "./routes/scan.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
  res.send("NeuroGenAI API is running...");
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/scan", scanRouter);

// Global error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;