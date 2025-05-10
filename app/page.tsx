import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      </main>
  );
}
