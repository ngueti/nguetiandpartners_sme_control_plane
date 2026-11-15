"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useInView, AnimatePresence } from "motion/react";
import { StepIcon, VerbIcon, type VerbKind } from "../Illustrations";

const reveal = { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6, ease: "easeOut" as const } };

/* ───────── Bandeau défilant ───────── */
export function Marquee() {
  const words = ["Architecturer", "Co-construire", "Orchestrer", "Institutionnaliser", "Changer d’échelle"];
  const row = [...words, ...words, ...words, ...words];
  return (
    <div className="overflow-hidden py-4 text-[var(--navy-deep)]" style={{ background: "var(--sun)" }} aria-hidden="true">
      <div className="marquee-track display text-[13px] tracking-[.22em]">
        {row.map((w, i) => (
          <span key={i} className="mx-6 flex items-center gap-12 whitespace-nowrap">{w}<i className="block h-2 w-2 rotate-45 bg-[var(--navy-deep)]" /></span>
        ))}
      </div>
    </div>
  );
}

/* ───────── Les 5 verbes ───────── */
const VERBS: { kind: VerbKind; label: string; line: string }[] = [
  { kind: "architecturer", label: "Architecturer", line: "On pose les bases." },
  { kind: "co-construire", label: "Co-construire", line: "Avec vous, jamais à votre place." },
  { kind: "orchestrer", label: "Orchestrer", line: "Chaque pièce au bon rythme." },
  { kind: "institutionnaliser", label: "Institutionnaliser", line: "Une entreprise qui tient seule." },
  { kind: "echelle", label: "Changer d’échelle", line: "Grandir sans se perdre." },
];

export function Verbs() {
  return (
    <section className="section bg-[var(--sand)]" aria-labelledby="verbes">
      <div className="wrap">
        <motion.div {...reveal}>
          <span className="eyebrow">Notre méthode</span>
          <h2 id="verbes" className="title">Cinq verbes.</h2>
        </motion.div>
        <div className="snap-x-row mt-10 lg:grid lg:grid-cols-5 lg:overflow-visible lg:!p-0 lg:!mx-0">
          {VERBS.map((v, i) => (
            <motion.article key={v.kind} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}
              className="group relative w-[240px] overflow-hidden rounded-[28px] bg-[var(--navy)] p-6 text-white lg:w-auto"
              whileHover={{ y: -8 }}>
              <span className="display absolute right-4 top-3 text-[44px] text-white/10">{i + 1}</span>
              <VerbIcon kind={v.kind} className="h-28 w-28 text-white" />
              <h3 className="mt-4 text-[11px] leading-tight tracking-[.04em] text-[var(--yellow)]">{v.label}</h3>
              <p className="mt-2 text-[15px] text-white/75">{v.line}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Parcours en 5 étapes ───────── */
const STEPS = [
  { icon: "candidater", t: "Candidater", d: "5 minutes, depuis votre téléphone." },
  { icon: "echanger", t: "Échanger", d: "Un entretien avec l’équipe de votre pays." },
  { icon: "audit", t: "Auditer", d: "Aucune participation sans audit préalable." },
  { icon: "entree", t: "S’associer", d: "Un pacte clair : au moins 25 %, gouvernance partagée." },
  { icon: "cent-jours", t: "100 jours", d: "On structure, on mesure, on transforme." },
] as const;

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <section id="parcours" className="section bg-white" aria-labelledby="parcours-t">
      <div className="wrap">
        <motion.div {...reveal} className="text-center">
          <span className="eyebrow">Le parcours</span>
          <h2 id="parcours-t" className="title">Cinq étapes.<br />Une direction.</h2>
        </motion.div>
        <div ref={ref} className="relative mx-auto mt-16 max-w-[900px]">
          <div className="absolute bottom-0 left-[34px] top-0 w-[6px] -translate-x-1/2 rounded bg-[var(--mist)] md:left-1/2" />
          <motion.div className="absolute left-[34px] top-0 w-[6px] origin-top -translate-x-1/2 rounded md:left-1/2" style={{ scaleY: h, height: "100%", background: "var(--sun)" }} />
          <ol className="relative grid gap-14">
            {STEPS.map((s, i) => {
              const right = i % 2 === 0;
              return (
                <motion.li key={s.t} {...reveal} className={`relative grid grid-cols-[68px_1fr] items-center gap-5 md:grid-cols-2 md:gap-x-28 ${right ? "" : "md:[&>div:first-child]:order-2"}`}>
                  <div className={`z-10 md:flex ${right ? "md:justify-end md:pr-0" : "md:justify-start"}`}>
                    <motion.div whileHover={{ rotate: 8, scale: 1.08 }} className="relative grid h-[68px] w-[68px] place-items-center rounded-full text-white md:absolute md:left-1/2 md:-translate-x-1/2"
                      style={{ background: "var(--sun)", padding: 5 }}>
                      <span className="grid h-full w-full place-items-center rounded-full bg-[var(--navy)]"><StepIcon kind={s.icon} className="h-8 w-8" /></span>
                      <span className="display absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-[var(--yellow)] text-[11px] text-[var(--navy-deep)]">{i + 1}</span>
                    </motion.div>
                  </div>
                  <div className={`md:py-2 ${right ? "md:text-left" : "md:text-right"}`}>
                    <h3 className="text-[19px] text-[var(--navy)]">{s.t}</h3>
                    <p className="mt-1 text-[16px] text-[var(--muted)]">{s.d}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
        <motion.div {...reveal} className="mt-14 text-center"><Link href="/rejoindre" className="btn btn-sun">Commencer l’étape 1</Link></motion.div>
      </div>
    </section>
  );
}

/* ───────── Cadran des 100 jours ───────── */
const PHASES = [
  { days: 15, range: "J 0–15", t: "Sécuriser", pts: ["Gouvernance installée", "Trésorerie de référence", "Accès et données protégés"], c: "#fadc2c" },
  { days: 15, range: "J 16–30", t: "Stabiliser", pts: ["Urgences de trésorerie", "Risques prioritaires", "Fournisseurs clés"], c: "#f7b81c" },
  { days: 30, range: "J 31–60", t: "Structurer", pts: ["Rôles clairs", "Processus clés", "Indicateurs chaque semaine"], c: "#f0961a" },
  { days: 30, range: "J 61–90", t: "Améliorer", pts: ["Marges et prix", "Ventes et clients", "Moins de dépendance au fondateur"], c: "#e97b02" },
  { days: 10, range: "J 91–100", t: "Mesurer", pts: ["Progrès mesurés", "Budget sur 12 mois", "Feuille de route"], c: "#ffffff" },
];

export function Dial() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  useEffect(() => {
    if (!auto || !inView) return;
    const t = setInterval(() => setActive((a) => (a + 1) % PHASES.length), 3600);
    return () => clearInterval(t);
  }, [auto, inView]);

  const R = 118, C = 2 * Math.PI * R, GAP = 5;
  let acc = 0;
  const p = PHASES[active];
  return (
    <section id="cent-jours" className="on-dark section grain overflow-hidden bg-[var(--navy)]" aria-labelledby="cj">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div {...reveal}>
            <span className="eyebrow">N&amp;P First 100 Days™</span>
            <h2 id="cj" className="title !text-white">100 jours.<br />Cinq temps.</h2>
            <p className="mt-4 max-w-md text-white/75">Stabiliser d’abord. Mesurer ensuite. Transformer avec votre équipe.</p>
          </motion.div>
          <div aria-live="polite" className="mt-8 min-h-[190px]">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <p className="display text-[12px] tracking-[.2em] text-[var(--yellow)]">{p.range}</p>
                <h3 className="mt-1 text-[28px] text-white">{p.t}</h3>
                <ul className="mt-4 grid gap-3">
                  {p.pts.map((x) => (
                    <li key={x} className="flex items-center gap-3 text-[17px]"><span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.c }} />{x}</li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[460px]">
          <svg viewBox="0 0 300 300" className="h-full w-full -rotate-90" role="group" aria-label="Les cinq phases des 100 jours">
            <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="26" />
            {PHASES.map((ph, i) => {
              const len = (ph.days / 100) * C;
              const off = acc;
              acc += len;
              const sel = i === active;
              return (
                <motion.circle key={ph.range} cx="150" cy="150" r={R} fill="none" stroke={ph.c}
                  strokeWidth={sel ? 40 : 26} strokeLinecap="butt" strokeDasharray={`${len - GAP} ${C - len + GAP}`} strokeDashoffset={-off}
                  initial={{ opacity: 0 }} animate={{ strokeWidth: sel ? 40 : 26, opacity: sel ? 1 : 0.55 }}
                  transition={{ duration: 0.4 }} style={{ cursor: "pointer", outline: "none" }} tabIndex={0} role="button" aria-label={`${ph.range} : ${ph.t}`}
                  onClick={() => { setActive(i); setAuto(false); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setActive(i); setAuto(false); } }} />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <motion.p key={p.range} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="display text-[clamp(30px,8vw,44px)] text-white">{p.range.replace("J ", "J")}</motion.p>
              <p className="mt-1 text-[14px] text-white/60">touchez un arc</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
