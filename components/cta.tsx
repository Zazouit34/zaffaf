"use client";

import { Container } from "@/components/container";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 md:py-32 bg-primary">
      <Container>
        <div className="text-center max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-nunito mb-6 text-white">
            Prêt à Trouver le Lieu de Mariage de Vos Rêves ?
          </h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Rejoignez des milliers de couples qui ont trouvé leur lieu idéal et planifié leur mariage de rêve avec Zaffaf.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6">
            <Link href="/login">Commencer Maintenant</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
} 