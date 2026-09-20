import api from "./api.js";

export const patientService = {
  async getAll() {
    const res = await api.get("/patients");
    return res.data.data;
  },
  async getById(id) {
    const res = await api.get(`/patients/${id}`);
    return res.data.data;
  },
  async create(payload) {
    const res = await api.post("/patients", payload);
    return res.data;
  },
  async update(id, payload) {
    const res = await api.put(`/patients/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`/patients/${id}`);
    return res.data;
  },
};