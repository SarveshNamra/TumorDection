import db from '../lib/db.js';

export const createScan = async (req, res) => {
    try {
        const { imageUrl, patientId, cloudinaryId } = req.body;

        if (!imageUrl || !patientId) {
            return res.status(400).json({
                success: false,
                message: "Please provide imageUrl and patientId",
            });
        }

        const patient = await db.patient.findFirst({
            where: {
                id: patientId,
                userId: req.user.id,
            },
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied",
            });
        }

        const scan = await db.scan.create({
            data: {
                imageUrl,
                cloudinaryId: cloudinaryId || null,
                patientId,
                status: "PENDING",
                tumorType: null,
                confidence: null,
                heatmapUrl: null,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        age: true,
                        gender: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Scan created successfully. Processing will begin shortly.",
            data: scan,
        });
    } catch (error) {
        console.error("Error creating scan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create scan. Please try again later.",
        });
    }
};

export const getScansByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await db.patient.findFirst({
            where: {
                id: patientId,
                userId: req.user.id,
            },
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied",
            });
        }

        const scans = await db.scan.findMany({
            where: {
                patientId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                report: {
                    select: {
                        id: true,
                        pdfUrl: true,
                        createdAt: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: "Scans retrieved successfully",
            data: scans,
        });
    } catch (error) {
        console.error("Error retrieving scans:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve scans. Please try again later.",
        });
    }
};

export const getScanById = async (req, res) => {
    try {
        const { id } = req.params;

        const scan = await db.scan.findUnique({
            where: {
                id
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        age: true,  
                        gender: true,
                        userId: true,
                    },
                },
                report: true,
            },
        });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: "Scan not found",
            });
        }

        if (scan.patient.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.status(200).json({
            success: true,
            message: "Scan retrieved successfully",
            data: scan,
        });
    } catch (error) {
        console.error("Error retrieving scan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve scan. Please try again later.",
        });
    }
};

export const deleteScan = async (req, res) => {
    try {
        const { id } = req.params;

        const scan = await db.scan.findUnique({
            where: {
                id
            },
            include: {
                patient: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: "Scan not found",
            });
        }

        if (scan.patient.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        await db.scan.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Scan deleted successfully",
            data: null,
        });
    } catch (error) {
        console.error("Error deleting scan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete scan. Please try again later.",
        });
    }
};

export const updateScanMLResults = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tumorType, confidence, heatmapUrl, errorMessage } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Please provide status",
            });
        }

        const scan = await db.scan.findUnique({
            where: { id },
        });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: "Scan not found",
            });
        }

        const updatedScan = await db.scan.update({
            where: { id },
            data: {
                status,
                tumorType: tumorType || null,
                confidence: confidence || null,
                heatmapUrl: heatmapUrl || null,
                errorMessage: errorMessage || null,
            },
        });

        res.status(200).json({
            success: true,
            message: "Scan updated successfully",
            data: updatedScan,
        });
    } catch (error) {
        console.error("Error updating scan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update scan. Please try again later.",
        });
    }
};