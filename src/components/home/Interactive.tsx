"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Persona, type PersonaKind } from "../Illustrations";
import { Roundel } from "../Logo";

const reveal = { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6, ease: "easeOut" as const } };

/* ───────── Diagnostic éclair : poids du fondateur ───────── */
const QUESTIONS = [
  "Les décisions courantes attendent mon accord.",
  "Les clients importants ne traitent qu’avec moi.",
  "Seul(e), je connais les fournisseurs clés.",
  "Mon savoir-faire n’est écrit nulle part.",
  "C’est moi seul(e) qui gère l’argent.",
  "Domaine, mots de passe, comptes : tout est à mon nom.",
  "Mon équipe passe par-dessus les chefs pour m’appeler.",
  "C’est moi qui vends et qui conclus.",
  "J’interviens dans la production du quotidien.",
  "Si je disparaissais 30 jours, tout s’arrêterait.",
];
const CHOICES = [
  { v: 0, label: "Rarement", e: "🌱" },
  { v: 2, label: "Parfois", e: "⚖️" },
  { v: 4, label: "Souvent", e: "🔥" },
];
const LEVELS = [
  { max: 13, t: "Léger", m: "Vous déléguez déjà bien. Allons plus loin ensemble.", c: "#1f9d63" },
  { max: 27, t: "Modéré", m: "Quelques dépendances à desserrer. C’est exactement notre métier.", c: "#e97b02" },
  { max: 40, t: "Lourd", m: "Vous portez beaucoup. C’est normal : c’est le bon moment d’en parler.", c: "#c93a2b" },
];

export function Diagnostic() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const done = answers.length === QUESTIONS.length;
  const score = answers.reduce((a, b) => a + b, 0);
  const level = LEVELS.find((l) => score <= l.max)!;
  const answer = (v: number) => { setAnswers((a) => [...a, v]); setI((x) => x + 1); };
  const back = () => { setAnswers((a) => a.slice(0, -1)); setI((x) => Math.max(0, x - 1)); };
  const reset = () => { setAnswers([]); setI(0); };
  const angle = -90 + (score / 40) * 180;

  return (
    <section id="diagnostic" className="section bg-[var(--mist)]" aria-labelledby="diag">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <motion.div {...reveal}>
          <span className="eyebrow">Diagnostic éclair</span>
          <h2 id="diag" className="title">Combien<br />pesez-vous<br />sur votre<br />entreprise ?</h2>
          <p className="mt-5 max-w-sm text-[var(--muted)]">10 questions. 1 minute. Rien n’est enregistré.</p>
        </motion.div>
        <motion.div {...reveal} className="card relative overflow-hidden p-6 sm:p-9">
          <div className="mb-6 flex gap-1.5" aria-hidden="true">
            {QUESTIONS.map((_, k) => <span key={k} className="h-2 flex-1 rounded-full transition-all" style={{ background: k < answers.length ? "var(--sun)" : "var(--line)" }} />)}
          </div>
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28 }}>
                <p className="display text-[11px] tracking-[.2em] text-[var(--orange)]">Question {i + 1} / 10</p>
                <p className="mt-3 min-h-[84px] text-[22px] font-semibold leading-snug text-[var(--navy)]">{QUESTIONS[i]}</p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {CHOICES.map((c) => (
                    <motion.button key={c.v} whileTap={{ scale: 0.92 }} whileHover={{ y: -4 }} onClick={() => answer(c.v)}
                      className="flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[var(--line)] bg-white px-2 py-4 text-[15px] font-semibold text-[var(--navy)] transition-colors hover:border-[var(--orange)]">
                      <span className="text-[30px]" aria-hidden="true">{c.e}</span>{c.label}
                    </motion.button>
                  ))}
                </div>
                {i > 0 && <button onClick={back} className="mt-5 text-[14px] font-semibold text-[var(--muted)] underline underline-offset-4">← Question précédente</button>}
              </motion.div>
            ) : (
              <motion.div key="res" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <svg viewBox="0 0 220 130" className="mx-auto w-full max-w-[320px]" role="img" aria-label={`Score ${score} sur 40, niveau ${level.t}`}>
                  <defs><linearGradient id="gauge" x1="0" x2="1"><stop offset="0" stopColor="#1f9d63" /><stop offset=".5" stopColor="#f5a623" /><stop offset="1" stopColor="#c93a2b" /></linearGradient></defs>
                  <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="url(#gauge)" strokeWidth="18" strokeLinecap="round" />
                  <motion.g initial={{ rotate: -90 }} animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 50, damping: 9, delay: 0.2 }} style={{ originX: "110px", originY: "110px" }}>
                    <path d="M110 110 L110 34" stroke="#0f3e66" strokeWidth="5" strokeLinecap="round" />
                  </motion.g>
                  <circle cx="110" cy="110" r="9" fill="#0f3e66" />
                </svg>
                <p className="display -mt-1 text-[44px] text-[var(--navy)]">{score}<span className="text-[20px] text-[var(--muted)]"> / 40</span></p>
                <p className="display mt-1 text-[20px]" style={{ color: level.c }}>{level.t}</p>
                <p className="mx-auto mt-3 max-w-sm text-[17px] text-[var(--ink)]">{level.m}</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link href="/rejoindre" className="btn btn-sun">Parlons-en</Link>
                  <button onClick={reset} className="btn btn-line">Refaire</button>
                </div>
                <p className="mt-5 text-[12px] text-[var(--muted)]">Indicatif. Outil d’aide à la réflexion, pas une notation officielle.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── Pourquoi N&P : cartes retournables ───────── */
const WHY = [
  { t: "25 % annoncé d’avance", b: "Avant l’audit, pas après. Aucune surprise sur les règles du jeu.", i: "pie" },
  { t: "Zéro promesse creuse", b: "Ni financement, ni contrat que nous ne maîtrisons pas.", i: "shield" },
  { t: "Vous restez aux commandes", b: "Nous structurons avec vous. Nous ne vous remplaçons pas.", i: "wheel" },
  { t: "Preuves avant affirmations", b: "Chaque score repose sur des faits vérifiables.", i: "check" },
  { t: "Commission jamais cachée", b: "Toute rémunération est contractuelle et déclarée.", i: "eye" },
  { t: "Une équipe, trois pays", b: "Cameroun, Côte d’Ivoire, Bénin. Interlocuteurs locaux.", i: "globe" },
];

function WhyIcon({ k }: { k: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 3.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      {k === "pie" && <g {...p}><circle cx="32" cy="32" r="22" /><path d="M32 32V10M32 32l19 11" /></g>}
      {k === "shield" && <g {...p}><path d="M32 8l20 7v15c0 13-9 22-20 26C21 52 12 43 12 30V15z" /><path d="M23 31l7 7 12-14" /></g>}
      {k === "wheel" && <g {...p}><circle cx="32" cy="32" r="20" /><circle cx="32" cy="32" r="5" /><path d="M32 12v15M32 37v15M12 32h15M37 32h15" /></g>}
      {k === "check" && <g {...p}><rect x="12" y="10" width="40" height="44" rx="7" /><path d="M21 24l5 5 8-9M21 42h22" /></g>}
      {k === "eye" && <g {...p}><path d="M6 32C14 18 24 12 32 12s18 6 26 20c-8 14-18 20-26 20S14 46 6 32z" /><circle cx="32" cy="32" r="8" /></g>}
      {k === "globe" && <g {...p}><circle cx="32" cy="32" r="22" /><path d="M10 32h44M32 10c-9 9-9 35 0 44M32 10c9 9 9 35 0 44" /></g>}
    </svg>
  );
}

function FlipCard({ c, i }: { c: (typeof WHY)[number]; i: number }) {
  const [f, setF] = useState(false);
  return (
    <motion.button {...reveal} transition={{ ...reveal.transition, delay: i * 0.07 }} onClick={() => setF((x) => !x)} aria-pressed={f}
      className="relative h-[210px] w-full [perspective:1000px] text-left" aria-label={`${c.t}. ${f ? "Masquer" : "Voir"} le détail`}>
      <motion.div animate={{ rotateY: f ? 180 : 0 }} transition={{ type: "spring", stiffness: 70, damping: 14 }} className="relative h-full w-full [transform-style:preserve-3d]">
        <div className="absolute inset-0 flex flex-col justify-between rounded-[26px] bg-white p-6 shadow-[0_18px_40px_-22px_rgba(15,62,102,.5)] [backface-visibility:hidden]">
          <span className="text-[var(--orange)]"><WhyIcon k={c.i} /></span>
          <h3 className="text-[15px] leading-snug text-[var(--navy)]">{c.t}</h3>
          <span className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-[var(--mist)] text-[var(--navy)]" aria-hidden="true">+</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center rounded-[26px] p-6 text-[var(--navy-deep)] [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: "var(--sun)" }}>
          <p className="text-[19px] font-semibold leading-snug">{c.b}</p>
        </div>
      </motion.div>
    </motion.button>
  );
}

export function Why() {
  return (
    <section className="section bg-white" aria-labelledby="why">
      <div className="wrap">
        <motion.div {...reveal} className="text-center">
          <span className="eyebrow">Pourquoi nous</span>
          <h2 id="why" className="title">Six raisons<br />de nous faire confiance.</h2>
          <p className="mt-3 text-[var(--muted)]">Touchez une carte.</p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{WHY.map((c, i) => <FlipCard key={c.t} c={c} i={i} />)}</div>
      </div>
    </section>
  );
}

/* ───────── Communauté ───────── */
const TRIBES: { id: string; kind: PersonaKind; name: string; habits: string[] }[] = [
  { id: "artisans", kind: "artisan", name: "Artisans", habits: ["Je note mes ventes chaque semaine.", "Je connais mon prix de revient.", "Quelqu’un d’autre sait faire mon métier."] },
  { id: "tpe", kind: "commercante", name: "TPE", habits: ["Je sais si j’ai gagné de l’argent le mois dernier.", "Mon argent pro est séparé du mien.", "Mon registre (RCCM) est à jour."] },
  { id: "pme", kind: "fondateur", name: "PME", habits: ["Je suis un tableau de bord chaque semaine.", "Des responsables décident avec moi.", "Les accès numériques appartiennent à l’entreprise."] },
  { id: "partenaires", kind: "partenaire", name: "Partenaires", habits: ["Je cherche des PME mieux gérées.", "Je veux des données fiables.", "Je soutiens la transformation locale."] },
];

export function Community() {
  const [tab, setTab] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const t = TRIBES[tab];
  const n = t.habits.filter((_, k) => checked[`${t.id}-${k}`]).length;
  const C = 2 * Math.PI * 52;
  const msg = ["Cochez ce qui vous ressemble.", "Un bon début.", "Presque tout y est.", "Vous avez déjà les bons réflexes. Venez les faire grandir."][n];
  return (
    <section id="communaute" className="on-dark section grain overflow-hidden bg-[var(--navy-deep)]" aria-labelledby="com">
      <div className="wrap">
        <motion.div {...reveal} className="text-center">
          <span className="eyebrow">Communauté</span>
          <h2 id="com" className="title !text-white">Vous n’êtes pas seul(e).</h2>
        </motion.div>
        <div role="tablist" aria-label="Qui êtes-vous ?" className="mx-auto mt-10 flex max-w-[640px] justify-center gap-2 rounded-full bg-white/10 p-1.5">
          {TRIBES.map((x, k) => (
            <button key={x.id} role="tab" aria-selected={k === tab} onClick={() => setTab(k)}
              className="display relative flex-1 rounded-full px-2 py-3 text-[10px] tracking-[.1em] sm:text-[12px]" style={{ color: k === tab ? "var(--navy-deep)" : "#fff" }}>
              {k === tab && <motion.span layoutId="tribe" className="absolute inset-0 rounded-full" style={{ background: "var(--sun)" }} transition={{ type: "spring", stiffness: 300, damping: 28 }} />}
              <span className="relative">{x.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[320px_1fr]">
          <AnimatePresence mode="wait">
            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="relative mx-auto w-[240px] sm:w-[300px]">
              <Persona kind={t.kind} className="h-full w-full drop-shadow-2xl" />
              <div className="absolute -bottom-3 -right-3 grid h-[104px] w-[104px] place-items-center">
                <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90"><circle cx="60" cy="60" r="52" fill="#082a47" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
                  <motion.circle cx="60" cy="60" r="52" fill="none" stroke="#fadc2c" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - n / 3) }} transition={{ type: "spring", stiffness: 70, damping: 14 }} /></svg>
                <span className="display relative text-[22px] text-white">{n}/3</span>
              </div>
            </motion.div>
          </AnimatePresence>
          <div>
            <ul className="grid gap-3" aria-label={`Bonnes pratiques ${t.name}`}>
              {t.habits.map((h, k) => {
                const key = `${t.id}-${k}`;
                const on = !!checked[key];
                return (
                  <motion.li key={key} layout>
                    <button onClick={() => setChecked((c) => ({ ...c, [key]: !c[key] }))} aria-pressed={on}
                      className="flex min-h-[64px] w-full items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left text-[18px] transition-colors"
                      style={{ background: on ? "rgba(250,220,44,.14)" : "rgba(255,255,255,.06)", borderColor: on ? "var(--yellow)" : "rgba(255,255,255,.14)", color: "#fff" }}>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: on ? "var(--sun)" : "rgba(255,255,255,.15)" }}>
                        {on && <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#082a47" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><motion.path d="M5 12l5 5 9-10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} /></motion.svg>}
                      </span>
                      {h}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <p className="mt-6 text-[18px] text-[var(--yellow)]" aria-live="polite">{msg}</p>
            <div className="mt-5">
              <Link href={t.id === "partenaires" ? "/contact" : "/rejoindre"} className="btn btn-sun">{t.id === "partenaires" ? "Devenir partenaire" : "Rejoindre la communauté"}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Pays ───────── */
const OFFICES = [
  { code: "CM", name: "Cameroun", city: "Douala · Yaoundé", flag: "🇨🇲", bg: "#0f3e66" },
  { code: "CI", name: "Côte d’Ivoire", city: "Abidjan", flag: "🇨🇮", bg: "#1b5588" },
  { code: "BJ", name: "Bénin", city: "Cotonou", flag: "🇧🇯", bg: "#082a47" },
];

export function Offices() {
  return (
    <section id="pays" className="section bg-[var(--sand)]" aria-labelledby="pays-t">
      <div className="wrap">
        <motion.div {...reveal} className="text-center">
          <span className="eyebrow">Près de vous</span>
          <h2 id="pays-t" className="title">Trois pays.<br />Une équipe.</h2>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {OFFICES.map((o, i) => (
            <motion.article key={o.code} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }} whileHover={{ y: -8 }}
              className="relative overflow-hidden rounded-[30px] p-7 text-white" style={{ background: o.bg }}>
              <motion.span aria-hidden="true" className="absolute -right-10 -top-10 h-44 w-44 rounded-full" style={{ background: "var(--sun)", opacity: 0.9 }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 6, repeat: Infinity, delay: i }} />
              <span className="absolute -right-4 -top-4 h-28 w-28 rounded-full" style={{ background: o.bg }} aria-hidden="true" />
              <span className="relative text-[44px]" aria-hidden="true">{o.flag}</span>
              <h3 className="relative mt-6 text-[20px]">{o.name}</h3>
              <p className="relative text-white/70">{o.city}</p>
              <div className="relative mt-7 grid gap-2.5">
                <Link href={`/rejoindre?pays=${o.code}`} className="btn btn-sun !min-h-[46px]">Candidater</Link>
                <Link href={`/contact?pays=${o.code}`} className="btn btn-ghost !min-h-[46px]">Écrire au bureau</Link>
                <Link href={`/reclamation?pays=${o.code}`} className="text-center text-[13px] text-white/70 underline underline-offset-4">Faire une réclamation</Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Appel final ───────── */
export function FinalCta() {
  return (
    <section className="on-dark grain relative overflow-hidden bg-[var(--navy)] py-24 text-center">
      <motion.div {...reveal} className="wrap relative">
        <Roundel className="mx-auto h-28 w-28 sm:h-36 sm:w-36" />
        <h2 className="title mx-auto mt-8 max-w-xl !text-white">Plus aucune raison d’attendre.</h2>
        <p className="mx-auto mt-4 max-w-md text-white/75">5 minutes. Sans engagement. Une vraie personne vous répond.</p>
        <Link href="/rejoindre" className="btn btn-sun mt-9">Rejoindre N&amp;P</Link>
      </motion.div>
    </section>
  );
}
