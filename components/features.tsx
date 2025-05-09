"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Container } from "@/components/container";
import { MaskedImage } from "@/components/ui/masked-image";
import { MaskedImageVariant } from "@/components/ui/masked-image";

const features = [
  {
    title: "Find the Perfect Venue",
    description:
      "Explore a curated selection of stunning wedding and event venues from around the world. Filter by location, capacity, style, and price to find the perfect match for your special day.",
    image: "/images/zaffaf-landing.png",
    alt: "Venue search interface",
    variant: "shape3" as MaskedImageVariant,
  },
  {
    title: "Read Authentic Reviews",
    description:
      "Make informed decisions with honest reviews from real couples. See photos, ratings, and detailed feedback to ensure the venue meets your expectations before booking.",
    image: "/images/zaffaf-landing.png",
    alt: "Couple reading venue reviews",
    variant: "shape1" as MaskedImageVariant,
  },
  {
    title: "Book Essential Services",
    description:
      "From caterers and photographers to florists and entertainers, easily browse and book all the services you need to make your wedding day perfect, all in one place.",
    image: "/images/zaffaf-landing.png",
    alt: "Wedding service providers",
    variant: "shape6" as MaskedImageVariant,
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <Container>
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold font-nunito mb-6">
            How Zaffaf Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We make planning your wedding simple and stress-free with our comprehensive platform.
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