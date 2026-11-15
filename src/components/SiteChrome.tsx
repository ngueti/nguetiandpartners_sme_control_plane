"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/#parcours", label: "Parcours" },
  { href: "/#cent-jours", label: "100 jours" },
  { href: "/#diagnostic", label: "Diagnostic" },
  { href: "/#communaute", label: "Communauté" },
  { href: "/#pays", label: "Pays" },
];

export function Header({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = scrolled || open || !dark;
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{ background: solid ? "rgba(255,255,255,.94)" : "transparent", backdropFilter: solid ? "blur(14px)" : "none", boxShadow: solid ? "0 1px 0 var(--line)" : "none" }}
    >
      <div className="wrap flex h-[68px] items-center justify-between">
        <Link href="/" aria-label="Ngueti & Partners — accueil" className="block h-10 w-[118px] sm:w-[150px]">
          <Logo className="h-full w-full" tone={solid ? "color" : "light"} />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="display text-[11px] tracking-[.16em] transition-colors hover:text-[var(--orange)]" style={{ color: solid ? "var(--navy)" : "#fff" }}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/rejoindre" className="btn btn-sun !min-h-[44px] !px-5 !text-[11px]">Rejoindre</Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-full lg:hidden"
            style={{ background: solid ? "var(--mist)" : "rgba(255,255,255,.16)" }}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-5">
              <span className="absolute left-0 top-0 h-[2.5px] w-5 rounded transition-transform" style={{ background: solid ? "var(--navy)" : "#fff", transform: open ? "translateY(5px) rotate(45deg)" : "none" }} />
              <span className="absolute bottom-0 left-0 h-[2.5px] w-5 rounded transition-transform" style={{ background: solid ? "var(--navy)" : "#fff", transform: open ? "translateY(-5px) rotate(-45deg)" : "none" }} />
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white lg:hidden" aria-label="Menu mobile"
          >
            <div className="wrap grid gap-1 pb-6 pt-2">
              {[...NAV, { href: "/reclamation", label: "Réclamation" }, { href: "/contact", label: "Contact" }].map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="display rounded-2xl px-4 py-4 text-[13px] text-[var(--navy)] active:bg-[var(--mist)]">
                  {n.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-[var(--navy-deep)] pb-10 pt-16 text-white">
      <div className="wrap grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo tone="light" className="h-14 w-auto max-w-full" />
          <p className="mt-5 max-w-sm text-[15px] text-white/70">Architecturer. Co-construire. Orchestrer. Institutionnaliser. Changer d’échelle.</p>
        </div>
        <nav aria-label="Liens utiles" className="grid content-start gap-3 text-[15px]">
          <span className="display text-[11px] tracking-[.2em] text-[var(--yellow)]">Agir</span>
          <Link href="/rejoindre" className="hover:text-[var(--yellow)]">Rejoindre le programme</Link>
          <Link href="/documents" className="hover:text-[var(--yellow)]">Envoyer mes pièces</Link>
          <Link href="/reclamation" className="hover:text-[var(--yellow)]">Faire une réclamation</Link>
          <Link href="/contact" className="hover:text-[var(--yellow)]">Nous contacter</Link>
        </nav>
        <nav aria-label="Bureaux" className="grid content-start gap-3 text-[15px]">
          <span className="display text-[11px] tracking-[.2em] text-[var(--yellow)]">Bureaux</span>
          <Link href="/contact?pays=CM" className="hover:text-[var(--yellow)]">🇨🇲 Cameroun</Link>
          <Link href="/contact?pays=CI" className="hover:text-[var(--yellow)]">🇨🇮 Côte d’Ivoire</Link>
          <Link href="/contact?pays=BJ" className="hover:text-[var(--yellow)]">🇧🇯 Bénin</Link>
        </nav>
      </div>
      <div className="wrap mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 text-[13px] text-white/55">
        <span>© {new Date().getFullYear()} Ngueti &amp; Partners™ · N&amp;P SME Control Plane™</span>
        <span className="flex gap-5">
          <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
          <Link href="/admin" className="hover:text-white">Espace équipe</Link>
        </span>
      </div>
    </footer>
  );
}
