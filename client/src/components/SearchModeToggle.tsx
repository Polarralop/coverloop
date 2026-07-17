interface Props {
  mode: 'music' | 'games';
  onToggle: () => void;   // App.setSearch — flips mode and clears results
}

// onToggle only fires when actually switching sides, so clicking the already-
// active option doesn't needlessly wipe the current results.
export default function SearchModeToggle({ mode, onToggle }: Props) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-option ${mode === 'music' ? 'active' : ''}`}
        onClick={() => mode !== 'music' && onToggle()}
      >
        music
      </button>
      <button
        className={`mode-option ${mode === 'games' ? 'active' : ''}`}
        onClick={() => mode !== 'games' && onToggle()}
      >
        games
      </button>
    </div>
  );
}
