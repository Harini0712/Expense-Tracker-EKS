import React from "react";

export default function Filters({ categories, filters, onChange, onClear }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filters-row">
      <div className="form-group">
        <label>Category</label>
        <select name="categoryId" value={filters.categoryId} onChange={handleChange}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>From</label>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>To</label>
        <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
      </div>

      <button type="button" className="btn btn-secondary" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}
