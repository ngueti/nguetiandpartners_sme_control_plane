import { MONO_PATH, WORD_PATH } from "../lib/logo-paths";

/** Logo officiel N&P, vectorisé depuis le fichier fourni (roundel + monogramme + mot-symbole). */
export function Logo({ variant = "full", tone = "color", className, title = "Ngueti & Partners" }: {
  variant?: "full" | "mark";
  tone?: "color" | "light";
  className?: string;
  title?: string;
}) {
  const id = `g-${variant}-${tone}`;
  const disc = tone === "light" ? "#ffffff" : "#0d3e66";
  const mono = tone === "light" ? "#0d3e66" : "#ffffff";
  const word = tone === "light" ? "#ffffff" : "#0d3e66";
  const vb = variant === "full" ? "60 520 1400 470" : "60 520 480 470";
  return (
    <svg viewBox={vb} className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fadc2c" />
          <stop offset="1" stopColor="#e97b02" />
        </linearGradient>
      </defs>
      <circle cx="297" cy="755" r="220" fill={`url(#${id})`} />
      <circle cx="297" cy="755" r="185" fill={disc} />
      <path d={MONO_PATH} fill={mono} fillRule="evenodd" />
      {variant === "full" && <path d={WORD_PATH} fill={word} fillRule="evenodd" />}
    </svg>
  );
}

/** Roundel seul, rendu en SVG animable (anneau qui tourne). */
export function Roundel({ className, spin = true }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="77 535 440 440" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="rd-g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fadc2c" />
          <stop offset="1" stopColor="#e97b02" />
          {spin && <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="14s" repeatCount="indefinite" />}
        </linearGradient>
      </defs>
      <circle cx="297" cy="755" r="220" fill="url(#rd-g)" />
      <circle cx="297" cy="755" r="185" fill="#0d3e66" />
      <path d={MONO_PATH} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}
