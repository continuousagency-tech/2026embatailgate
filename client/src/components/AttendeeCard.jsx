export default function AttendeeCard({ person, hidden }) {
  return (
    <div
      className="portfolio-card"
      hidden={hidden}
      data-class={person.class}
      data-profession={(person.profession || '').toLowerCase()}
      data-industry={person.industry || 'Unspecified'}
    >
      <img src={person.image} className="image" alt={person.name} />
      <div className="img-banner">{person.class}</div>
      {person.committee && <div className="img-banner-btm">COMMITTEE</div>}
      <div className="info">
        <h3 className="portfolio-card-title">{person.name}</h3>
        <p className="portfolio-card-p">{person.profession}</p>
      </div>
    </div>
  );
}
