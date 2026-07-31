import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT (if present) to every outgoing request.
// Token is read fresh on each request rather than baked in at client
// creation, since it can change (login/logout) during the session.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("futurenest_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralize "session expired" handling: if any request comes back 401,
// the token is stale/invalid — clear it so the UI can fall back to logged-out state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("futurenest_token");
      localStorage.removeItem("futurenest_user");
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Something went wrong";
  }
  return "Something went wrong";
};

// Uploads a single image file to the backend (which forwards it to
// Cloudinary) and returns its hosted URL. Used by any form with an image
// field — property photos, blog covers, plan QR codes, payment screenshots.
export const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return { url: res.data.url, publicId: res.data.publicId };
};
