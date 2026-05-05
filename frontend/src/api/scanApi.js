import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const scanDomain = async (domain) => {
  const response = await axios.post(`${API_BASE_URL}/scan`, { domain });
  return response.data;
};