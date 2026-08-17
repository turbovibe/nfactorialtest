import { useId } from 'react';
import type { Color } from 'chess.js';
import { arrowPath, type BoardArrow } from '../lib/boardAnnotations';

type BoardAnnotationsProps = {
  arrows: BoardArrow[];
  orientation: Color;
};

export function BoardAnnotations({ arrows, orientation }: BoardAnnotationsProps) {
  const markerId = `arrow-head-${useId().replace(/:/g, '')}`;

  return (
    <svg aria-hidden="true" className="board-annotations" viewBox="0 0 800 800">
      <defs>
        <marker id={markerId} markerHeight="5" markerWidth="5" orient="auto" refX="4.5" refY="2.5">
          <path d="M 0 0 L 5 2.5 L 0 5 Z" />
        </marker>
      </defs>
      {arrows.map((arrow, index) => (
        <path
          className="board-arrow"
          d={arrowPath(arrow, orientation)}
          key={`${arrow.from}-${arrow.to}-${index}`}
          markerEnd={`url(#${markerId})`}
        />
      ))}
    </svg>
  );
}
