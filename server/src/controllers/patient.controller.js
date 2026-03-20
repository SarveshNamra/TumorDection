import { patientService } from "../services/patient.service.js";

export const createPatient = async (req, res) => {
    try {
        const { fullName, age, gender, medicalHistory } = req.body;

        const patient = await patientService.createPatient({
            fullName,
            age,
            gender,
            medicalHistory,
            userId: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to create patient",
        });
    }
};

export const getPatients = async (req, res) => {
    try {
        const patients = await patientService.getPatientByUserId(req.user.id);

        res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            data: patients,
        })
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to retrieve patients",
        });
    }
};

export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await patientService.getPatientById(id, req.user.id);

        res.status(200).json({
            success: true,
            message: "Patient retrieved successfully",
            data: patient,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to retrieve patient",
        });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, age, gender, medicalHistory } = req.body;

        const updatedPatient = await patientService.updatePatient(
            id,
            req.user.id,
            { fullName, age, gender, medicalHistory }
        );

        res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            data: updatedPatient,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to update patient",
        }); 
    }
};

export const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        await patientService.deletePatient(id, req.user.id);

        res.status(200).json({
            success: true,
            message: "Patient deleted successfully",
            data: null,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to delete patient",
        });
    }
};