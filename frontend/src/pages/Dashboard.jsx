import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import CategoryChart from "../components/CategoryChart";
import { fetchDashboardSummary } from "../services/dashboardService";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading dashboard...</div>;
  if (error) return <div className="container error-banner">{error}</div>;

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p className="auth-sub">Your expense overview at a glance</p>

      <div className="stat-grid">
        <StatCard label="Total expenses" value={`₹${summary.total_expenses.toFixed(2)}`} />
        <StatCard
          label="This month"
          value={`₹${summary.current_month_expenses.toFixed(2)}`}
        />
        <StatCard label="Categories used" value={summary.category_wise.length} />
        <StatCard label="Recent entries" value={summary.recent_expenses.length} />
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Recent expenses</h3>
          {summary.recent_expenses.length === 0 ? (
            <div className="empty-state">No expenses yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td>
                      <span className="category-pill">{e.category}</span>
                    </td>
                    <td className="amount-cell">₹{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Category-wise spending</h3>
          <CategoryChart data={summary.category_wise} />
        </div>
      </div>
    </div>
  );
}
