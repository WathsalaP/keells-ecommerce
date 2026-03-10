import axios from "axios";

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_BASE_URL || "http://127.0.0.1:8001",
  headers: { "Content-Type": "application/json" },
});

export default aiApi;