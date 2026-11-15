import { Header, Footer } from "../components/SiteChrome";
import { Hero } from "../components/home/Hero";
import { Marquee, Verbs, Journey, Dial } from "../components/home/Story";
import { Diagnostic, Why, Community, Offices, FinalCta } from "../components/home/Interactive";

export default function Home() {
  return (
    <>
      <Header dark />
      <main>
        <Hero />
        <Marquee />
        <Verbs />
        <Journey />
        <Dial />
        <Diagnostic />
        <Why />
        <Community />
        <Offices />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
