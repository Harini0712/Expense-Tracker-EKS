import api from "./api";

export async function registerRequest(username, email, password) {
  const res = await api.post("/auth/register", { username, email, password });
  return res.data;
}

export async function loginRequest(username, password) {
  const res = await api.post("/auth/login", { username, password });
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function fetchCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data;
}
