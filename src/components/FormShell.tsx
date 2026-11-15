import { Header, Footer } from "./SiteChrome";
import { FormRunner } from "./FormRunner";
import { Persona, type PersonaKind } from "./Illustrations";
import { FORMS } from "../lib/forms";
import type { FormId } from "../lib/config";

export async function FormShell({ id, persona, searchParams }: { id: FormId; persona: PersonaKind; searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams;
  const def = FORMS[id];
  const country = ["CM", "CI", "BJ"].includes(pays ?? "") ? pays : undefined;
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--mist)] pb-20 pt-[68px]">
        <div className="grain relative overflow-hidden bg-[var(--navy)] pb-24 pt-12 text-white">
          <div className="wrap flex items-center gap-6">
            <Persona kind={persona} className="h-24 w-24 shrink-0 sm:h-32 sm:w-32" />
            <div>
              <span className="eyebrow">N&amp;P SME Control Plane™</span>
              <h1 className="mt-3 text-[clamp(24px,5.5vw,44px)] text-white">{def.title}</h1>
            </div>
          </div>
        </div>
        <div className="wrap -mt-14 max-w-[760px]">
          <div className="card p-5 sm:p-10">
            <p className="mb-8 text-[17px] text-[var(--muted)]">{def.intro}</p>
            <FormRunner def={def} defaultCountry={country} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
