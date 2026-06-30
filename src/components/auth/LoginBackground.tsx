'use client';

/**
 * LoginBackground — decorative animated SVG background for the left branding panel.
 * Renders pulsing grid lines, floating data nodes, and an ECG-style trace.
 */
export function LoginBackground() {
  return (
    <div className="login-bg-canvas" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 500 700"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bg-grad" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#0a2560" />
            <stop offset="100%" stopColor="#001230" />
          </radialGradient>

          <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="node-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="500" height="700" fill="url(#bg-grad)" />

        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0" y1={i * 70 + 35}
            x2="500" y2={i * 70 + 35}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 62.5 + 31} y1="0"
            x2={i * 62.5 + 31} y2="700"
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}

        {/* ECG / heartbeat trace */}
        <polyline
          points="0,340 60,340 90,310 110,370 130,290 150,380 165,340 230,340 260,310 280,370 300,290 320,380 335,340 400,340 430,310 450,370 470,290 490,380 500,340"
          fill="none"
          stroke="url(#wave-grad)"
          strokeWidth="2.5"
          filter="url(#glow)"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="1000" to="-1000"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dasharray"
            values="0 2000;400 1600;0 2000"
            dur="4s"
            repeatCount="indefinite"
          />
        </polyline>

        {/* Data nodes */}
        {[
          { cx: 90, cy: 180, r: 5, delay: '0s' },
          { cx: 320, cy: 130, r: 4, delay: '0.6s' },
          { cx: 200, cy: 260, r: 6, delay: '1.2s' },
          { cx: 420, cy: 280, r: 4, delay: '0.3s' },
          { cx: 60,  cy: 480, r: 5, delay: '1.5s' },
          { cx: 380, cy: 500, r: 4, delay: '0.9s' },
          { cx: 250, cy: 560, r: 5, delay: '0.4s' },
          { cx: 130, cy: 600, r: 3, delay: '1.8s' },
          { cx: 460, cy: 420, r: 4, delay: '0.7s' },
        ].map((n, i) => (
          <g key={i} filter="url(#node-glow)">
            <circle cx={n.cx} cy={n.cy} r={n.r + 6} fill="rgba(96,165,250,0.15)">
              <animate attributeName="r" values={`${n.r + 4};${n.r + 10};${n.r + 4}`} dur="3s" begin={n.delay} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" begin={n.delay} repeatCount="indefinite" />
            </circle>
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="#60a5fa" opacity="0.85">
              <animate attributeName="opacity" values="0.85;0.5;0.85" dur="3s" begin={n.delay} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Connection lines between nodes */}
        {[
          { x1: 90, y1: 180, x2: 200, y2: 260 },
          { x1: 200, y1: 260, x2: 320, y2: 130 },
          { x1: 200, y1: 260, x2: 420, y2: 280 },
          { x1: 60,  y1: 480, x2: 250, y2: 560 },
          { x1: 380, y1: 500, x2: 250, y2: 560 },
          { x1: 460, y1: 420, x2: 380, y2: 500 },
        ].map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(96,165,250,0.18)" strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Top accent arc */}
        <ellipse cx="250" cy="-20" rx="280" ry="120"
          fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1.5"
        />
        <ellipse cx="250" cy="-20" rx="200" ry="90"
          fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="1"
        />
      </svg>
    </div>
  );
}
