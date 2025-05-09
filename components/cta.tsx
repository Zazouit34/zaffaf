"use client";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 bg-primary">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-nunito mb-4 text-white">
            Ready to Find Your Dream Wedding Venue?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of couples who have found their perfect venue and planned their dream wedding with Zaffaf.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            Get Started Now
          </Button>
        </div>
      </Container>
    </section>
  );
} 