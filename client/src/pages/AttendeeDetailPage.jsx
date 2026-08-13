import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAttendee, resolveImageSrc } from '../api.js';

export default function AttendeeDetailPage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error

  useEffect(() => {
    setStatus('loading');
    fetchAttendee(id)
      .then((data) => {
        setPerson(data);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Could not load attendee:', err);
        setStatus(err.message === 'HTTP 404' ? 'not-found' : 'error');
      });
  }, [id]);

  return (
    <div className="detail-page">
      <Link to="/" className="detail-back-link">&larr; Back to directory</Link>

      {status === 'loading' && <p className="detail-status">Loading&hellip;</p>}
      {status === 'not-found' && <p className="detail-status">That attendee couldn't be found.</p>}
      {status === 'error' && <p className="detail-status">Could not load this profile.</p>}

      {status === 'ready' && person && (
        <div className="detail-card">
          <div className="detail-photo-banner">
            <img src={resolveImageSrc(person.image)} alt={person.name} className="detail-photo" />
            <p className="detail-name">{person.name}</p>
            <span className="detail-class-badge">{person.class}</span>
          </div>

          <div className="detail-body">
            <p className="detail-profession">{person.profession}</p>
            <p className="detail-industry">{person.industry || 'Unspecified'}</p>
            {person.committee && <span className="detail-committee-badge">Committee member</span>}

            {(person.bio || person.fun_fact || person.linkedin_url || person.photos?.length > 0) && (
              <div className="detail-extra">
                {person.bio && (
                  <>
                    <p className="detail-label">Bio</p>
                    <p className="detail-text">{person.bio}</p>
                  </>
                )}

                {person.fun_fact && (
                  <>
                    <p className="detail-label">Fun fact</p>
                    <p className="detail-text">{person.fun_fact}</p>
                  </>
                )}

                {person.photos?.length > 0 && (
                  <>
                    <p className="detail-label">Photos</p>
                    <div className="detail-gallery">
                      {person.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={resolveImageSrc(photo)}
                          alt={`${person.name} photo ${i + 1}`}
                          className="detail-gallery-photo"
                        />
                      ))}
                    </div>
                  </>
                )}

                {person.linkedin_url && (
                  <a
                    href={person.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-linkedin-link"
                  >
                    Connect &rarr;
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
