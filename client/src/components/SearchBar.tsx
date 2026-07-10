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
    }, 500); // searches when we pause typing for 500ms.

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
