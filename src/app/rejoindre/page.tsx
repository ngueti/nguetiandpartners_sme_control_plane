import type { Metadata } from "next";
import { FormShell } from "../../components/FormShell";

export const metadata: Metadata = { title: "Rejoindre" };

export default function Page({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  return <FormShell id="enrolement" persona="entrepreneure" searchParams={searchParams} />;
}
