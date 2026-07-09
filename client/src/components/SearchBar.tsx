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
import { useState, useEffect, useRef } from 'react';

interface Props {
  onSearch: (term: string) => void; // App.handleSearch
}

export default function SearchBar({ onSearch }: Props) {
  const [text, setText] = useState('');
  const lastSearched = useRef('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed.length > 0 && trimmed !== lastSearched.current) {
        onSearch(trimmed);
        lastSearched.current = trimmed;
      }
    }, 400); // searches when we pause typing for 400ms.

    return () => clearTimeout(timer);
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length > 0 && trimmed !== lastSearched.current) {
      onSearch(trimmed);
        lastSearched.current = trimmed;

    }
  } // only searches if we have an actual value.

  


  return(
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="search for an album..."
      />
      <button type="submit">search</button>
    </form>
  );
}
