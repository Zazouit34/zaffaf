"use client";

import { useState, useMemo } from "react";
import { VenueCard } from "@/components/venue-card";
import { AppLayout } from "@/components/app-layout";
import { Venue } from "@/app/actions/venues";
import { CityFilter } from "@/components/city-filter";

interface VenuesClientPageProps {
  venues: Venue[];
}

export function VenuesClientPage({ venues }: VenuesClientPageProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Extract unique cities from venues
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    venues.forEach((venue) => {
      if (venue.city) {
        citySet.add(venue.city);
      }
    });
    return Array.from(citySet);
  }, [venues]);

  // Filter venues by selected city
  const filteredVenues = useMemo(() => {
    if (!selectedCity) return venues;
    return venues.filter((venue) => venue.city === selectedCity);
  }, [venues, selectedCity]);

  return (
    <AppLayout requireAuth={true}>
      <h1 className="text-3xl font-bold mb-6 font-serif">Lieux de Mariage</h1>
      <p className="text-muted-foreground mb-8">
        Trouvez le lieu parfait pour votre jour spécial. Parcourez notre sélection de lieux de mariage premium.
      </p>
      
      {/* City filter */}
      <CityFilter 
        cities={cities} 
        selectedCity={selectedCity} 
        onCityChange={setSelectedCity} 
      />
      
      {/* Display count of venues */}
      <p className="text-sm text-muted-foreground mb-4">
        {filteredVenues.length} {filteredVenues.length === 1 ? 'lieu trouvé' : 'lieux trouvés'}
        {selectedCity ? ` à ${selectedCity}` : ''}
      </p>
      
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} {...venue} />
          ))}
        </div>
      ) : (
        <p className="text-center py-10">Aucun lieu trouvé. Veuillez réessayer plus tard.</p>
      )}
    </AppLayout>
  );
} 