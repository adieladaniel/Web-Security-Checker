import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const scanDomain = async (domain) => {
  const response = await axios.post(`${API_BASE_URL}/scan`, { domain });
  return response.data;
};