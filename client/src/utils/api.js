import axios from "axios";

// ✅ Axios instance create
const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_MAIN_URL}/api`, // backend URL
    withCredentials: true, // 🔥 important (cookies ke liye)
    headers: {
        "Content-Type": "application/json"
    }
});

console.log(import.meta.env.VITE_BACKEND_MAIN_URL);


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