// ============================================================================
// SearchBar.tsx — album search input
// ----------------------------------------------------------------------------
// PROPS — typed in the signature below (this is the pattern for every
// component: a small Props interface, destructured in the argument list).
//
// WHAT GOES IN HERE
//   - Controlled <input> (local useState<string> for the text — the ONE piece
//     of state that doesn't live in App, because nobody else needs it).
//   - Trigger onSearch on Enter / submit-button click, with the term trimmed;
//     ignore empty submissions.
//   - RECOMMENDED: also debounce-search as the user types (~400ms after the
//     last keystroke). Keeps you friendly to the iTunes rate limit — see the
//     GOTCHAS note in server/src/services/itunes.ts.
//
// LINKS WITH
//   - App.tsx (parent; owns results state)
// ============================================================================

interface Props {
  onSearch: (term: string) => void; // App.handleSearch
}

export default function SearchBar({ onSearch }: Props) {
  // TODO
  return null;
}
