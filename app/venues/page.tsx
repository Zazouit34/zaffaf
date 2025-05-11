import { Suspense } from "react";
import { fetchVenues } from "@/app/actions/venues";
import { VenuesClientPage } from "./client-page";
import VenuesSkeleton from "@/components/venues-skeleton";

export default function VenuesPage() {
  return (
    <Suspense fallback={<VenuesSkeleton />}>
      <VenuesContent />
    </Suspense>
  );
}

async function VenuesContent() {
  // Fetch venues from Google Places API
  const venues = await fetchVenues();

  // Pass the venues to the client component
  return <VenuesClientPage venues={venues} />;
} 