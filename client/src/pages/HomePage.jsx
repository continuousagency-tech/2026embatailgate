import { useEffect, useMemo, useState } from 'react';
import SponsorBar from '../components/SponsorBar.jsx';
import HeaderBanner from '../components/HeaderBanner.jsx';
import FilterBar from '../components/FilterBar.jsx';
import AttendeeCard from '../components/AttendeeCard.jsx';
import { fetchAttendees } from '../api.js';
import { compareClasses } from '../classSort.js';

const DEFAULT_FILTERS = {
  classFilter: '',
  professionFilter: '',
  industryFilter: '',
  sortOrder: 'asc',
};

export default function HomePage() {
  const [attendees, setAttendees] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    fetchAttendees()
      .then((data) => {
        setAttendees(data);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Could not load attendees:', err);
        setStatus('error');
      });
  }, []);

  const sortedAttendees = useMemo(() => {
    if (!filters.sortOrder) return attendees;
    const sorted = [...attendees].sort((a, b) => compareClasses(a.class, b.class));
    return filters.sortOrder === 'desc' ? sorted.reverse() : sorted;
  }, [attendees, filters.sortOrder]);

  const visibleAttendees = useMemo(() => {
    const professionQuery = filters.professionFilter.trim().toLowerCase();
    return sortedAttendees.map((person) => {
      const matchesClass = !filters.classFilter || person.class === filters.classFilter;
      const matchesProfession =
        !professionQuery || (person.profession || '').toLowerCase().includes(professionQuery);
      const matchesIndustry =
        !filters.industryFilter || (person.industry || 'Unspecified') === filters.industryFilter;
      return { person, hidden: !(matchesClass && matchesProfession && matchesIndustry) };
    });
  }, [sortedAttendees, filters]);

  const visibleCount = visibleAttendees.filter((v) => !v.hidden).length;

  return (
    <div className="portfolio">
      <SponsorBar />
      <HeaderBanner />

      {status === 'ready' && (
        <FilterBar attendees={attendees} filters={filters} setFilters={setFilters} />
      )}

      <div className="filter-results-count">
        {status === 'ready' && `Showing ${visibleCount} of ${attendees.length} attendees`}
        {status === 'error' &&
          'Could not load attendee data. Check that the server and database are running.'}
      </div>

      <div id="cardsContainer">
        {visibleAttendees.map(({ person, hidden }) => (
          <AttendeeCard person={person} hidden={hidden} key={person.id} />
        ))}
        {status === 'ready' && visibleCount === 0 && (
          <div className="no-results">No attendees match the selected filters.</div>
        )}
      </div>
    </div>
  );
}
