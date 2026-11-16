import api from "./api.js";

export const reportService = {
    async generate(scanId) {
        const res = await api.post("/reports", { scanId });
        return {
            report: res.data.data,
            create: res.status === 201,
            message: res.data.message,
        };
    },

    async getById(reportId) {
        const res = await api.get(`/reports/${reportId}`);
        return res.data.data;
    },
};