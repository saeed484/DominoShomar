/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DominoTileProps {
  top?: number;
  bottom?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  horizontal?: boolean;
}

export const DominoTile: React.FC<DominoTileProps> = ({
  top = 6,
  bottom = 6,
  size = 'md',
  className = '',
  horizontal = false,
}) => {
  const getDotPositions = (count: number) => {
    switch (count) {
      case 0:
        return [];
      case 1:
        return [[50, 50]];
      case 2:
        return [
          [28, 28],
          [72, 72],
        ];
      case 3:
        return [
          [25, 25],
          [50, 50],
          [75, 75],
        ];
      case 4:
        return [
          [28, 28],
          [72, 28],
          [28, 72],
          [72, 72],
        ];
      case 5:
        return [
          [25, 25],
          [75, 25],
          [50, 50],
          [25, 75],
          [75, 75],
        ];
      case 6:
        return [
          [28, 22],
          [72, 22],
          [28, 50],
          [72, 50],
          [28, 78],
          [72, 78],
        ];
      default:
        return [];
    }
  };

  const dims = {
    sm: { w: 22, h: 42, r: 4, dot: 1.8 },
    md: { w: 32, h: 62, r: 6, dot: 2.6 },
    lg: { w: 46, h: 90, r: 8, dot: 3.8 },
  }[size];

  const w = horizontal ? dims.h : dims.w;
  const h = horizontal ? dims.w : dims.h;

  return (
    <div
      className={`inline-flex shrink-0 select-none shadow-md ${className}`}
      style={{
        width: `${w}px`,
        height: `${h}px`,
      }}
    >
      <svg
        viewBox={horizontal ? `0 0 ${dims.h} ${dims.w}` : `0 0 ${dims.w} ${dims.h}`}
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="tileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdfbf7" />
            <stop offset="100%" stopColor="#e2dcd2" />
          </linearGradient>
          <filter id="tileInset" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Tile body */}
        <rect
          x="1"
          y="1"
          width={horizontal ? dims.h - 2 : dims.w - 2}
          height={horizontal ? dims.w - 2 : dims.h - 2}
          rx={dims.r}
          fill="url(#tileGrad)"
          stroke="#948c7e"
          strokeWidth="1.2"
        />

        {horizontal ? (
          <>
            {/* Divider */}
            <line
              x1={dims.h / 2}
              y1="4"
              x2={dims.h / 2}
              y2={dims.w - 4}
              stroke="#8a7e6f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Center brass pin */}
            <circle cx={dims.h / 2} cy={dims.w / 2} r={dims.dot * 0.9} fill="#b48325" />

            {/* Left dots */}
            {getDotPositions(top).map(([px, py], i) => (
              <circle
                key={`left-${i}`}
                cx={(px / 100) * (dims.h / 2)}
                cy={(py / 100) * dims.w}
                r={dims.dot}
                fill="#1c1917"
              />
            ))}
            {/* Right dots */}
            {getDotPositions(bottom).map(([px, py], i) => (
              <circle
                key={`right-${i}`}
                cx={dims.h / 2 + (px / 100) * (dims.h / 2)}
                cy={(py / 100) * dims.w}
                r={dims.dot}
                fill="#1c1917"
              />
            ))}
          </>
        ) : (
          <>
            {/* Divider */}
            <line
              x1="4"
              y1={dims.h / 2}
              x2={dims.w - 4}
              y2={dims.h / 2}
              stroke="#8a7e6f"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Center brass pin */}
            <circle cx={dims.w / 2} cy={dims.h / 2} r={dims.dot * 0.9} fill="#b48325" />

            {/* Top dots */}
            {getDotPositions(top).map(([px, py], i) => (
              <circle
                key={`top-${i}`}
                cx={(px / 100) * dims.w}
                cy={(py / 100) * (dims.h / 2)}
                r={dims.dot}
                fill="#1c1917"
              />
            ))}
            {/* Bottom dots */}
            {getDotPositions(bottom).map(([px, py], i) => (
              <circle
                key={`bot-${i}`}
                cx={(px / 100) * dims.w}
                cy={dims.h / 2 + (py / 100) * (dims.h / 2)}
                r={dims.dot}
                fill="#1c1917"
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
};
