export default function FirefighterIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Illustration of a firefighter in helmet and turnout gear"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#FF6B57" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF6B57" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jacket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26313D" />
          <stop offset="100%" stopColor="#1B242F" />
        </linearGradient>
      </defs>

      <circle cx="110" cy="95" r="100" fill="url(#glow)" />

      {/* shoulders / turnout jacket */}
      <path
        d="M40 220 C40 165 70 148 110 148 C150 148 180 165 180 220 Z"
        fill="url(#jacket)"
        stroke="#26313D"
        strokeWidth="2"
      />
      {/* reflective stripe */}
      <path d="M46 196 C68 182 152 182 174 196 L174 208 C152 195 68 195 46 208 Z" fill="#F5B942" opacity="0.9" />
      {/* collar */}
      <path d="M92 150 L110 172 L128 150 L118 144 L110 150 L102 144 Z" fill="#131A22" />

      {/* neck */}
      <rect x="98" y="118" width="24" height="26" rx="8" fill="#3A4655" />

      {/* helmet dome */}
      <path
        d="M55 108 C55 66 79 40 110 40 C141 40 165 66 165 108 Z"
        fill="#7A3A32"
        stroke="#FF6B57"
        strokeWidth="2"
      />
      {/* helmet front badge */}
      <circle cx="110" cy="82" r="17" fill="#131A22" stroke="#F5B942" strokeWidth="2" />
      <path
        d="M110 72 C114 78 118 81 118 87 C118 93 114 97 110 97 C106 97 102 93 102 87 C102 83 105 82 106 78 C107 82 108 82 108 79 C108 76 109 74 110 72 Z"
        fill="#FF6B57"
      />
      {/* helmet brim */}
      <path
        d="M40 108 C40 100 76 96 110 96 C144 96 180 100 180 108 C180 118 144 122 110 122 C76 122 40 118 40 108 Z"
        fill="#5C2A24"
        stroke="#26313D"
        strokeWidth="1.5"
      />
    </svg>
  );
}
