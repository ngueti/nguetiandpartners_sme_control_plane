"use client";
import { motion } from "motion/react";

const NAVY = "#0f3e66", DEEP = "#082a47", ORANGE = "#e97b02", YELLOW = "#fadc2c", WHITE = "#fff";

/* ───────────── Personnages (style roundel N&P) ───────────── */
export type PersonaKind = "artisan" | "commercante" | "entrepreneure" | "fondateur" | "partenaire";

function Face({ skin, cx = 100, cy = 78, smile = true }: { skin: string; cx?: number; cy?: number; smile?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="27" fill={skin} />
      <circle cx={cx - 9} cy={cy - 2} r="2.8" fill={DEEP} />
      <circle cx={cx + 9} cy={cy - 2} r="2.8" fill={DEEP} />
      {smile && <path d={`M${cx - 8} ${cy + 9} q8 8 16 0`} stroke={DEEP} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
    </g>
  );
}

export function Persona({ kind, className, delay = 0 }: { kind: PersonaKind; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={kind}>
      <defs>
        <linearGradient id={`pg-${kind}`} x1="0" x2="1">
          <stop offset="0" stopColor={YELLOW} />
          <stop offset="1" stopColor={ORANGE} />
        </linearGradient>
        <clipPath id={`pc-${kind}`}><circle cx="100" cy="100" r="86" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#pg-${kind})`} />
      <circle cx="100" cy="100" r="88" fill={NAVY} />
      <g clipPath={`url(#pc-${kind})`}>
        <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay }}>
          {kind === "artisan" && (
            <g>
              <path d="M30 200 q0-52 70-52 t70 52z" fill={ORANGE} />
              <path d="M78 150 h44 v50 h-44z" fill={YELLOW} opacity=".9" />
              <Face skin="#7a4a2e" />
              <path d="M72 66 q28-30 56 0 v8 h-56z" fill={YELLOW} />
              <rect x="72" y="70" width="56" height="7" rx="3" fill={ORANGE} />
              <motion.g animate={{ rotate: [-18, 24, -18] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "150px", originY: "150px" }}>
                <rect x="147" y="104" width="6" height="48" rx="3" fill={WHITE} />
                <rect x="136" y="96" width="28" height="14" rx="4" fill={WHITE} />
              </motion.g>
            </g>
          )}
          {kind === "commercante" && (
            <g>
              <path d="M18 62 h164 l-14 26 h-136z" fill={WHITE} />
              {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${18 + i * 33} 62 h16.5 l-3 26 h-16.5z`} fill={ORANGE} />)}
              <path d="M30 200 q0-44 70-44 t70 44z" fill={YELLOW} />
              <Face skin="#a0673f" cy={116} />
              <circle cx="100" cy="86" r="18" fill={DEEP} />
              <circle cx="78" cy="110" r="9" fill={DEEP} />
              <circle cx="122" cy="110" r="9" fill={DEEP} />
              <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: .3 }}>
                <circle cx="46" cy="170" r="11" fill={ORANGE} /><circle cx="68" cy="176" r="11" fill={YELLOW} /><circle cx="152" cy="174" r="11" fill={ORANGE} />
              </motion.g>
            </g>
          )}
          {kind === "entrepreneure" && (
            <g>
              <path d="M26 200 q0-50 74-50 t74 50z" fill={WHITE} />
              <path d="M88 150 l12 16 12-16z" fill={ORANGE} />
              <Face skin="#5b3523" />
              <path d="M66 70 q-2-34 34-36 q40 0 36 38 q-10-14-36-14 t-34 12z" fill={ORANGE} />
              <path d="M84 40 q16-12 34 0 q-6 12-18 10 q-10 2-16-10z" fill={YELLOW} />
              <circle cx="74" cy="60" r="4" fill={YELLOW} /><circle cx="128" cy="58" r="4" fill={YELLOW} />
              <g transform="translate(110 150)">
                <rect width="64" height="40" rx="5" fill={DEEP} stroke={WHITE} strokeWidth="2" />
                <motion.path d="M10 28 l14-10 12 7 18-14" stroke={YELLOW} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 2.6, repeat: Infinity }} />
              </g>
            </g>
          )}
          {kind === "fondateur" && (
            <g>
              <g opacity=".5" fill={DEEP}>
                <rect x="14" y="110" width="30" height="90" /><rect x="48" y="90" width="22" height="110" /><rect x="156" y="100" width="30" height="100" />
                <path d="M14 110 l15-14 15 14z" />
              </g>
              <path d="M30 200 q0-50 70-50 t70 50z" fill={WHITE} />
              <path d="M100 150 l-10 10 10 40 10-40z" fill={YELLOW} />
              <Face skin="#6b4128" />
              <path d="M73 70 q2-30 27-30 t27 30 q-14-10-27-10 t-27 10z" fill={DEEP} />
              <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ originX: "162px", originY: "58px" }}>
                <circle cx="162" cy="58" r="13" fill="none" stroke={YELLOW} strokeWidth="5" strokeDasharray="6 5" />
              </motion.g>
              <circle cx="162" cy="58" r="5" fill={ORANGE} />
            </g>
          )}
          {kind === "partenaire" && (
            <g>
              <path d="M26 200 q0-50 74-50 t74 50z" fill={YELLOW} />
              <path d="M84 150 l16 14 16-14z" fill={WHITE} />
              <Face skin="#3d2418" />
              <path d="M72 70 q6-32 28-32 t28 32 q-12-12-28-12 t-28 12z" fill={DEEP} />
              <g fill="none" stroke={WHITE} strokeWidth="2.6"><circle cx="91" cy="76" r="9" /><circle cx="109" cy="76" r="9" /><path d="M100 76 h0" /></g>
              <g transform="translate(120 140)">
                <rect width="52" height="38" rx="6" fill={ORANGE} />
                <rect x="18" y="-8" width="16" height="10" rx="3" fill="none" stroke={ORANGE} strokeWidth="4" />
                <rect x="22" y="14" width="8" height="8" rx="2" fill={YELLOW} />
              </g>
            </g>
          )}
        </motion.g>
      </g>
    </svg>
  );
}

/* ───────────── Icônes animées des 5 verbes ───────────── */
export type VerbKind = "architecturer" | "co-construire" | "orchestrer" | "institutionnaliser" | "echelle";

export function VerbIcon({ kind, className }: { kind: VerbKind; className?: string }) {
  const loop = { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const };
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="2" strokeDasharray="3 7" />
      {kind === "architecturer" && (
        <g>
          <path d="M18 98 h84" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
          {[0, 1, 2].map((i) => (
            <motion.rect key={i} x={22 + i * 26} width="22" height="22" rx="4" fill={i === 1 ? ORANGE : i === 2 ? YELLOW : WHITE}
              animate={{ y: [-30, 74, 74, -30], opacity: [0, 1, 1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.35, times: [0, 0.35, 0.85, 1] }} />
          ))}
          <motion.rect x="48" width="22" height="22" rx="4" fill={ORANGE} animate={{ y: [-30, 50, 50, -30], opacity: [0, 1, 1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1.1, times: [0, 0.4, 0.85, 1] }} />
        </g>
      )}
      {kind === "co-construire" && (
        <g>
          <motion.circle cy="60" r="26" fill={WHITE} fillOpacity=".92" animate={{ cx: [34, 52, 34] }} transition={loop} />
          <motion.circle cy="60" r="26" fill={ORANGE} fillOpacity=".95" animate={{ cx: [86, 68, 86] }} transition={loop} />
          <motion.ellipse cx="60" cy="60" rx="8" ry="22" fill={YELLOW} animate={{ opacity: [0, 1, 0], scaleY: [.4, 1, .4] }} transition={loop} style={{ originX: "60px", originY: "60px" }} />
        </g>
      )}
      {kind === "orchestrer" && (
        <g>
          <circle cx="60" cy="60" r="12" fill={YELLOW} />
          {[24, 40, 54].map((r, i) => <circle key={r} cx="60" cy="60" r={r} fill="none" stroke={WHITE} strokeOpacity=".35" strokeWidth="1.5" />)}
          {[24, 40, 54].map((r, i) => (
            <motion.g key={r} animate={{ rotate: 360 }} transition={{ duration: 6 + i * 3, repeat: Infinity, ease: "linear" }} style={{ originX: "60px", originY: "60px" }}>
              <circle cx={60 + r} cy="60" r={6 - i} fill={i === 1 ? ORANGE : WHITE} />
            </motion.g>
          ))}
        </g>
      )}
      {kind === "institutionnaliser" && (
        <g>
          <path d="M16 46 L60 18 L104 46z" fill={ORANGE} />
          {[0, 1, 2, 3].map((i) => (
            <motion.rect key={i} x={24 + i * 22} width="12" rx="3" fill={i % 2 ? YELLOW : WHITE} style={{ originY: "96px" }}
              initial={{ height: 0, y: 96 }} animate={{ height: [0, 40, 40, 0], y: [96, 56, 56, 96] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.22, times: [0, .3, .85, 1] }} />
          ))}
          <path d="M14 100 h92" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {kind === "echelle" && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <motion.rect key={i} x={20 + i * 23} width="17" rx="4" fill={i === 3 ? YELLOW : i === 2 ? ORANGE : WHITE} style={{ originY: "98px" }}
              initial={{ height: 12, y: 86 }} animate={{ height: [12, 18 + i * 17, 18 + i * 17, 12], y: [86, 80 - i * 17, 80 - i * 17, 86] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, times: [0, .35, .85, 1] }} />
          ))}
          <motion.path d="M22 56 L58 36 L72 46 L100 18" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 4, repeat: Infinity, times: [0, .45, .85, 1] }} />
        </g>
      )}
    </svg>
  );
}

/* ───────────── Pictos étapes (parcours) ───────────── */
export function StepIcon({ kind, className }: { kind: "candidater" | "echanger" | "audit" | "entree" | "cent-jours"; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      {kind === "candidater" && (<><rect x="14" y="8" width="36" height="48" rx="6" /><path d="M22 24h20M22 34h20M22 44h11" /></>)}
      {kind === "echanger" && (<><path d="M10 14h32a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H26l-10 9v-9h-6a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" transform="translate(4 0) scale(.92)" /><path d="M24 26h16M24 33h9" /></>)}
      {kind === "audit" && (<><circle cx="28" cy="28" r="16" /><path d="M40 40l14 14M21 28l5 5 9-10" /></>)}
      {kind === "entree" && (<><circle cx="32" cy="32" r="22" /><path d="M32 10v22h22" /><path d="M32 32L16 48" /></>)}
      {kind === "cent-jours" && (<><rect x="9" y="12" width="46" height="42" rx="7" /><path d="M9 25h46M21 6v10M43 6v10M20 38l8 8 16-16" /></>)}
    </svg>
  );
}
