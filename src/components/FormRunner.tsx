"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Field, FormDef } from "../lib/forms";
import { Roundel } from "./Logo";

type Vals = Record<string, string | string[]>;
type UFile = { id: string; name: string; size: number; status: "up" | "ok" | "err"; msg?: string; preview?: string };

const ICONS: Record<string, string> = {
  person: "M32 30a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 54c0-11 9-18 20-18s20 7 20 18",
  shop: "M8 26l5-14h38l5 14M10 26v28h44V26M26 54V38h12v16",
  compass: "M32 8a24 24 0 1 0 0 48 24 24 0 0 0 0-48zM40 24l-5 16-16 5 5-16z",
  paperclip: "M44 28L28 44a8 8 0 0 1-12-12l20-20a6 6 0 0 1 9 9L25 41",
  send: "M8 30L56 8 40 56 30 36zM30 36L56 8",
  megaphone: "M10 26v12h10l20 12V14L20 26zM48 22v20",
  chat: "M10 12h44v30H30l-12 10V42h-8z",
  folder: "M8 14h18l6 7h24v31H8z",
};
const Ico = ({ n, c = "h-6 w-6" }: { n: string; c?: string }) => (
  <svg viewBox="0 0 64 64" className={c} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[n] ?? ICONS.send} /></svg>
);

async function compress(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 700 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 1800, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
    if (blob && blob.size < file.size) return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {}
  return file;
}

export function FormRunner({ def, defaultCountry }: { def: FormDef; defaultCountry?: string }) {
  const draftKey = `np-draft-${def.id}`;
  const [vals, setVals] = useState<Vals>(() => (defaultCountry ? { country: defaultCountry } : ({} as Vals)));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, UFile[]>>({});
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const t0 = useRef(Date.now());
  const top = useRef<HTMLDivElement>(null);

  // Brouillon local (jamais les fichiers ni le consentement)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        setVals((v) => ({ ...d, ...v }));
      }
    } catch {}
  }, [draftKey, defaultCountry]);
  useEffect(() => {
    try { const { consent, ...rest } = vals as any; void consent; localStorage.setItem(draftKey, JSON.stringify(rest)); } catch {}
  }, [vals, draftKey]);

  const s = def.steps[step];
  const visible = (f: Field) => !f.showIf || vals[f.showIf.field] === f.showIf.equals;
  const set = (n: string, v: string | string[]) => { setVals((x) => ({ ...x, [n]: v })); setErrors((e) => { const { [n]: _, ...r } = e; void _; return r; }); };

  const validate = (st = s) => {
    const er: Record<string, string> = {};
    for (const f of st.fields) {
      if (!visible(f) || !f.required) continue;
      const v = f.type === "file" ? (files[f.name] ?? []).filter((x) => x.status === "ok").map((x) => x.id) : vals[f.name];
      const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      if (empty) er[f.name] = f.type === "file" ? "Ajoutez au moins un fichier" : "Champ requis";
      else if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(String(v))) er[f.name] = "E-mail invalide";
      else if (f.type === "tel" && !/^[+()\d\s.\-]{6,30}$/.test(String(v))) er[f.name] = "Numéro invalide";
    }
    if (st.fields.some((f) => f.type === "file" && (files[f.name] ?? []).some((x) => x.status === "up"))) er._upload = "Patientez, envoi des fichiers en cours…";
    return er;
  };

  const go = (n: number) => { setStep(n); setBanner(""); requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const next = () => {
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) { setBanner(er._upload ?? "Merci de corriger les champs en rouge."); return; }
    go(step + 1);
  };

  const addFiles = async (f: Field, list: FileList | null) => {
    if (!list?.length) return;
    const have = (files[f.name] ?? []).filter((x) => x.status !== "err").length;
    const picked = Array.from(list).slice(0, Math.max(0, (f.maxFiles ?? 3) - have));
    for (const raw of picked) {
      const tmp = Math.random().toString(36).slice(2);
      const prev = raw.type.startsWith("image/") ? URL.createObjectURL(raw) : undefined;
      setFiles((x) => ({ ...x, [f.name]: [...(x[f.name] ?? []), { id: tmp, name: raw.name, size: raw.size, status: "up", preview: prev }] }));
      const upd = (patch: Partial<UFile>) => setFiles((x) => ({ ...x, [f.name]: (x[f.name] ?? []).map((u) => (u.id === tmp ? { ...u, ...patch } : u)) }));
      try {
        const file = await compress(raw);
        if (file.size > 4 * 1024 * 1024) { upd({ status: "err", msg: "Plus de 4 Mo" }); continue; }
        const fd = new FormData(); fd.append("file", file);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const j = await r.json();
        if (j.ok) upd({ id: j.id, name: j.name, size: j.size, status: "ok" }); else upd({ status: "err", msg: j.error });
      } catch { upd({ status: "err", msg: "Échec de l’envoi" }); }
    }
  };

  const submit = async () => {
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) { setBanner(er._upload ?? "Merci de corriger les champs en rouge."); return; }
    setBusy(true); setBanner("");
    const body: Record<string, unknown> = { ...vals, _t: Date.now() - t0.current, _hp: "" };
    for (const st of def.steps) for (const f of st.fields) if (f.type === "file") body[f.name] = (files[f.name] ?? []).filter((x) => x.status === "ok").map((x) => x.id);
    try {
      const r = await fetch(`/api/forms/${def.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (j.ok) { try { localStorage.removeItem(draftKey); } catch {} setDone(j.ref); }
      else {
        setBanner(j.error ?? "Une erreur est survenue.");
        if (j.fields) {
          setErrors(j.fields);
          const idx = def.steps.findIndex((st) => st.fields.some((f) => j.fields[f.name]));
          if (idx >= 0) go(idx);
        }
      }
    } catch { setBanner("Connexion impossible. Vos réponses sont conservées, réessayez."); }
    setBusy(false);
  };

  const last = step === def.steps.length - 1;
  const pct = useMemo(() => Math.round(((step + 1) / def.steps.length) * 100), [step, def.steps.length]);

  if (done) return <Success refNo={done} form={def.id} />;

  return (
    <div ref={top} className="scroll-mt-24">
      {def.steps.length > 1 && (
        <nav aria-label="Étapes" className="mb-8">
          <ol className="flex items-center justify-between gap-1">
            {def.steps.map((st, i) => (
              <li key={st.id} className="flex flex-1 flex-col items-center gap-1.5">
                <button type="button" disabled={i > step} onClick={() => go(i)} aria-current={i === step ? "step" : undefined}
                  className="grid h-12 w-12 place-items-center rounded-full transition-all"
                  style={{ background: i <= step ? "var(--sun)" : "var(--mist)", color: i <= step ? "var(--navy-deep)" : "var(--muted)", transform: i === step ? "scale(1.12)" : "none", boxShadow: i === step ? "0 8px 20px -6px rgba(233,123,2,.7)" : "none" }}>
                  {i < step ? <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg> : <Ico n={st.icon} />}
                </button>
                <span className="hidden text-[12px] font-semibold text-[var(--navy)] sm:block">{st.title}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--mist)]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div className="h-full rounded-full" style={{ background: "var(--sun)" }} animate={{ width: `${pct}%` }} />
          </div>
        </nav>
      )}

      <form onSubmit={(e) => { e.preventDefault(); last ? submit() : next(); }} noValidate>
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <AnimatePresence mode="wait">
          <motion.fieldset key={s.id} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.25 }} className="m-0 grid min-w-0 gap-6 border-0 p-0">
            <legend className="mb-1 p-0">
              <span className="display block text-[22px] text-[var(--navy)] sm:text-[26px]">{s.title}</span>
              {s.subtitle && <span className="mt-1 block text-[16px] text-[var(--muted)]">{s.subtitle}</span>}
            </legend>
            {s.fields.filter(visible).map((f) => (
              <FieldView key={f.name} f={f} v={vals[f.name]} err={errors[f.name]} onChange={(v) => set(f.name, v)} files={files[f.name] ?? []} onFiles={(l) => addFiles(f, l)}
                onRemove={(id) => setFiles((x) => ({ ...x, [f.name]: (x[f.name] ?? []).filter((u) => u.id !== id) }))} />
            ))}
          </motion.fieldset>
        </AnimatePresence>

        {s.fields.some((f) => f.name === "consent") && (
          <p className="mt-5 text-[15px] text-[var(--muted)]">Vos données sont traitées par le bureau de votre pays, sans publicité ni revente. <Link href="/confidentialite" target="_blank" className="font-semibold text-[var(--navy)] underline underline-offset-4">Lire la politique de confidentialité</Link></p>
        )}

        {banner && <p role="alert" className="mt-6 rounded-2xl bg-[#fde4e1] px-4 py-3 font-semibold text-[#a3281b]">{banner}</p>}

        <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-[var(--line)] bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          {step > 0 ? <button type="button" onClick={() => go(step - 1)} className="btn btn-line">← Retour</button> : <span />}
          <button type="submit" disabled={busy} className="btn btn-sun min-w-[160px]">{busy ? "Envoi…" : last ? def.submitLabel : "Continuer →"}</button>
        </div>
      </form>
    </div>
  );
}

function FieldView({ f, v, err, onChange, files, onFiles, onRemove }: {
  f: Field; v: string | string[] | undefined; err?: string; onChange: (v: string | string[]) => void;
  files: UFile[]; onFiles: (l: FileList | null) => void; onRemove: (id: string) => void;
}) {
  const id = `f-${f.name}`;
  const label = (
    <label htmlFor={f.type === "radio" || f.type === "multi" || f.type === "file" ? undefined : id} className="field-label">
      {f.label}{f.required && <span className="text-[var(--orange)]" aria-hidden="true"> *</span>}
    </label>
  );
  const e = err ? <p className="err" role="alert">{err}</p> : null;
  const common = { id, name: f.name, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-e` : undefined } as const;

  if (f.type === "text" || f.type === "email" || f.type === "tel")
    return <div>{label}<input {...common} type={f.type} inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined} autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : f.name === "fullName" ? "name" : "off"} className="input" value={(v as string) ?? ""} placeholder={f.placeholder} maxLength={f.maxLength} onChange={(x) => onChange(x.target.value)} />{e}</div>;
  if (f.type === "textarea")
    return <div>{label}<textarea {...common} className="input" value={(v as string) ?? ""} maxLength={f.maxLength} onChange={(x) => onChange(x.target.value)} />{f.maxLength && <p className="field-hint text-right">{((v as string) ?? "").length} / {f.maxLength}</p>}{e}</div>;
  if (f.type === "select")
    return <div>{label}<select {...common} className="input" value={(v as string) ?? ""} onChange={(x) => onChange(x.target.value)}><option value="">Choisir…</option>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{e}</div>;
  if (f.type === "radio")
    return (
      <div role="radiogroup" aria-label={f.label}>{label}
        <div className={`grid gap-3 ${f.options!.some((o) => o.hint) ? "grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))]" : "grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))]"}`}>
          {f.options!.map((o) => {
            const on = v === o.value;
            return (
              <motion.button type="button" key={o.value} role="radio" aria-checked={on} whileTap={{ scale: 0.96 }} onClick={() => onChange(o.value)}
                className="flex min-h-[58px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-colors"
                style={{ borderColor: on ? "var(--orange)" : "var(--line)", background: on ? "#fff7ec" : "#fff", color: "var(--navy)" }}>
                {o.icon && <span className="text-[24px]" aria-hidden="true">{o.icon}</span>}
                <span className="flex-1 leading-tight">{o.label}{o.hint && <span className="block text-[13px] font-normal text-[var(--muted)]">{o.hint}</span>}</span>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: on ? "var(--orange)" : "var(--line)", background: on ? "var(--orange)" : "transparent" }}>{on && <span className="h-2 w-2 rounded-full bg-white" />}</span>
              </motion.button>
            );
          })}
        </div>{e}
      </div>
    );
  if (f.type === "multi") {
    const arr = (v as string[]) ?? [];
    return (
      <div role="group" aria-label={f.label}>{label}
        <div className="flex flex-wrap gap-2.5">
          {f.options!.map((o) => {
            const on = arr.includes(o.value);
            return (
              <motion.button type="button" key={o.value} aria-pressed={on} whileTap={{ scale: 0.94 }} onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                className="min-h-[48px] rounded-full border-2 px-5 font-semibold transition-colors" style={{ borderColor: on ? "var(--orange)" : "var(--line)", background: on ? "var(--sun)" : "#fff", color: "var(--navy)" }}>
                {on && "✓ "}{o.label}
              </motion.button>
            );
          })}
        </div>{e}
      </div>
    );
  }
  // file
  const room = (f.maxFiles ?? 3) - files.filter((x) => x.status !== "err").length;
  return (
    <div>{label}
      {room > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--navy)]/35 bg-[var(--mist)] p-4 text-center font-semibold text-[var(--navy)] transition-colors hover:border-[var(--orange)]">
            <Ico n="folder" c="h-7 w-7" />Choisir un fichier
            <input type="file" className="sr-only" multiple accept="application/pdf,image/jpeg,image/png,image/webp,.docx,.xlsx" onChange={(x) => { onFiles(x.target.files); x.target.value = ""; }} />
          </label>
          <label className="flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--navy)]/35 bg-[var(--mist)] p-4 text-center font-semibold text-[var(--navy)] transition-colors hover:border-[var(--orange)]">
            <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 20h12l4-8h16l4 8h12v32H8z" /><circle cx="32" cy="35" r="10" /></svg>Prendre une photo
            <input type="file" className="sr-only" accept="image/*" capture="environment" onChange={(x) => { onFiles(x.target.files); x.target.value = ""; }} />
          </label>
        </div>
      )}
      <p className="field-hint">PDF, photo, Word ou Excel · 4 Mo max · {f.maxFiles} fichier(s) max</p>
      <ul className="mt-3 grid gap-2">
        {files.map((u) => (
          <li key={u.id} className="flex items-center gap-3 rounded-2xl bg-[var(--mist)] p-2.5 pr-3">
            {u.preview ? <img src={u.preview} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-[var(--navy)]"><Ico n="paperclip" /></span>}
            <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold text-[var(--navy)]">{u.name}</span>
              <span className="block text-[13px]" style={{ color: u.status === "err" ? "var(--danger)" : "var(--muted)" }}>{u.status === "up" ? "Envoi en cours…" : u.status === "err" ? u.msg : `${Math.max(1, Math.round(u.size / 1024))} Ko · envoyé ✓`}</span></span>
            <button type="button" onClick={() => onRemove(u.id)} className="grid h-10 w-10 place-items-center rounded-full text-[var(--muted)] hover:bg-white" aria-label={`Retirer ${u.name}`}>✕</button>
          </li>
        ))}
      </ul>{e}
    </div>
  );
}

function Success({ refNo, form }: { refNo: string; form: string }) {
  const [copied, setCopied] = useState(false);
  const msg: Record<string, string> = {
    enrolement: "Bienvenue dans l’univers N&P. Un e-mail de confirmation vous attend.",
    reclamation: "Votre réclamation est enregistrée. Une personne de l’équipe la lit.",
    contact: "Votre message est parti. Réponse sous 3 jours ouvrés.",
    documents: "Vos pièces sont bien dans votre dossier.",
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
      <div className="relative mx-auto h-36 w-36">
        {[0, 1, 2].map((i) => <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-[var(--yellow)]" initial={{ scale: 0.8, opacity: 0.8 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8 }} />)}
        <motion.div initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 80, damping: 12 }}><Roundel className="h-36 w-36" /></motion.div>
      </div>
      <h2 className="display mt-8 text-[26px] text-[var(--navy)]">C’est envoyé !</h2>
      <p className="mx-auto mt-3 max-w-md text-[18px] text-[var(--muted)]">{msg[form]}</p>
      <div className="mx-auto mt-7 max-w-sm rounded-2xl border-l-4 border-[var(--orange)] bg-[#fff7ec] p-5 text-left">
        <p className="text-[14px] text-[var(--muted)]">Votre numéro de dossier</p>
        <p className="display text-[19px] tracking-[.08em] text-[var(--navy)]">{refNo}</p>
        <button onClick={() => { navigator.clipboard?.writeText(refNo); setCopied(true); }} className="mt-2 text-[14px] font-semibold text-[var(--orange)] underline underline-offset-4">{copied ? "Copié ✓" : "Copier"}</button>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {form !== "documents" && form !== "contact" && <Link href="/documents" className="btn btn-sun">Envoyer des pièces</Link>}
        <Link href="/" className="btn btn-line">Retour à l’accueil</Link>
      </div>
    </motion.div>
  );
}
