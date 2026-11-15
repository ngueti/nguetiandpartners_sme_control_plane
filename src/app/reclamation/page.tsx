import type { Metadata } from "next";
import { FormShell } from "../../components/FormShell";

export const metadata: Metadata = { title: "Réclamation" };

export default function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  return <FormShell id="reclamation" persona="partenaire" searchParams={searchParams} />;
}
