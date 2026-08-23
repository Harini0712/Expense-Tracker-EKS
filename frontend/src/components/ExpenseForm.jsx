import React, { useState, useEffect } from "react";

const emptyForm = { amount: "", category_id: "", date: "", description: "" };

export default function ExpenseForm({ categories, onSubmit, editingExpense, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount: editingExpense.amount,
        category_id: editingExpense.category_id,
        date: editingExpense.date,
        description: editingExpense.description || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.amount || !form.category_id || !form.date) {
      setError("Amount, category and date are required");
      return;
    }

    try {
      await onSubmit({
        amount: parseFloat(form.amount),
        category_id: parseInt(form.category_id, 10),
        date: form.date,
        description: form.description,
      });
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save expense");
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{editingExpense ? "Edit expense" : "Add expense"}</h3>
      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select name="category_id" value={form.category_id} onChange={handleChange}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Description (optional)</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="e.g. Groceries at Big Bazaar"
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary">
          {editingExpense ? "Save changes" : "Add expense"}
        </button>
        {editingExpense && (
          <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
