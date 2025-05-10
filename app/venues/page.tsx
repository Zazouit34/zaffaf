import { Suspense } from "react";
import { searchWeddingVenues } from "@/lib/actions/venues";
import { VenueCard } from "@/components/venue-card";
import { VenueCardSkeleton } from "@/components/venue-card-skeleton";
import { MapPin, Search } from "lucide-react";

export const metadata = {
  title: "Lieux de mariage - Zaffaf",
  description: "Découvrez les meilleurs lieux de mariage à Bordj Bouarreridj, Algérie",
};

export default async function VenuesPage() {
  const { results: venues, status } = await searchWeddingVenues();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-nunito mb-2">Lieux de mariage</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Bordj Bouarreridj, Algérie</span>
          </div>
        </header>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-muted-foreground">
            {venues.length} lieux trouvés
          </p>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un lieu..."
              className="w-full sm:w-[300px] rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Suspense fallback={<VenuesLoadingSkeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.length > 0 ? (
              venues.map((venue) => (
                <VenueCard key={venue.place_id} venue={venue} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Aucun lieu trouvé</h3>
                <p className="mt-2 text-muted-foreground">
                  Nous n'avons pas trouvé de lieux de mariage dans cette région.
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}

function VenuesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <VenueCardSkeleton key={index} />
      ))}
    </div>
  );
} 