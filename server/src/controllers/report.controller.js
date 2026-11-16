import { reportService } from "../services/report.service.js";

// Services throw errors with .statusCode for expected failures.
// Anything else (e.g. Prisma errors) gets a generic message.
const sendError = (res, error, fallback) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error(fallback, error);
    return res.status(500).json({ success: false, message: fallback });
};

export const createReport = async (req, res) => {
    try {
        const { report, created } = await reportService.createReport(req.body.scanId, req.user.id);

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? "Report generated successfully" : "Report already exists for this scan",
            data: report,
        });
    } catch (error) {
        sendError(res, error, "Failed to generate report. Please try again later.");
    }
};

export const getReportById = async (req, res) => {
    try {
        const report = await reportService.getReportById(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: "Report retrieved successfully", data: report });
    } catch (error) {
        sendError(res, error, "Failed to retrieve report. Please try again later.");
    }
};