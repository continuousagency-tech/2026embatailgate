import { useMemo } from 'react';
import { compareClasses } from '../classSort';

export default function FilterBar({ attendees, filters, setFilters }) {
  const classOptions = useMemo(() => {
    const unique = [...new Set(attendees.map((a) => a.class))];
    return unique.sort(compareClasses);
  }, [attendees]);

  const industryOptions = useMemo(() => {
    const unique = [...new Set(attendees.map((a) => a.industry || 'Unspecified'))];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [attendees]);

  function update(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function reset() {
    setFilters({ classFilter: '', professionFilter: '', industryFilter: '', sortOrder: 'asc' });
  }

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="classFilter">Filter by Class</label>
        <select
          id="classFilter"
          value={filters.classFilter}
          onChange={(e) => update('classFilter', e.target.value)}
        >
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option value={cls} key={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="professionFilter">Filter by Profession</label>
        <input
          type="text"
          id="professionFilter"
          placeholder="e.g. Finance, Engineering, VP..."
          value={filters.professionFilter}
          onChange={(e) => update('professionFilter', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="industryFilter">Filter by Industry</label>
        <select
          id="industryFilter"
          value={filters.industryFilter}
          onChange={(e) => update('industryFilter', e.target.value)}
        >
          <option value="">All Industries</option>
          {industryOptions.map((ind) => (
            <option value={ind} key={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sortOrder">Sort by Class</label>
        <select
          id="sortOrder"
          value={filters.sortOrder}
          onChange={(e) => update('sortOrder', e.target.value)}
        >
          <option value="asc">Class: Ascending</option>
          <option value="desc">Class: Descending</option>
          <option value="">Original Order</option>
        </select>
      </div>

      <button className="filter-reset" type="button" onClick={reset}>
        Reset Filters
      </button>
    </div>
  );
}
