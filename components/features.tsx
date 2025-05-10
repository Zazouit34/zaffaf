"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Container } from "@/components/container";
import { MaskedImage } from "@/components/ui/masked-image";
import { MaskedImageVariant } from "@/components/ui/masked-image";

const features = [
  {
    title: "Trouvez le Lieu Parfait",
    description:
      "Explorez une sélection soignée de lieux de mariage et d'événements à travers l'Algerie. Filtrez par lieu, capacité, style et prix pour trouver l'endroit idéal pour votre journée spéciale.",
    image: "/images/image-venue-landing.png",
    alt: "Interface de recherche de lieux",
    variant: "shape1" as MaskedImageVariant,
  },
  {
    title: "Lisez des Avis Authentiques",
    description:
      "Prenez des décisions éclairées grâce à des avis honnêtes de vrais couples. Consultez les photos, les évaluations et les commentaires détaillés pour vous assurer que le lieu répond à vos attentes avant de réserver.",
    image: "/images/hero-image-zaffaf.png",
    alt: "Couple lisant des avis sur les lieux",
    variant: "shape6" as MaskedImageVariant,
  },
  {
    title: "Réservez des Services Essentiels",
    description:
      "Des traiteurs aux photographes, en passant par les fleuristes et les animateurs, parcourez et réservez facilement tous les services nécessaires pour rendre votre journée de mariage parfaite, le tout au même endroit.",
    image: "/images/service-zeffaf.jpeg",
    alt: "Prestataires de services de mariage",
    variant: "shape4" as MaskedImageVariant,
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-32 ">
      <Container>
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold font-nunito mb-6">
            Comment Fonctionne Zaffaf
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Nous rendons la planification de votre mariage simple et sans stress grâce à notre plateforme complète.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              title={feature.title}
              description={feature.description}
              image={feature.image}
              alt={feature.alt}
              variant={feature.variant}
              reversed={index % 2 === 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

interface FeatureItemProps {
  title: string;
  description: string;
  image: string;
  alt: string;
  variant: MaskedImageVariant;
  reversed: boolean;
}

function FeatureItem({
  title,
  description,
  image,
  alt,
  variant,
  reversed,
}: FeatureItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${
        reversed ? "md:grid-flow-dense" : ""
      }`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(50px)",
        transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.2s",
      }}
    >
      <div className={reversed ? "md:col-start-2" : ""}>
        <h3 className="text-2xl md:text-4xl font-bold font-nunito mb-6">
          {title}
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          {description}
        </p>
      </div>

      <div className={reversed ? "md:col-start-1" : ""}>
        <div className="relative mx-auto max-w-sm md:max-w-none">
          <MaskedImage
            src={image}
            alt={alt}
            width={600}
            height={400}
            variant={variant}
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  );
} 