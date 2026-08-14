import type { Color } from 'chess.js';

type ColorSelectorProps = {
  value: Color;
  onChange: (color: Color) => void;
};

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <div className="color-selector" aria-label="Choose your chess color">
      <span>Play as</span>
      <button
        className={value === 'w' ? 'color-selector__active' : ''}
        onClick={() => onChange('w')}
        type="button"
      >
        ♙ White
      </button>
      <button
        className={value === 'b' ? 'color-selector__active' : ''}
        onClick={() => onChange('b')}
        type="button"
      >
        ♟ Black
      </button>
    </div>
  );
}
