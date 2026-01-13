import React from 'react';
import { Connection, Position } from '@/types/storyboard';

interface ConnectionLineProps {
  connection: Connection;
  fromPos: Position;
  toPos: Position;
  isSelected?: boolean;
  onClick?: () => void;
  connectionStyle?: 'smooth' | 'straight';
}

export function ConnectionLine({
  connection,
  fromPos,
  toPos,
  isSelected,
  onClick,
  connectionStyle = 'smooth',
}: ConnectionLineProps) {
  // Calculate control points for a smooth bezier curve
  const dx = Math.abs(toPos.x - fromPos.x);
  const controlOffset = Math.min(dx * 0.5, 100);

  const path = connectionStyle === 'smooth'
    ? `M ${fromPos.x} ${fromPos.y} 
       C ${fromPos.x + controlOffset} ${fromPos.y}, 
         ${toPos.x - controlOffset} ${toPos.y}, 
         ${toPos.x} ${toPos.y}`
    : `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;

  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
      />
      {/* Visible line */}
      <path
        d={path}
        className="connection-line"
        style={{
          strokeWidth: isSelected ? 3 : 2,
          opacity: isSelected ? 1 : 0.6,
        }}
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}

export function ConnectionDefs() {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="hsl(var(--line-color))"
        />
      </marker>
    </defs>
  );
}
