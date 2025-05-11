"use client";

import { VenueCard } from "@/components/venue-card";
import { AppLayout } from "@/components/app-layout";

// Mock data for venues
const venues = [
  {
    id: "1",
    name: "Grand Palace Wedding Hall",
    address: "123 Luxury Ave, Beverly Hills, CA",
    rating: 4.8,
    price: "$3,000 - $10,000",
    image: "/images/image-venue-landing.png",
    isFavorite: false
  },
  {
    id: "2",
    name: "Seaside Ceremony Resort",
    address: "456 Ocean Dr, Malibu, CA",
    rating: 4.7,
    price: "$5,000 - $15,000",
    image: "/images/zaffaf-landing.png",
    isFavorite: true
  },
  {
    id: "3",
    name: "Mountain View Gardens",
    address: "789 Highland Rd, Aspen, CO",
    rating: 4.9,
    price: "$4,500 - $12,000",
    image: "/images/hero-image-zaffaf.png",
    isFavorite: false
  },
  {
    id: "4",
    name: "Historic Downtown Chapel",
    address: "101 Main St, Charleston, SC",
    rating: 4.6,
    price: "$2,000 - $7,500",
    image: "/images/service-zeffaf.jpeg",
    isFavorite: false
  },
];

export default function VenuesPage() {
  return (
    <AppLayout requireAuth={true}>
      <h1 className="text-3xl font-bold mb-6 font-serif">Wedding Venues</h1>
      <p className="text-muted-foreground mb-8">
        Find the perfect venue for your special day. Browse our selection of premium wedding venues.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {venues.map((venue) => (
          <VenueCard key={venue.id} {...venue} />
        ))}
      </div>
    </AppLayout>
  );
} 