import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#2FB8A6", "#1F2A44", "#E8A33D", "#D64545", "#7C6FE0", "#4C9BE8", "#67B26F", "#B98BD9"];

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">No expenses yet to chart.</div>;
  }

  const chartData = data.map((d) => ({ name: d.category, value: d.total }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
