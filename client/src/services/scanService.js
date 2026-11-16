import api from "./api";

export const scanService = {
    async createScan(patientId, file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("patientId", patientId);

        const res = await api.post("/scans", formData, {
            headers: {
                "Content-Type": undefined, // Let the browser set the correct Content-Type for FormData
            },
        });

        return res.data;
    },

    async getByPatientId(patientId) {
        const res = await api.get(`/scans/patient/${patientId}`);
        return res.data.data;
    },

    async getById(scanId) {
        const res = await api.get(`/scans/${scanId}`);
        return res.data.data;
    },
};