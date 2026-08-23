import api from "./api";

export async function fetchExpenses(filters = {}) {
  const params = {};
  if (filters.categoryId) params.category_id = filters.categoryId;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;

  const res = await api.get("/expenses", { params });
  return res.data.expenses;
}

export async function createExpense(payload) {
  const res = await api.post("/expenses", payload);
  return res.data.expense;
}

export async function updateExpense(id, payload) {
  const res = await api.put(`/expenses/${id}`, payload);
  return res.data.expense;
}

export async function deleteExpense(id) {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
}
