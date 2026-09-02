export function HeroStrip() {
  return (
    <svg viewBox="0 0 1200 120" className="block w-full h-auto" aria-hidden>
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <line x1="60" y1="78" x2="1140" y2="78" opacity="0.35" />
        <line x1="0" y1="120" x2="560" y2="78" opacity="0.5" />
        <line x1="1200" y1="120" x2="640" y2="78" opacity="0.5" />
        {[[120, 26], [180, 40], [240, 20], [300, 34], [900, 30], [960, 44], [1020, 24], [1080, 36]].map(
          ([x, h], i) => (
            <line key={i} x1={x} y1={78} x2={x} y2={78 - h} opacity="0.5" />
          )
        )}
        <line x1="420" y1="78" x2="420" y2="54" opacity="0.6" />
        <line x1="780" y1="78" x2="780" y2="54" opacity="0.6" />
        <circle cx="420" cy="52" r="2" opacity="0.6" />
        <circle cx="780" cy="52" r="2" opacity="0.6" />
      </g>
      <g stroke="#bf4722" strokeWidth="2.4" opacity="0.85">
        <line x1="600" y1="86" x2="600" y2="94" />
        <line x1="600" y1="102" x2="600" y2="114" />
      </g>
      <circle cx="860" cy="40" r="14" fill="none" stroke="#bf4722" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}

export function MapGapDiagram() {
  return (
    <svg viewBox="0 0 360 160" className="block w-full h-auto" aria-hidden>
      {/* Background City Blocks */}
      <rect x="20" y="15" width="90" height="42" rx="4" fill="#f3efe6" stroke="#d3cab7" strokeWidth="1" />
      <rect x="130" y="15" width="100" height="42" rx="4" fill="#f3efe6" stroke="#d3cab7" strokeWidth="1" />
      <rect x="250" y="15" width="90" height="42" rx="4" fill="#f3efe6" stroke="#d3cab7" strokeWidth="1" />
      <rect x="20" y="105" width="90" height="40" rx="4" fill="#f3efe6" stroke="#d3cab7" strokeWidth="1" />
      <rect x="130" y="105" width="100" height="40" rx="4" fill="#f3efe6" stroke="#d3cab7" strokeWidth="1" />
      <rect x="250" y="105" width="90" height="40" rx="4" fill="#f3efe6" stroke="#d3cab7" strokeWidth="1" />

      {/* Main Road Corridor */}
      <rect x="0" y="66" width="360" height="30" fill="#e9e2d2" />
      <line x1="0" y1="81" x2="360" y2="81" stroke="#b0a894" strokeWidth="1" strokeDasharray="6 6" />

      {/* GPS Pin Marker */}
      <g>
        <circle cx="65" cy="81" r="10" fill="none" stroke="#bf4722" strokeWidth="1.2" opacity="0.4" />
        <circle cx="65" cy="81" r="4.5" fill="#bf4722" />
        <text x="65" y="102" textAnchor="middle" fontSize="8.5" letterSpacing="1.2" fill="#8a8272" fontWeight="600" fontFamily="'IBM Plex Mono', monospace">
          GPS PIN
        </text>
      </g>

      {/* Dotted Gap Connector Line */}
      <path
        d="M65 76 C 120 52, 200 42, 282 34"
        fill="none"
        stroke="#bf4722"
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />

      {/* Destination Icon & Label */}
      <g transform="translate(282, 22)">
        <text x="0" y="-5" textAnchor="middle" fontSize="8.5" letterSpacing="1.2" fill="#1b1712" fontWeight="600" fontFamily="'IBM Plex Mono', monospace">
          DESTINATION
        </text>
        <g stroke="#1b1712" strokeWidth="1.3" fill="#faf8f3">
          <rect x="-7" y="0" width="14" height="14" rx="2" />
          <path d="M-7 0 L7 14 M7 0 L-7 14" strokeWidth="1" />
        </g>
      </g>

      {/* Clean Callout Label for 120-M GAP (with background to prevent line overlap) */}
      <g transform="translate(170, 52)">
        <rect x="-48" y="-10" width="96" height="18" rx="3" fill="#faf8f3" stroke="#bf4722" strokeWidth="0.9" opacity="0.95" />
        <text x="0" y="2.5" textAnchor="middle" fontSize="8.5" letterSpacing="1.4" fill="#bf4722" fontWeight="600" fontFamily="'IBM Plex Mono', monospace">
          ≈ 120-M GAP
        </text>
      </g>
    </svg>
  );
}

export function RouteWayDiagram() {
  return (
    <svg viewBox="0 0 360 150" className="block w-full h-auto" aria-hidden>
      <line x1="40" y1="62" x2="320" y2="62" stroke="#b0a894" strokeWidth="0.8" opacity="0.5" />
      <polygon points="40,150 160,64 200,64 320,150" fill="#f3efe6" stroke="#d3cab7" />
      <g stroke="#b0a894" opacity="0.55">
        <line x1="96" y1="64" x2="88" y2="96" />
        <line x1="126" y1="64" x2="112" y2="118" />
        <line x1="264" y1="64" x2="272" y2="96" />
        <line x1="234" y1="64" x2="248" y2="118" />
        <line x1="88" y1="96" x2="112" y2="118" opacity="0.4" />
        <line x1="272" y1="96" x2="248" y2="118" opacity="0.4" />
      </g>
      <path
        d="M180 148 L180 118 C 180 104, 158 100, 156 88 C 154 78, 166 74, 170 68"
        fill="none"
        stroke="#1b1712"
        strokeWidth="1.3"
        strokeDasharray="5 4"
      />
      <g>
        <circle cx="180" cy="118" r="9" fill="#faf8f3" stroke="#bf4722" strokeWidth="1.5" />
        <text x="180" y="121.5" textAnchor="middle" fontSize="10" fill="#bf4722" fontFamily="'IBM Plex Mono', monospace">1</text>
        <circle cx="204" cy="112" r="4.5" fill="none" stroke="#8a8272" strokeWidth="1.2" />
        <circle cx="156" cy="86" r="9" fill="#faf8f3" stroke="#bf4722" strokeWidth="1.5" />
        <text x="156" y="89.5" textAnchor="middle" fontSize="10" fill="#bf4722" fontFamily="'IBM Plex Mono', monospace">2</text>
        <rect x="128" y="78" width="10" height="12" fill="none" stroke="#8a8272" strokeWidth="1.2" />
        <circle cx="171" cy="66" r="10" fill="#bf4722" />
        <text x="171" y="69.5" textAnchor="middle" fontSize="10" fill="#faf8f3" fontFamily="'IBM Plex Mono', monospace">3</text>
        <path d="M171 56 L171 46 M171 46 L181 49 L171 52" stroke="#bf4722" strokeWidth="1.4" fill="none" />
      </g>
    </svg>
  );
}

const glyphBase = {
  viewBox: "0 0 28 28",
  className: "block w-7 h-7",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function GlyphCapture() {
  return (
    <svg {...glyphBase}>
      <circle cx="14" cy="14" r="10" />
      <ellipse cx="14" cy="14" rx="10" ry="3.8" />
      <circle cx="14" cy="14" r="1.8" fill="#bf4722" stroke="none" />
    </svg>
  );
}

export function GlyphSolve() {
  return (
    <svg {...glyphBase}>
      <path d="M3 23 C 9 7, 19 7, 25 15" />
      <circle cx="3" cy="23" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="25" cy="15" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9.5" r="2" fill="#bf4722" stroke="none" />
    </svg>
  );
}

export function GlyphMesh() {
  return (
    <svg {...glyphBase}>
      <polygon points="14,3 25,10.5 21.5,24 6.5,24 3,10.5" />
      <path d="M14,3 L14,14 M25,10.5 L14,14 M21.5,24 L14,14 M6.5,24 L14,14 M3,10.5 L14,14" strokeWidth="0.9" opacity="0.7" />
      <circle cx="14" cy="14" r="1.7" fill="#bf4722" stroke="none" />
    </svg>
  );
}

export function GlyphLayers() {
  return (
    <svg {...glyphBase}>
      <path d="M6 9 L14 5 L22 9 L14 13 Z" stroke="#bf4722" />
      <path d="M6 14.5 L14 10.5 L22 14.5 L14 18.5 Z" />
      <path d="M6 20 L14 16 L22 20 L14 24 Z" opacity="0.55" />
    </svg>
  );
}

export function GlyphDeliver() {
  return (
    <svg {...glyphBase}>
      <circle cx="14" cy="20" r="2" fill="currentColor" stroke="none" />
      <path d="M8.5 14.5 a 7.8 7.8 0 0 1 11 0" />
      <path d="M5.5 10.5 a 12 12 0 0 1 17 0" stroke="#bf4722" />
    </svg>
  );
}

const dirBase = {
  viewBox: "0 0 56 36",
  className: "block w-14 h-9",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function GlyphRoute() {
  return (
    <svg {...dirBase}>
      <path d="M6 30 C 20 30, 16 13, 30 13 C 39 13, 39 22, 47 15" strokeDasharray="5 4" />
      <rect x="3" y="27" width="5" height="5" fill="currentColor" stroke="none" />
      <circle cx="49" cy="13" r="4" stroke="#bf4722" />
      <circle cx="49" cy="13" r="1.4" fill="#bf4722" stroke="none" />
    </svg>
  );
}

export function GlyphStorefront() {
  return (
    <svg {...dirBase}>
      <polygon points="9,14 47,14 43,7 13,7" stroke="#bf4722" />
      <rect x="12" y="14" width="32" height="16" />
      <rect x="25" y="20" width="8" height="10" />
      <path d="M15 20 h6" />
    </svg>
  );
}

export function GlyphDataStack() {
  return (
    <svg {...dirBase}>
      <path d="M14 4 L28 11 L14 18 L0 11 Z" stroke="#bf4722" />
      <path d="M0 17 L14 24 L28 17" opacity="0.6" />
      <path d="M0 23 L14 30 L28 23" opacity="0.35" />
    </svg>
  );
}

const STACK_LAYERS = [
  "Road",
  "Buildings",
  "Objects",
  "Trajectories",
  "Geometry",
  "Appearance",
  "Time",
];

export function LayerStackDiagram() {
  return (
    <svg viewBox="0 0 340 380" className="block w-full max-w-[340px] h-auto" aria-hidden>
      {STACK_LAYERS.map((name, i) => {
        const y = 26 + i * 47;
        const accent = i === 4;
        const fade = 0.9 - i * 0.07;
        return (
          <g key={name}>
            {i > 0 && (
              <line
                x1="70"
                y1={y - 21}
                x2="70"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.6"
                strokeDasharray="2 3"
                opacity="0.3"
              />
            )}
            <polygon
              points={`70,${y} 210,${y} 250,${y + 20} 110,${y + 20}`}
              fill="none"
              stroke={accent ? "#bf4722" : "currentColor"}
              strokeWidth={accent ? 1.5 : 1.1}
              opacity={accent ? 1 : fade}
            />
            <line x1="252" y1={y + 10} x2="262" y2={y + 10} stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
            <text
              x="266"
              y={y + 13.5}
              fontSize="10.5"
              letterSpacing="1"
              fill={accent ? "#bf4722" : "currentColor"}
              opacity={accent ? 1 : 0.75}
              fontFamily="'IBM Plex Mono', monospace"
            >
              {name.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
