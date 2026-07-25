const SIZES = {
  sm: { width: 56, height: 65 },
  md: { width: 88, height: 103 },
} as const;

// Fixed (not theme-linked) ink color for the character's own linework/pupils
// — using var(--foreground) here made every outline flip to near-white in
// dark mode, since that token is meant for UI text, not a cartoon's ink.
// Only the shirt (--brand) and the floating thought-bubble chrome stay
// theme-aware.
const INK = "#1c1d1f";

/**
 * Hand-drawn flat-cartoon SVG mascot for the AI Study Tutor — an exaggerated
 * old professor in a "720" shirt. No image asset/generation involved; every
 * shape is inline SVG built from circles/ellipses/simple arcs. The shirt and
 * thought-bubble chrome follow the app's theme; the character's own ink
 * (outlines/pupils) stays a fixed dark color in both themes — see INK above.
 */
export function TutorMascot({
  thinking = false,
  size = "md",
}: {
  thinking?: boolean;
  size?: "sm" | "md";
}) {
  const { width, height } = SIZES[size];

  return (
    <div className="tutor-mascot-pop-in shrink-0" aria-hidden>
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 140"
        className={thinking ? "tutor-mascot-thinking" : undefined}
      >
        {/* side hair tufts, drawn before the head so it overlaps their inner half */}
        <ellipse
          cx="26" cy="58" rx="10" ry="16" transform="rotate(-15 26 58)"
          fill="#ececeb" stroke={INK} strokeWidth="2"
        />
        <ellipse
          cx="94" cy="58" rx="10" ry="16" transform="rotate(15 94 58)"
          fill="#ececeb" stroke={INK} strokeWidth="2"
        />

        {/* neck + shirt */}
        <rect x="50" y="82" width="20" height="20" fill="#e8b98a" stroke={INK} strokeWidth="2" />
        <path
          d="M34,140 L40,98 Q60,88 80,98 L86,140 Z"
          fill="var(--brand)"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text
          x="60"
          y="124"
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="var(--surface)"
          fontFamily="var(--font-sans), ui-sans-serif, sans-serif"
        >
          720
        </text>

        {/* head */}
        <circle cx="60" cy="54" r="34" fill="#e8b98a" stroke={INK} strokeWidth="2.5" />

        {/* eyebrows */}
        {thinking ? (
          <>
            <path d="M30,38 Q44,29 58,37" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
            <path d="M30,38 Q44,29 58,37" fill="none" stroke="#ececeb" strokeWidth="4" strokeLinecap="round" />
            <path d="M62,32 Q76,18 90,30" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
            <path d="M62,32 Q76,18 90,30" fill="none" stroke="#ececeb" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M30,38 Q44,29 58,37" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
            <path d="M30,38 Q44,29 58,37" fill="none" stroke="#ececeb" strokeWidth="4" strokeLinecap="round" />
            <path d="M62,37 Q76,29 90,38" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
            <path d="M62,37 Q76,29 90,38" fill="none" stroke="#ececeb" strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {/* glasses */}
        <circle cx="44" cy="54" r="13" fill="var(--surface)" fillOpacity="0.35" stroke={INK} strokeWidth="3" />
        <circle cx="76" cy="54" r="13" fill="var(--surface)" fillOpacity="0.35" stroke={INK} strokeWidth="3" />
        <line x1="57" y1="54" x2="63" y2="54" stroke={INK} strokeWidth="3" />

        {/* eyes */}
        {thinking ? (
          <>
            <circle cx="46" cy="51" r="3" fill={INK} />
            <circle cx="78" cy="51" r="3" fill={INK} />
          </>
        ) : (
          <>
            <circle cx="44" cy="54" r="3" fill={INK} />
            <circle cx="76" cy="54" r="3" fill={INK} />
          </>
        )}

        {/* mustache */}
        <ellipse cx="48" cy="70" rx="14" ry="7" transform="rotate(-15 48 70)" fill="#ececeb" stroke={INK} strokeWidth="2" />
        <ellipse cx="72" cy="70" rx="14" ry="7" transform="rotate(15 72 70)" fill="#ececeb" stroke={INK} strokeWidth="2" />

        {/* thought bubble, only while thinking */}
        {thinking && (
          <>
            <circle cx="78" cy="32" r="2" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            <circle cx="82" cy="26" r="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="84" y="2" width="34" height="20" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            <circle className="tutor-mascot-dot" cx="93" cy="12" r="2.3" fill="var(--foreground-muted)" style={{ animationDelay: "0s" }} />
            <circle className="tutor-mascot-dot" cx="101" cy="12" r="2.3" fill="var(--foreground-muted)" style={{ animationDelay: "0.15s" }} />
            <circle className="tutor-mascot-dot" cx="109" cy="12" r="2.3" fill="var(--foreground-muted)" style={{ animationDelay: "0.3s" }} />
          </>
        )}
      </svg>
    </div>
  );
}
