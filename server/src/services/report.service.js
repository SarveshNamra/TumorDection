import Joi from "joi";
import db from "../libs/db.js";
import { geminiService } from "./gemini.service.js";
import { REPORT_DISCLAIMER } from "../utils/reportDisclaimer.js";

const CLASS_LABELS = {
    glioma: "Glioma",
    meningioma: "Meningioma",
    notumor: "No Tumor",
    pituitary: "Pituitary",
};
const TUMOR_ENUM_TO_KEY = {
    GLIOMA: "glioma",
    MENINGIOMA: "meningioma",
    NO_TUMOR: "notumor",
    PITUITARY: "pituitary",
};

const geminiOutputSchema = Joi.object({
    summary: Joi.string().trim().min(1).max(4000).required(),
    interpretation: Joi.string().trim().min(1).max(4000).required(),
    clinicalConsideration: Joi.string().trim().min(1).max(4000).required(),
}).required();

const httpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const withDisclaimer = (report) => ({ ...report, disclaimer: REPORT_DISCLAIMER });

const formatProbabilities = (probabilities) => {
    if (!probabilities || typeof probabilities !== "object") return "Not available";
    return Object.entries(probabilities)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => `  - ${CLASS_LABELS[key] || key}: ${(value * 100).toFixed(1)}%`)
        .join("\n");
};

// Response was received but is unusable -> 422 (distinct from upstream 502).
const parseAndValidate = (text) => {
    const invalid = () => httpError(422, "The AI service returned an invalid report. Please try again.");

    if (!text || !text.trim()) {
        console.error("Gemini returned empty content");
        throw invalid();
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        console.error("Gemini returned non-JSON content");
        throw invalid();
    }

    const { error, value } = geminiOutputSchema.validate(parsed, { stripUnknown: true });
    if (error) {
        console.error("Gemini output failed validation:", error.details.map((d) => d.message));
        throw invalid();
    }
    return value;
};

export const reportService = {
    async createReport(scanId, userId) {
        // Ownership enforced via Scan -> Patient -> User
        const scan = await db.scan.findFirst({
            where: { id: scanId, patient: { userId } },
            include: {
                patient: { select: { age: true, gender: true, medicalHistory: true } },
                report: true,
            },
        });

        if (!scan) throw httpError(404, "Scan not found or access denied");

        // Idempotent: never call Gemini again if a report exists
        if (scan.report) {
            return { report: withDisclaimer(scan.report), created: false };
        }

        if (scan.status !== "COMPLETED") {
            throw httpError(422, "Scan must be completed before a report can be generated");
        }
        if (!scan.tumorType || scan.confidence == null) {
            throw httpError(422, "Scan has no prediction data available for report generation");
        }

        const predictedKey = TUMOR_ENUM_TO_KEY[scan.tumorType];
        console.log(`Report generation started for scan ${scan.id}`);

        const text = await geminiService.generateReportText({
            patient: scan.patient,
            scan: {
                date: scan.createdAt.toISOString().slice(0, 10),
                predictedClass: CLASS_LABELS[predictedKey] || scan.tumorType,
                confidence: `${(scan.confidence * 100).toFixed(1)}%`,
                probabilities: formatProbabilities(scan.probabilities),
            },
        });

        const content = parseAndValidate(text);

        try {
            const report = await db.report.create({
                data: {
                scanId: scan.id,
                findings: content.summary,
                impression: content.interpretation,
                recommendations: content.clinicalConsideration,
                },
            });
            console.log(`Report ${report.id} created for scan ${scan.id}`);
            return { report: withDisclaimer(report), created: true };
        } catch (err) {
            // Concurrent request won the race: unique(scanId) is the final guard
            if (err?.code === "P2002") {
                const existing = await db.report.findUnique({ where: { scanId: scan.id } });
                if (existing) return { report: withDisclaimer(existing), created: false };
            }
            throw err;
        }
    },

    async getReportById(reportId, userId) {
        const report = await db.report.findFirst({
            where: { id: reportId, scan: { patient: { userId } } },
        });
        if (!report) throw httpError(404, "Report not found or access denied");
        return withDisclaimer(report);
    },
};