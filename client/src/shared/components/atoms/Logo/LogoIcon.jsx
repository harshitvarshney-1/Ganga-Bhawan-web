import React from 'react';

export function LogoIcon({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.7 }} />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Building/House Structure */}
      <g filter="url(#shadow)">
        {/* Main building base */}
        <path
          d="M 60 80 L 100 50 L 140 80 L 140 150 L 60 150 Z"
          fill="url(#logoGradient)"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Roof accent line */}
        <line
          x1="100" y1="50" x2="100" y2="65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Door */}
        <rect x="92" y="125" width="16" height="25" fill="currentColor" rx="2" />
        <circle cx="106" cy="137" r="2" fill="white" opacity="0.8" />

        {/* Windows - Left side */}
        <rect
          x="70" y="90" width="12" height="12"
          fill="currentColor" fillOpacity="0.2"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1"
        />
        <rect
          x="70" y="108" width="12" height="12"
          fill="currentColor" fillOpacity="0.2"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Windows - Right side */}
        <rect
          x="118" y="90" width="12" height="12"
          fill="currentColor" fillOpacity="0.2"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1"
        />
        <rect
          x="118" y="108" width="12" height="12"
          fill="currentColor" fillOpacity="0.2"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1"
        />
      </g>

      {/* Ganga River Wave Element at bottom */}
      <g opacity="0.8">
        <path
          d="M 55 155 Q 70 150 85 155 T 115 155 T 145 155"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 55 162 Q 70 157 85 162 T 115 162 T 145 162"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </g>

      {/* Circle background for icon usage */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

export default LogoIcon;
