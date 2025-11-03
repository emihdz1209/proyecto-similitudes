import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const preprocessText = async (text, options = {}) => {
  const response = await api.post("/api/preprocess", { text, options });
  return response.data;
};

export const compareLCSstr = async (text1, text2) => {
  const response = await api.post("/api/compare/lcstr", { text1, text2 });
  return response.data;
};

export const compareLCS = async (text1, text2) => {
  const response = await api.post("/api/compare/lcs", { text1, text2 });
  return response.data;
};

export const compareLCSstrChunks = async (text1, text2, chunkSize = 5000) => {
  const response = await api.post("/api/compare/lcstr-chunks", {
    text1,
    text2,
    chunkSize,
  });
  return response.data;
};

export const compareLCSChunks = async (text1, text2, chunkSize = 5000) => {
  const response = await api.post("/api/compare/lcs-chunks", {
    text1,
    text2,
    chunkSize,
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
