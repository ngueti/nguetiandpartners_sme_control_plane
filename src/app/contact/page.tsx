import type { Metadata } from "next";
import { FormShell } from "../../components/FormShell";

export const metadata: Metadata = { title: "Contact" };

export default function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  return <FormShell id="contact" persona="commercante" searchParams={searchParams} />;
}
