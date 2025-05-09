"use client";

import { Container } from "@/components/container";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
        <div className="relative h-full w-full">
          <Image
            src="/images/hero-image-zaffaf.png"
            alt="Wedding Venue"
            width={1920}
            height={1080}
            className="object-cover h-full w-full"
          />
        </div>
      </div>

      <Container className="relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-nunito text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            Find Your Perfect <span className="text-primary">Wedding Venue</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
            Discover beautiful wedding and event venues with honest reviews and easily connect with all the services you need for your special day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "600ms" }}>
            <Button size="lg" className="text-lg px-8">
              Explore Venues
            </Button>
            <Button size="lg" className="text-lg px-8" variant="outline">
              Find Services
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
} 