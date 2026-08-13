// Sponsor logos, grouped into tiers. Each tier renders as its own row, and
// rows step down in logo height from top to bottom (see .sponsor-row--*
// classes in styles.css) to create a visual hierarchy — top tier = biggest
// sponsors, bottom tier = smaller/supporting sponsors.
//
// To add a sponsor: drop { name, src } into whichever tier's `logos` array
// it belongs in, replacing a { placeholder: true } slot if one's open. Add
// more tiers or more logos per tier as needed — the layout adapts.
const SPONSOR_TIERS = [
  {
    key: 'primary',
    logos: [
      { name: 'Abundant Tax Strategies', src: 'images/sponsors/abundant.jpg' },
      { placeholder: true },
    ],
  },
  {
    key: 'secondary',
    logos: [
      { placeholder: true },
      { placeholder: true },
      { placeholder: true },
      { placeholder: true },
    ],
  },
];

export default function SponsorBar() {
  return (
    <div className="sponsor-bar">
      <p className="sponsor-label">Presented by our sponsors</p>
      <div className="sponsor-logos">
        {SPONSOR_TIERS.map((tier) => (
          <div className={`sponsor-row sponsor-row--${tier.key}`} key={tier.key}>
            {tier.logos.map((sponsor, i) =>
              sponsor.placeholder ? (
                <div className="sponsor-placeholder" key={i}>
                  Sponsor Logo
                </div>
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
        ))}
      </div>
    </div>
  );
}
