"use client";

import { VenueCard } from "@/components/venue-card";
import { AppLayout } from "@/components/app-layout";

// Mock data for venues
const venues = [
  {
    id: "1",
    name: "Salle de Mariage Grand Palais",
    address: "123 Luxury Ave, Beverly Hills, CA",
    rating: 4.8,
    price: "3 000 € - 10 000 €",
    image: "/images/image-venue-landing.png",
    isFavorite: false
  },
  {
    id: "2",
    name: "Resort Cérémonie en Bord de Mer",
    address: "456 Ocean Dr, Malibu, CA",
    rating: 4.7,
    price: "5 000 € - 15 000 €",
    image: "/images/zaffaf-landing.png",
    isFavorite: true
  },
  {
    id: "3",
    name: "Jardins Vue Montagne",
    address: "789 Highland Rd, Aspen, CO",
    rating: 4.9,
    price: "4 500 € - 12 000 €",
    image: "/images/hero-image-zaffaf.png",
    isFavorite: false
  },
  {
    id: "4",
    name: "Chapelle Historique du Centre-Ville",
    address: "101 Main St, Charleston, SC",
    rating: 4.6,
    price: "2 000 € - 7 500 €",
    image: "/images/service-zeffaf.jpeg",
    isFavorite: false
  },
];

export default function VenuesPage() {
  return (
    <AppLayout requireAuth={true}>
      <h1 className="text-3xl font-bold mb-6 font-serif">Lieux de Mariage</h1>
      <p className="text-muted-foreground mb-8">
        Trouvez le lieu parfait pour votre jour spécial. Parcourez notre sélection de lieux de mariage premium.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard key={venue.id} {...venue} />
        ))}
      </div>
    </AppLayout>
  );
} 