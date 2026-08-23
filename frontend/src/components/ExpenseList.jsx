import React from "react";

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return <div className="empty-state">No expenses found. Add your first one above.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            <td>{expense.date}</td>
            <td>
              <span className="category-pill">{expense.category}</span>
            </td>
            <td>{expense.description || "—"}</td>
            <td className="amount-cell">₹{expense.amount.toFixed(2)}</td>
            <td>
              <div className="row-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => onEdit(expense)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(expense.id)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
