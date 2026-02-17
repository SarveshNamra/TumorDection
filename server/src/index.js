import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import reportRouter from "./routes/report.routes.js";
import scanRouter from "./routes/scan.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Project is running....");
})

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/scan", scanRouter);

export default app;