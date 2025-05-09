"use client";

import { Container } from "@/components/container";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
              alt="Wedding Venue"
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
        </div>

        {/* Hero for mobile */}
        <div className="block sm:hidden">
          <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8">
            {/* Background with overlay - shorter for mobile */}
            <div className="relative aspect-[4/3]">
              <div className="absolute inset-0 z-10 rounded-2xl" />
              <Image
                src="/images/zaffaf-landing.png"
                alt="Wedding Venue"
                width={800}
                height={600}
                className="object-cover h-full w-full rounded-2xl"
              />
            </div>
          </div>
          
          {/* Content below image for mobile */}
          <div className="text-center px-4">
            <h1 className="font-nunito font-bold text-3xl mb-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
              Find Your Perfect <span className="text-primary">Wedding Venue</span>
            </h1>
            <p className="text-gray-700 mb-6 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
              Discover beautiful wedding venues with honest reviews and connect with all services you need.
            </p>
            <div className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "600ms" }}>
              <Button size="lg">
                Explore Venues
              </Button>
              <Button size="lg" variant="outline">
                Find Services
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
} 