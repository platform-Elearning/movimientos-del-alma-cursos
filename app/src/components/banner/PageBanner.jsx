import "./PageBanner.css";

const PageBanner = ({ overline, title, chips = [] }) => (
  <header className="page-banner">
    <svg
      className="page-banner-wave"
      viewBox="0 0 960 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="wave-1"
        d="M0 70 C 150 10, 310 120, 480 60 S 800 0, 960 52"
      />
      <path
        className="wave-2"
        d="M0 88 C 180 36, 340 128, 510 82 S 810 28, 960 72"
      />
    </svg>
    <div className="page-banner-inner">
      <div>
        {overline && <p className="page-banner-overline">{overline}</p>}
        <h1 className="page-banner-title">{title}</h1>
      </div>
      {chips.length > 0 && (
        <ul className="page-banner-chips">
          {chips.map((chip) => (
            <li
              key={chip.label}
              className={`page-banner-chip ${chip.tone ? chip.tone : ""}`}
            >
              {chip.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  </header>
);

export default PageBanner;
