"use client";

import { useState, useMemo, useEffect } from "react";
import { VenueCard } from "@/components/venue-card";
import { AppLayout } from "@/components/app-layout";
import { Venue } from "@/app/actions/venues";
import { CityFilter } from "@/components/city-filter";

interface VenuesClientPageProps {
  venues: Venue[];
}

export function VenuesClientPage({ venues }: VenuesClientPageProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues);

  // Extract unique cities from venues with proper error handling
  const cities = useMemo(() => {
    console.log(`Extracting cities from ${venues.length} venues`);
    const citySet = new Set<string>();
    
    venues.forEach((venue) => {
      if (venue.city && venue.city.trim()) {
        citySet.add(venue.city.trim());
      }
    });
    
    const sortedCities = Array.from(citySet).sort();
    console.log(`Extracted ${sortedCities.length} unique cities: ${sortedCities.join(', ')}`);
    return sortedCities;
  }, [venues]);

  // Filter venues by selected city
  useEffect(() => {
    if (!selectedCity) {
      setFilteredVenues(venues);
      console.log(`Showing all ${venues.length} venues`);
    } else {
      console.log(`Filtering for city: ${selectedCity}`);
      
      const filtered = venues.filter((venue) => 
        venue.city && venue.city.toLowerCase() === selectedCity.toLowerCase()
      );
      
      console.log(`Found ${filtered.length} venues in ${selectedCity}`);
      setFilteredVenues(filtered);
    }
  }, [venues, selectedCity]);

  // Log for debugging
  useEffect(() => {
    if (selectedCity) {
      console.log(`Filtering for city: ${selectedCity}`);
      console.log(`Found ${filteredVenues.length} venues in ${selectedCity}`);
      
      // Check if any venues don't match the filter
      const mismatchVenues = filteredVenues.filter(
        venue => venue.city?.toLowerCase() !== selectedCity.toLowerCase()
      );
      
      if (mismatchVenues.length > 0) {
        console.warn(`Found ${mismatchVenues.length} venues with wrong city:`, 
          mismatchVenues.map(v => `${v.name} (${v.city})`));
      }
    }
  }, [selectedCity, filteredVenues]);

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