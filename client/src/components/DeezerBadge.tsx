import { useState } from 'react';

/**
 * Deezer's developer guidelines require a VISIBLE Deezer logo in any app that
 * uses their API — a text credit alone doesn't satisfy them.
 *
 * ⚠ The real logo file is NOT in this repo yet, and must not be redrawn by hand:
 * the guidelines only permit their own unmodified brand asset. Download the
 * official SVG from https://developers.deezer.com/guidelines/logo and save it as
 *
 *     client/public/brand/deezer-logo.svg
 *
 * (see client/public/brand/README.md). Until that file exists the badge falls
 * back to a plain wordmark, which keeps the layout intact but does NOT meet the
 * guideline — so treat the fallback as a bug, not a finished state.
 */
const DEEZER_LOGO_SRC = '/brand/deezer-logo.svg';

export default function DeezerBadge() {
  const [logoMissing, setLogoMissing] = useState(false);

  return (
    <a
      className="deezer-badge"
      href="https://www.deezer.com/"
      target="_blank"
      rel="noreferrer"
      title="Music search powered by Deezer"
    >
      <span className="deezer-badge__label">music search powered by</span>
      {logoMissing ? (
        <span className="deezer-badge__fallback">Deezer</span>
      ) : (
        <img
          src={DEEZER_LOGO_SRC}
          alt="Deezer"
          height={20}
          // The asset is dropped in manually, so a missing file is the expected
          // state on a fresh clone — swap to the wordmark instead of showing a
          // broken image icon.
          onError={() => setLogoMissing(true)}
        />
      )}
    </a>
  );
}
