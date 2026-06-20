import React from 'react';

export function LogoIcon({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: 'currentColor', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.7 }} />
        </linearGradient>

        <linearGradient id="gradientAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.3 }} />
          <stop offset="50%" style={{ stopColor: 'currentColor', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.3 }} />
        </linearGradient>

        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Outer decorative ring */}
      <circle cx="120" cy="120" r="115" fill="none" stroke="url(#gradientAccent)" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="120" cy="120" r="110" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>

      {/* Ganga wave patterns (top accent) */}
      <g opacity="0.4">
        <path d="M 50 60 Q 60 55 70 60 T 90 60 T 110 60 T 130 60 T 150 60 T 170 60 T 190 60"
              stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 50 68 Q 60 63 70 68 T 90 68 T 110 68 T 130 68 T 150 68 T 170 68 T 190 68"
              stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7"/>
      </g>

      {/* Main building structure with depth */}
      <g filter="url(#shadow)">
        {/* Building shadow */}
        <path d="M 65 95 L 105 60 L 145 95 L 145 160 L 65 160 Z"
              fill="currentColor" opacity="0.15"/>

        {/* Main building */}
        <path d="M 60 90 L 100 55 L 140 90 L 140 155 L 60 155 Z"
              fill="url(#gradientMain)"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"/>

        {/* Roof peak accent */}
        <polygon points="100,55 95,75 105,75" fill="currentColor" opacity="0.6"/>
        <line x1="100" y1="55" x2="100" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>

        {/* Ornamental door with details */}
        <rect x="92" y="125" width="16" height="25" fill="currentColor" rx="2"/>
        <circle cx="106" cy="137" r="2.5" fill="white" opacity="0.9"/>
        <rect x="92" y="125" width="16" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" opacity="0.5"/>

        {/* Windows - Left column */}
        <g>
          <rect x="68" y="85" width="14" height="14" fill="currentColor" fillOpacity="0.15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="75" y1="85" x2="75" y2="99" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <line x1="68" y1="92" x2="82" y2="92" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        </g>

        <g>
          <rect x="68" y="107" width="14" height="14" fill="currentColor" fillOpacity="0.15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="75" y1="107" x2="75" y2="121" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <line x1="68" y1="114" x2="82" y2="114" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        </g>

        {/* Windows - Right column */}
        <g>
          <rect x="158" y="85" width="14" height="14" fill="currentColor" fillOpacity="0.15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="165" y1="85" x2="165" y2="99" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <line x1="158" y1="92" x2="172" y2="92" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        </g>

        <g>
          <rect x="158" y="107" width="14" height="14" fill="currentColor" fillOpacity="0.15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="165" y1="107" x2="165" y2="121" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <line x1="158" y1="114" x2="172" y2="114" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        </g>

        {/* Center window (upper floor) */}
        <g>
          <rect x="108" y="75" width="12" height="12" fill="currentColor" fillOpacity="0.15" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
          <line x1="114" y1="75" x2="114" y2="87" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
          <line x1="108" y1="81" x2="120" y2="81" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
        </g>

        {/* Foundation line */}
        <line x1="60" y1="155" x2="140" y2="155" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      </g>

      {/* Ganga river waves (bottom) - More detailed */}
      <g opacity="0.85" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Wave 1 */}
        <path d="M 45 165 Q 60 158 75 165 Q 90 172 105 165 Q 120 158 135 165 Q 150 172 165 165 Q 180 158 195 165"
              strokeWidth="2.5"/>

        {/* Wave 2 */}
        <path d="M 40 177 Q 55 171 70 177 Q 85 183 100 177 Q 115 171 130 177 Q 145 183 160 177 Q 175 171 190 177 Q 205 183 220 177"
              strokeWidth="2" opacity="0.7"/>

        {/* Wave 3 */}
        <path d="M 50 187 Q 65 182 80 187 Q 95 192 110 187 Q 125 182 140 187 Q 155 192 170 187 Q 185 182 200 187"
              strokeWidth="1.5" opacity="0.5"/>
      </g>

      {/* Spiritual dot in center (sacred mark) */}
      <circle cx="120" cy="120" r="3" fill="currentColor" opacity="0.6"/>

      {/* Decorative corner flourishes */}
      <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4">
        <path d="M 50 50 Q 55 55 50 60" strokeLinecap="round"/>
        <path d="M 190 50 Q 185 55 190 60" strokeLinecap="round"/>
        <path d="M 50 200 Q 55 195 50 190" strokeLinecap="round"/>
        <path d="M 190 200 Q 185 195 190 190" strokeLinecap="round"/>
      </g>

      {/* Outer protective circle */}
      <circle cx="120" cy="120" r="115" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
    </svg>
  );
}

export default LogoIcon;
