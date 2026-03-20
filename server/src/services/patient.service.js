import { deletePatient, updatePatient } from "../controllers/patient.controller";
import db from "../libs/db.js";

export const patientService = {
    async createPatient({fullName, age, gender, medicalHistory, userId}) {
        if (!fullName || !age || !gender || !userId) {
            const error = new Error("Please provide all required fields");
            error.statusCode = 400;
            throw error;
        }

        if (age <= 0 || !Number.isInteger(age)) {
            const error = new Error("Age must be a positive integer");
            error.statusCode = 400;
            throw error;
        }

        const patient = await db.patient.create({
            data: {
                fullName,
                age,
                gender,
                medicalHistory: medicalHistory || null,
                userId,
            },
        });

        return patient;
    },

    async getPatientByUserId(userId) {
        const patients = await db.patient.findMany({
            where: {
                userId,
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

        return patients;
    },

    async getPatientById(patientId, userId){
        const patient = await db.patient.findFirst({
            where: {
                id: patientId,
                userId,
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

        if (!patient) {
            const error = new Error("Patient not found or access denied");
            error.statusCode = 404;
            throw error;
        }

        return patient;
    },

    async updatePatient(patientId, userId, data) {
        if (updateData.age && (updateData.age <= 0 || !Number.isInteger(updateData.age))) {
            const error = new Error("Age must be a positive integer");
            error.statusCode = 400;
            throw error;
        }

        const existingPatient = await db.patient.findFirst({
            where: {
                id: patientId,
                userId,
            },
        });

        if (!existingPatient) {
            const error = new Error("Patient not found or access denied");
            error.statusCode = 404;
            throw error;
        }

        // To update object dynamically and can only update provided fields
        const updateData = {}; // Empty object to store updated fields

        if (data.fullName !== undefined) dataToUpdate.fullName = updateData.fullName;
        if (data.age !== undefined) dataToUpdate.age = updateData.age;
        if (data.gender !== undefined) dataToUpdate.gender = updateData.gender;
        if (data.medicalHistory !== undefined) dataToUpdate.medicalHistory = updateData.medicalHistory;

        const updatePatient = await db.patient.update({
            where: {
                id: patientId,
            },
            data: dataToUpdate,
        });

        return updatePatient;
    },

    async deletePatient(patientId, userId) {
        const existingPatient = await db.patient.findFirst({
            where: {
                id: patientId,
                userId,
            },
        });
        
        if (!existingPatient) {
            const error = new Error("Patient not found or access denied");
            error.statusCode = 404;
            throw error;
        }

        await db.patient.delete({
            where: {
                id: patientId,
            },
        });

        return { deleted: true };
    },
};