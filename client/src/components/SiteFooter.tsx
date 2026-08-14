import { useState } from 'react';
import DeezerBadge from './DeezerBadge';
import LegalNotice from './LegalNotice';

/**
 * Footer strip: the Deezer logo badge (required by their guidelines whenever
 * their API is used) plus the toggle for the Legal & Attribution notice. There's
 * no router in this app, so the notice expands in place rather than living on
 * its own /legal route.
 */
export default function SiteFooter() {
  const [showLegal, setShowLegal] = useState(false);

  return (
    <footer className="site-footer">
      <div className="footer-row">
        <DeezerBadge />
        <button
          className="legal-link"
          onClick={() => setShowLegal((prev) => !prev)}
          aria-expanded={showLegal}
          aria-controls="legal-notice"
        >
          Legal &amp; Attribution
        </button>
      </div>

      {showLegal && <LegalNotice />}
    </footer>
  );
}
