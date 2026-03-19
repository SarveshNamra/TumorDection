import db from "../libs/db.js";

export const createPatient = async (req, res) => {
    try {
        const { fullName, age, gender, medicalHistory } = req.body;

        if (!fullName || !age || !gender || !medicalHistory) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (age <= 0 || !Number.isInteger(age)) {
            return res.status(400).json({
                success: false,
                message: "Age must be a positive integer",
            });
        }

        const patient = await db.patient.create({
            data: {
                fullName,
                age,
                gender,
                medicalHistory: medicalHistory || null,
                userId: req.user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient,
        });
    } catch (error) {
        console.error("Error creating patient:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create patient",
        });
    }
};

export const getPatients = async (req, res) => {
    try {
        const patients = await db.patient.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        scans: true
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            data: patients,
        })
    } catch (error) {
        console.error("Error fetching patients:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve patients",
        });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const patient = await db.patient.findUnique({
            where: {
                id: id,
                userId: req.user.id,
            },
            include: {
                scans: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10,
                },
            },
        });

        if(!patient){
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied",
            });
        }

        res.status(200).json({
            success: true,
            message: "Patient retrieved successfully",
            data: patient,
        });
    } catch (error) {
        console.error("Error fetching patient:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve patient",
        });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, age, gender, medicalHistory } = req.body;

        if (age && (age <= 0 || !Number.isInteger(age))) {
            return res.status(400).json({
                success: false,
                message: "Age must be a positive integer",
            });
        }

        const existingPatient = await db.patient.findUnique({
            where: {
                id: id,
                userId: req.user.id,
            },
        });

        if (!existingPatient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied",
            });
        }

        // To update object dynamically and can only update provided fields
        const updateData = {}; // Empty object to store updated fields

        if (fullName !== undefined) updateData.fullName = fullName;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory;

        const updatedPatient = await db.patient.update({
            where: {
                id: id,
            },
            data: updateData,
        });

        res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            data: updatedPatient,
        });
    } catch (error) {
        console.error("Error updating patient:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update patient",
        }); 
    }
};

export const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPatient = await db.patient.findUnique({
            where: {
                id: id,
                userId: req.user.id,
            },
        }); 

        if (!existingPatient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied",
            });
        }

        await db.patient.delete({
            where: {
                id: id,
            },
        });

        res.status(200).json({
            success: true,
            message: "Patient deleted successfully",
            data: null,
        });
    } catch (error) {
        console.error("Error deleting patient:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete patient",
        });
    }
};