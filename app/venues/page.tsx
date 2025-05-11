"use client";

import { searchWeddingVenues, getCities } from '@/app/services/googlePlacesService';
import { VenueCard } from "@/components/venue-card";
import { AppLayout } from "@/components/app-layout";
import { Suspense } from 'react';
import VenuesSkeleton from '@/components/venues-skeleton';

// This enables static site generation with dynamic data
export const revalidate = 3600; // Revalidate every hour

export default async function VenuesPage({ searchParams }: { searchParams: { city?: string } }) {
  const cities = await getCities();
  const selectedCity = searchParams.city || 'algiers';
  
  return (
    <AppLayout requireAuth={true}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif mb-2">Lieux de Mariage</h1>
        <p className="text-muted-foreground">
          Découvrez les meilleurs lieux de mariage en Algérie
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <a
              key={city.id}
              href={`/venues?city=${city.id}`}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCity === city.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {city.name}
            </a>
          ))}
        </div>
      </div>
      
      <Suspense fallback={<VenuesSkeleton />}>
        <VenuesGrid city={selectedCity} />
      </Suspense>
    </AppLayout>
  );
}

// This component will be rendered with Suspense
async function VenuesGrid({ city }: { city: string }) {
  const venues = await searchWeddingVenues(city);
  
  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucun lieu de mariage trouvé dans cette région. Veuillez essayer une autre ville.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          id={venue.id}
          name={venue.name}
          address={venue.address}
          rating={venue.rating}
          price={venue.price}
          image={venue.image}
        />
      ))}
    </div>
  );
} 