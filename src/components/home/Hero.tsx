"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Roundel } from "../Logo";
import { Persona, type PersonaKind } from "../Illustrations";

const ORBIT: { kind: PersonaKind; angle: number }[] = [
  { kind: "artisan", angle: -90 },
  { kind: "commercante", angle: -18 },
  { kind: "entrepreneure", angle: 54 },
  { kind: "fondateur", angle: 126 },
  { kind: "partenaire", angle: 198 },
];

export function Hero() {
  return (
    <section className="grain relative isolate overflow-hidden bg-[var(--navy-deep)] pb-20 pt-28 text-white sm:pt-32 lg:pb-28" aria-label="Accueil">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 55% at 78% 40%, rgba(27,85,136,.75), transparent 70%), radial-gradient(40% 40% at 10% 90%, rgba(233,123,2,.28), transparent 70%)" }} />
      <div className="wrap grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="eyebrow">N&amp;P SME Control Plane™</motion.span>
          <h1 className="mt-5 text-[clamp(34px,8.2vw,76px)] leading-[1.02]">
            {["Plus forts.", "Ensemble."].map((w, i) => (
              <motion.span key={w} className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.18, type: "spring", stiffness: 90, damping: 16 }}>
                {i === 1 ? <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--sun)" }}>{w}</span> : w}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 max-w-md text-[19px] text-white/80">
            Artisans, TPE, PME : on investit à vos côtés et on structure votre entreprise en 100 jours.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-9 flex flex-wrap gap-3">
            <Link href="/rejoindre" className="btn btn-sun">Rejoindre</Link>
            <a href="#parcours" className="btn btn-ghost">Voir le parcours</a>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] tracking-wide text-white/70" aria-label="Pays">
            {["🇨🇲 Cameroun", "🇨🇮 Côte d’Ivoire", "🇧🇯 Bénin"].map((c) => <li key={c}>{c}</li>)}
          </motion.ul>
        </div>

        {/* Constellation : roundel central + personnages en orbite */}
        <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden="true">
          <div className="absolute inset-[14%] rounded-full" style={{ boxShadow: "0 0 120px 10px rgba(233,123,2,.28)" }} />
          {[0, 1].map((i) => (
            <span key={i} className="absolute inset-[22%] rounded-full border-2 border-[var(--yellow)]" style={{ animation: `pulse-ring 4s ease-out ${i * 2}s infinite` }} />
          ))}
          <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 60, damping: 14 }} className="absolute inset-[24%]">
            <Roundel className="h-full w-full" />
          </motion.div>
          <div className="spin-slow absolute inset-0">
            <span className="absolute inset-[6%] rounded-full border border-dashed border-white/25" />
            {ORBIT.map((o, i) => (
              <div key={o.kind} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transform: `rotate(${o.angle}deg) translate(var(--r))` }}>
                <div style={{ transform: `translate(-50%,-50%) rotate(${-o.angle}deg)` }}>
                  <div className="counter-spin"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.15, type: "spring" }}>
                    <Persona kind={o.kind} delay={i * 0.4} className="h-[88px] w-[88px] drop-shadow-lg sm:h-[110px] sm:w-[110px]" />
                  </motion.div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`.spin-slow > div { --r: clamp(120px, 40vw, 224px); } @media(min-width:560px){ .spin-slow > div { --r: 224px; } }`}</style>
    </section>
  );
}
