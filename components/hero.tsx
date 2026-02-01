"use client";

import { Container } from "@/components/container";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative pt-28 pb-16 md:pt-32 md:pb-24">
      <Container>
        {/* Hero for desktop */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl hidden sm:block">
          {/* Background with overlay */}
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10 rounded-2xl" />
            <Image
              src="/images/zaffaf-landing.png"
              alt="Lieu de Mariage"
              width={1920}
              height={1080}
              className="object-cover h-full w-full rounded-2xl"
            />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 z-20 flex items-center">
            <Container>
              <div className="text-center max-w-4xl mx-auto px-4">
                <h1 className="font-nunito text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
                  Trouvez Votre <span className="text-primary">Lieu de Mariage Parfait</span>
                </h1>
                <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
                  Découvrez de magnifiques lieux de mariage et d'événements avec des avis honnêtes et connectez-vous facilement avec tous les services dont vous avez besoin pour votre jour spécial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "600ms" }}>
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/venues">Explorer les Lieux</Link>
                  </Button>
                  <Button size="lg" className="text-lg px-8" variant="outline" asChild>
                    <Link href="/dashboard">Trouver des Services</Link>
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>

        {/* Hero for mobile */}
        <div className="block sm:hidden">
          <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8">
            {/* Background with overlay - shorter for mobile */}
            <div className="relative aspect-[4/3]">
              <div className="absolute inset-0 z-10 rounded-2xl" />
              <Image
                src="/images/zaffaf-landing.png"
                alt="Lieu de Mariage"
                width={800}
                height={600}
                className="object-cover h-full w-full rounded-2xl"
              />
            </div>
          </div>
          
          {/* Content below image for mobile */}
          <div className="text-center px-4">
            <h1 className="font-nunito font-bold text-3xl mb-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
              Trouvez Votre <span className="text-primary">Lieu de Mariage Parfait</span>
            </h1>
            <p className="text-gray-700 mb-6 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
              Découvrez de magnifiques lieux de mariage avec des avis honnêtes et connectez-vous avec tous les services dont vous avez besoin.
            </p>
            <div className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "600ms" }}>
              <Button size="lg" asChild>
                <Link href="/venues">Explorer les Lieux</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Trouver des Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
} 