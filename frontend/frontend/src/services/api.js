import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendQuery(query) {
  const response = await api.post("/query", { query });
  return response.data;
}

export default api;