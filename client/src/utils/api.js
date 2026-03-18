import axios from "axios";

// ✅ Axios instance create
const api = axios.create({
    baseURL: "http://localhost:5000/api", // backend URL
    withCredentials: true, // 🔥 important (cookies ke liye)
    headers: {
        "Content-Type": "application/json"
    }
});

// ✅ Request Interceptor (optional)
api.interceptors.request.use(
    (config) => {
        // future me token header add kar sakte ho
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response Interceptor (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;