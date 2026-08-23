import React, { useEffect, useState, useCallback } from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import Filters from "../components/Filters";
import { fetchCategories } from "../services/categoryService";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

const emptyFilters = { categoryId: "", startDate: "", endDate: "" };

export default function Expenses() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses(filters);
      setExpenses(data);
    } catch (err) {
      setError("Could not load expenses");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setError("Could not load categories"));
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (payload) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, payload);
      setEditingExpense(null);
    } else {
      await createExpense(payload);
    }
    loadExpenses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(id);
    loadExpenses();
  };

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h1>Expenses</h1>
          <p className="auth-sub">Total shown: ₹{total.toFixed(2)}</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="two-col" style={{ marginBottom: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <Filters
              categories={categories}
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(emptyFilters)}
            />
            {loading ? (
              <div className="empty-state">Loading expenses...</div>
            ) : (
              <ExpenseList
                expenses={expenses}
                onEdit={setEditingExpense}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        <div>
          <ExpenseForm
            categories={categories}
            onSubmit={handleSubmit}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />
        </div>
      </div>
    </div>
  );
}
