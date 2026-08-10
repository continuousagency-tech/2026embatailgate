// Sponsor logos: replace/add entries below once you have real logo files
// in client/public/images/sponsors/. Use { placeholder: true } slots for
// sponsors you don't have a logo for yet.
const SPONSORS = [
  { name: 'Abundant Tax Strategies', src: 'images/sponsors/abundant.jpg' },
  { placeholder: true },
  { placeholder: true },
  { placeholder: true },
];

export default function SponsorBar() {
  return (
    <div className="sponsor-bar">
      <p className="sponsor-label">Presented by our sponsors</p>
      <div className="sponsor-logos">
        {SPONSORS.map((sponsor, i) =>
          sponsor.placeholder ? (
            <div className="sponsor-placeholder" key={i}>Sponsor Logo</div>
          ) : (
            <img
              key={sponsor.name}
              src={sponsor.src}
              alt={sponsor.name}
              className="sponsor-logo"
            />
          )
        )}
      </div>
    </div>
  );
}
