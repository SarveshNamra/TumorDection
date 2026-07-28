import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Here we set the unauthorized handler function that will be called when a 401 response is received from the server
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = handler;
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status == 401 && unauthorizedHandler) {
            unauthorizedHandler();
        }

        return Promise.reject(error);
    }
);

export default api;