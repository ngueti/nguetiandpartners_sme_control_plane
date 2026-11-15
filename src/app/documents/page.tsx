import type { Metadata } from "next";
import { FormShell } from "../../components/FormShell";

export const metadata: Metadata = { title: "Pièces" };

export default function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  return <FormShell id="documents" persona="artisan" searchParams={searchParams} />;
}
