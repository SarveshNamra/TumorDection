import db from '../libs/db.js';
import cloudinary from '../config/cloudinary.config.js';
import axios from 'axios';
import FormData from 'form-data';
import { create } from 'node:domain';
import { stat } from 'node:fs';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Map ML service lowercase response to Prisma uppercase enum
const TUMOR_TYPE_MAP = {
  'glioma': 'GLIOMA',
  'meningioma': 'MENINGIOMA',
  'notumor': 'NO_TUMOR',
  'pituitary': 'PITUITARY',
};

export const createScan = async (req, res) => {
    let cloudinaryResult = null;
    let createdScan = null;

    try {
        const { patientId } = req.body;
        const uploadedFile = req.file;

        // validation
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
            return res.status(404).json({
                success: false,
                message: 'Patient not found or access denied',
            });
        }

        console.log(`Validation passed for patient: ${patient.fullName}`);

        // Create initial scan record
        createdScan = await db.scan.create({
            data: {
                patientId,
                status: "IN_PROGRESS",
                tumorType: null,
                confidence: null,
                imageUrl: '',
                cloudinaryId: null,
            },
        });

        console.log(`Scan record created with ID: ${createdScan.id} and status IN_PROGRESS`);

        // Send to ML service for prediction
        let mlResult;
        try {
            console.log("Sending file to ML service...");

            const formData = new FormData();
            formData.append('file', uploadedFile.buffer, {
                filename: uploadedFile.originalname,
                contentType: uploadedFile.mimetype,
            });

            const mlResponse = await axios.post(
                `${ML_SERVICE_URL}/predict`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                    },
                    timeout: 60000,
                }
            );

            mlResult = mlResponse.data;
            console.log(`ML prediction result: ${mlResult.predictedClass} with confidence ${mlResult.confidence}`);
        }catch (mlError){
            console.error("ML prediction error: ", mlError);

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
                    scanId: createdScan.id,
                    status: "FAILED",
                    errorMessage: mlError.message || "ML prediction failed",
                },
            });
        }

        // upload to Cloudinary

        try {
            console.log("Uploading file to Cloudinary...");

            cloudinaryResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'neurogenai/scans',
                        resource_type: 'image',
                        transformation: [
                            { width: 1000, height: 1000, crop: 'limit' },
                            { quality: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                uploadStream.end(uploadedFile.buffer);
            });

            console.log(`File uploaded to Cloudinary with public ID: ${cloudinaryResult.public_id}`);
        } catch (error) {
            console.error("Cloudinary upload error: ", cloudinaryError.message);

            await db.scan.update({
                where: { id: createdScan.id },
                data: {
                    status: "FAILED",
                    errorMessage: "Image upload failed",
                    tumorType: TUMOR_TYPE_MAP[mlResult.predictedClass] || null,
                    confidence: mlResult.confidence,
                },
            });

            return res.status(500).json({
                success: false,
                message: "ML prediction succeeded but image upload failed",
                data: {
                    scanId: createdScan.id,
                    status: 'FAILED',
                    mlPrediction: mlResult,
                },
            });
        }

        // update with ML results
        const completedScan = await db.scan.update({
            where: { id: createdScan.id },
            data: {
                status: "COMPLETED",
                imageUrl: cloudinaryResult.secure_url,
                cloudinaryId: cloudinaryResult.public_id,
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

        console.log("Scan updated with ML results:", completedScan.id);

        res.status(201).json({
            success: true,
            message: "Scan created and analyzed successfully",
            data: {
                ...completedScan,
                mlPrediction: {
                    predictedClass: mlResult.predictedClass,
                    confidence: mlResult.confidence,
                    probabilities: mlResult.probabilities,
                },
            },
        });
    } catch (error) {
        console.error("Error creating scan:", error);

        // Delete from Cloudinary if uploaded
        if (cloudinaryResult?.public_id) {
            try {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id);
                console.log("Cleaned up Cloudinary image");
            } catch (cleanupError) {
                console.error("Failed to cleanup Cloudinary:", cleanupError);
            }
        }

        // Delete scan record if created
        if (createdScan?.id) {
            try {
                await db.scan.delete({ where: { id: createdScan.id } });
                console.log("Cleaned up scan record");
            } catch (cleanupError) {
                console.error("Failed to cleanup scan:", cleanupError);
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
            try {
                await cloudinary.uploader.destroy(scan.cloudinaryId);
            } catch (error) {
                console.error("Cloudinary delete error:", error);
            }
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