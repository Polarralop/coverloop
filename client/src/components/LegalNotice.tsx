const CONTACT_EMAIL = 'polarrralop@outlook.com';

/**
 * The full attribution / disclaimer text. Rendered inline by SiteFooter rather
 * than on its own route — the app is a single screen with no router, so there's
 * nowhere to route to.
 *
 * Note that two of these requirements are ALSO enforced elsewhere, because the
 * respective API terms ask for more than a legal page:
 *   - Deezer wants a visible logo in the UI  -> DeezerBadge (footer)
 *   - Discogs wants a credit + link next to the data -> AlbumCard
 * Removing either one is a licensing problem, not a styling choice.
 */
export default function LegalNotice() {
  return (
    <section className="legal-notice" id="legal-notice" aria-label="Legal and attribution">
      <h2>Legal &amp; Attribution</h2>

      <h3>Artwork Ownership</h3>
      <p>
        Album and video-game artwork displayed or used by this service remains the property of its
        respective copyright and trademark holders.
      </p>

      <h3>Third-Party Data Sources</h3>
      <p>
        Artwork and metadata may be obtained from third-party services including Deezer, Discogs,
        MusicBrainz, and IGDB. This service is independent of those services and is not endorsed by
        or affiliated with them unless explicitly stated.
      </p>
      <p>
        This application uses Discogs' API but is not affiliated with, sponsored or endorsed by
        Discogs. "Discogs" is a trademark of Zink Media, LLC. Data provided by{' '}
        <a href="https://www.discogs.com/" target="_blank" rel="noreferrer">
          Discogs
        </a>
        .
      </p>
      <p>
        Cover art for music releases is served via the{' '}
        <a href="https://coverartarchive.org/" target="_blank" rel="noreferrer">
          Cover Art Archive
        </a>
        , a collaboration between{' '}
        <a href="https://musicbrainz.org/" target="_blank" rel="noreferrer">
          MusicBrainz
        </a>{' '}
        and the{' '}
        <a href="https://archive.org/" target="_blank" rel="noreferrer">
          Internet Archive
        </a>
        .
      </p>
      <p>
        Game data and artwork provided by{' '}
        <a href="https://www.igdb.com/" target="_blank" rel="noreferrer">
          IGDB
        </a>
        .
      </p>

      <h3>User-Uploaded Content</h3>
      <p>
        Users are responsible for ensuring they have the necessary rights or permissions for images
        they upload to the service.
      </p>
      <p>
        Users must not knowingly use the service to infringe another person's copyright, trademark,
        or other intellectual-property rights.
      </p>

      <h3>Reporting Infringement</h3>
      <p>
        If you are a rights holder and believe content generated or uploaded through the service
        infringes your rights, please contact me @{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> so we can review the content and
        take appropriate action.
      </p>
    </section>
  );
}
