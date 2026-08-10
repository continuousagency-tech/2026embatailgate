import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAttendees, addAttendee, deleteAttendee } from '../api.js';
import '../adminStyles.css';

const EMPTY_FORM = {
  name: '',
  profession: '',
  industry: '',
  class: '',
  image: '',
  committee: false,
};

export default function AddAttendeePage() {
  const [attendees, setAttendees] = useState([]);
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | ready | error
  const [form, setForm] = useState(EMPTY_FORM);
  const [adminPassword, setAdminPassword] = useState('');
  const [addStatus, setAddStatus] = useState(null); // { type, message }
  const [busyId, setBusyId] = useState(null);

  function loadAttendees() {
    setLoadStatus('loading');
    return fetchAttendees()
      .then((data) => {
        setAttendees(data);
        setLoadStatus('ready');
      })
      .catch((err) => {
        console.error('Could not load attendees:', err);
        setLoadStatus('error');
      });
  }

  useEffect(() => {
    loadAttendees();
  }, []);

  const classSuggestions = useMemo(
    () => [...new Set(attendees.map((a) => a.class))].sort(),
    [attendees]
  );
  const industrySuggestions = useMemo(
    () => [...new Set(attendees.map((a) => a.industry).filter(Boolean))].sort(),
    [attendees]
  );

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAddStatus(null);

    if (!form.name.trim()) {
      setAddStatus({ type: 'error', message: 'Name is required.' });
      return;
    }
    if (!adminPassword) {
      setAddStatus({ type: 'error', message: 'Admin password is required to add an attendee.' });
      return;
    }

    try {
      const created = await addAttendee(
        {
          name: form.name.trim(),
          profession: form.profession.trim() || 'Not specified',
          industry: form.industry.trim() || 'Unspecified',
          class: form.class.trim() || 'Unspecified',
          committee: form.committee,
          image: form.image.trim() || 'images/profile.jpg',
        },
        adminPassword
      );
      setAttendees((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
      setAddStatus({ type: 'success', message: `Added "${created.name}".` });
    } catch (err) {
      setAddStatus({ type: 'error', message: err.message || 'Could not add attendee.' });
    }
  }

  async function handleDelete(id, name) {
    if (!adminPassword) {
      setAddStatus({ type: 'error', message: 'Enter the admin password before removing someone.' });
      return;
    }
    if (!window.confirm(`Remove ${name} from the roster?`)) return;

    setBusyId(id);
    try {
      await deleteAttendee(id, adminPassword);
      setAttendees((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAddStatus({ type: 'error', message: err.message || 'Could not remove attendee.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-wrap">
      <h1>Attendee Data Editor</h1>
      <p className="admin-subtitle">
        Add or remove people on the USC EMBA Tailgate roster. Changes save directly to the
        database and appear on the <Link to="/">main page</Link> immediately.
      </p>

      <div className="admin-panel">
        <h2><span className="step-label">Admin</span>Password</h2>
        <p>Required to add or remove attendees.</p>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="Admin password"
        />
      </div>

      <div className="admin-panel">
        <h2><span className="step-label">Add</span>New attendee</h2>
        <form onSubmit={handleAdd}>
          <label htmlFor="nameInput">Name *</label>
          <input
            type="text"
            id="nameInput"
            placeholder="e.g. Jane Doe"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
          />

          <label htmlFor="professionInput">Title/Company</label>
          <input
            type="text"
            id="professionInput"
            placeholder="e.g. VP of Marketing, Acme Corp"
            value={form.profession}
            onChange={(e) => updateField('profession', e.target.value)}
          />

          <label htmlFor="industryInput">Industry</label>
          <input
            type="text"
            id="industryInput"
            list="industrySuggestions"
            placeholder="e.g. Technology, Banking & Finance"
            value={form.industry}
            onChange={(e) => updateField('industry', e.target.value)}
          />
          <datalist id="industrySuggestions">
            {industrySuggestions.map((ind) => (
              <option value={ind} key={ind} />
            ))}
          </datalist>

          <label htmlFor="classInput">Class</label>
          <input
            type="text"
            id="classInput"
            list="classSuggestions"
            placeholder="e.g. LA 42"
            value={form.class}
            onChange={(e) => updateField('class', e.target.value)}
          />
          <datalist id="classSuggestions">
            {classSuggestions.map((cls) => (
              <option value={cls} key={cls} />
            ))}
          </datalist>

          <label htmlFor="imageInput">Image path</label>
          <input
            type="text"
            id="imageInput"
            placeholder="e.g. images/42/Jane_Doe.jpeg"
            value={form.image}
            onChange={(e) => updateField('image', e.target.value)}
          />
          <p className="disabled-note">
            The image file itself must already exist in <code>client/public/images/</code> in the
            repo (and be deployed) — this field just points to it. Leave blank to use the default
            placeholder photo.
          </p>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="committeeInput"
              checked={form.committee}
              onChange={(e) => updateField('committee', e.target.checked)}
            />
            <label htmlFor="committeeInput">On the committee</label>
          </div>

          <button className="btn btn-primary" type="submit">Add Attendee</button>
        </form>
        {addStatus && <div className={`status ${addStatus.type}`}>{addStatus.message}</div>}
      </div>

      <div className="admin-panel">
        <h2><span className="step-label">Roster</span>Current attendees</h2>
        <p>
          Total attendees: <span className="count-badge">{attendees.length}</span>
        </p>

        {loadStatus === 'loading' && <p className="empty-state">Loading…</p>}
        {loadStatus === 'error' && <p className="empty-state">Could not load attendees.</p>}
        {loadStatus === 'ready' && attendees.length === 0 && (
          <p className="empty-state">No attendees yet.</p>
        )}
        {loadStatus === 'ready' && attendees.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Title/Company</th>
                <th>Industry</th>
                <th>Committee</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((person) => (
                <tr key={person.id}>
                  <td>{person.name}</td>
                  <td>{person.class}</td>
                  <td>{person.profession}</td>
                  <td>{person.industry || 'Unspecified'}</td>
                  <td>{person.committee ? 'Yes' : ''}</td>
                  <td>
                    <button
                      className="remove-btn"
                      type="button"
                      disabled={busyId === person.id}
                      onClick={() => handleDelete(person.id, person.name)}
                    >
                      {busyId === person.id ? 'Removing…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p><Link to="/">&larr; Back to main page</Link></p>
    </div>
  );
}
