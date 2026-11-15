import { NextResponse } from "next/server";
import { FORM_IDS, type FormId } from "../../../../lib/config";
import { ipHash, tooMany } from "../../../../lib/security";
import { submitForm } from "../../../../lib/submit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request, ctx: { params: Promise<{ form: string }> }) {
  const { form } = await ctx.params;
  if (!FORM_IDS.includes(form as FormId)) return NextResponse.json({ ok: false, error: "Formulaire inconnu" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  // Pot de miel + durée minimale de remplissage (anti-robots)
  if (body?._hp) return NextResponse.json({ ok: true, ref: "NP-OK" });
  if (typeof body?._t === "number" && body._t < 2500) return NextResponse.json({ ok: false, error: "Merci de prendre quelques secondes pour relire." }, { status: 429 });

  const ip = ipHash(req.headers);
  if (await tooMany("submissions", ip, 60, 10)) return NextResponse.json({ ok: false, error: "Trop de demandes. Réessayez dans une heure." }, { status: 429 });

  const { _hp, _t, ...data } = body ?? {};
  void _hp; void _t;
  try {
    const res = await submitForm(form as FormId, data, { ipHash: ip, userAgent: req.headers.get("user-agent") ?? "" });
    return NextResponse.json(res, { status: res.ok ? 200 : 422 });
  } catch (e) {
    console.error("submit error", e);
    return NextResponse.json({ ok: false, error: "Erreur technique, merci de réessayer." }, { status: 500 });
  }
}
