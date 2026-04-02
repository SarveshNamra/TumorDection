import db from '../libs/db.js';
import { cloudinaryService } from '../services/cloudinary.services.js';
import { mlService } from '../services/ml.service.js';
import fs from 'fs';

// Map ML service lowercase response to Prisma uppercase enum
const TUMOR_TYPE_MAP = {
  'glioma': 'GLIOMA',
  'meningioma': 'MENINGIOMA',
  'notumor': 'NO_TUMOR',
  'pituitary': 'PITUITARY',
};

export const createScan = async (req, res) => {
    let uploadedFile = null;
    let cloudinaryResult = null;
    let createdScan = null;

    try {
        const { patientId } = req.body;
        uploadedFile = req.file;

        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image file",
            });
        }

        if (!patient) {
                return res.status(400).json({
                success: false,
                message: "Please provide patientId",
            });
        }

        const patient = await db.patient.findFirst({
            where: {
                id: patientId,
                userId: req.user.id,
            },
        });

        if (!patient) {
            deleteLocalFile(uploadedFile.path);
            return res.status(404).json({
                success: false,
                message: 'Patient not found or access denied',
            });
        }

        try {
            cloudinaryResult = await cloudinaryService.uploadImage(uploadedFile.path);
        } catch (cloudinaryError) {
            console.error("Cloudinary upload error:", cloudinaryError);
            deleteLocalFile(uploadedFile.path);
            return res.status(500).json({
                success: false,
                message: "Failed to upload image to cloud storage",
            });
        }

        createdScan = await db.scan.create({
            data: {
                imageUrl: cloudinaryResult.url,
                cloudinaryId: cloudinaryResult.publicId,
                patientId,
                status: "IN_PROGRESS",
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

        let mlResult;
        try {
            mlResult = await mlService.predictTumor(uploadedFile.path);

            deleteLocalFile(uploadedFile.path);
        }catch (mlError){
            console.error("ML prediction error: ", mlError);

            deleteLocalFile(uploadedFile.path);

            await db.scan.update({
                where: { id: createdScan.id },
                data: {
                    status: "FAILED",
                    errorMessage: mlError.message || "ML prediction failed",
                },
            });

            return res.status(200).json({
                success: false,
                message: "Scan uploaded but ML analysis failed",
                data: {
                    ...createdScan,
                    status: "FAILED",
                    errorMessage: mlError.message,
                },
            });
        }

        const updatedScan = await db.scan.update({
            where: { id: createdScan.id },
            data: {
                status: "COMPLETED",
                tumorType: TUMOR_TYPE_MAP[mlResult.predictedClass] || null,
                confidence: mlResult.confidence,
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
            message: "Scan created and analyzed successfully",
            data: {
                ...updatedScan,
                mlPrediction: {
                    predictedClass: mlResult.predictedClass,
                    confidence: mlResult.confidence,
                    probabilities: mlResult.probabilities,
                },
            },
        });
    } catch (error) {
        console.error("Error creating scan:", error);

        // Delete local file if still exists
        if (uploadedFile?.path) {
            deleteLocalFile(uploadedFile.path);
        }

        // Delete from Cloudinary if uploaded
        if (cloudinaryResult?.publicId) {
            await cloudinaryService.deleteImage(cloudinaryResult.publicId);
        }

        // Delete scan record if created
        if (createdScan?.id) {
            try {
                await db.scan.delete({ where: { id: createdScan.id } });
            } catch (dbError) {
                console.error('Failed to rollback scan:', dbError);
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to create scan. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

        // Delete from Cloudinary
        if (scan.cloudinaryId) {
            await cloudinaryService.deleteImage(scan.cloudinaryId);
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
                tumorType: tumorType ? TUMOR_TYPE_MAP[tumorType] || tumorType : null,
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