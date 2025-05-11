import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Phone, Globe, Calendar, Check, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/app-layout";
import { MobileImageCarousel } from "@/components/mobile-image-carousel";
import { VenueContactDialog } from "@/components/venue-contact-dialog";
import axios from "axios";
import { getCities, searchWeddingVenues } from "@/app/services/googlePlacesService";

// Type definitions
interface Review {
  id: string;
  user: string;
  date: string;
  rating: number;
  comment: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  description: string;
  capacity: string;
  amenities: string[];
  contactPhone: string;
  contactEmail: string;
  website: string;
  googleMapsUrl: string;
  images: string[];
  reviews: Review[];
  location?: {
    lat: number;
    lng: number;
  };
}

// Fetch venue data from Google Places API
async function getVenueDetails(id: string): Promise<Venue | null> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    const BASE_URL = 'https://maps.googleapis.com/maps/api/place';
    
    // Get place details
    const detailsResponse = await axios.get(`${BASE_URL}/details/json`, {
      params: {
        place_id: id,
        key: API_KEY,
        language: 'fr',
        fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,geometry,price_level'
      }
    });
    
    const placeDetails = detailsResponse.data.result;
    
    if (!placeDetails) {
      return null;
    }
    
    // Process photos to get URLs
    const images = placeDetails.photos 
      ? placeDetails.photos.slice(0, 4).map((photo: any) => 
          `${BASE_URL}/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${API_KEY}`)
      : ['/images/image-venue-landing.png', '/images/zaffaf-landing.png', '/images/hero-image-zaffaf.png', '/images/service-zeffaf.jpeg'];

    // Process reviews
    const reviews = placeDetails.reviews 
      ? placeDetails.reviews.map((review: any) => ({
          id: `r${Math.random().toString(36).substr(2, 9)}`,
          user: review.author_name,
          date: new Date(review.time * 1000).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          rating: review.rating,
          comment: review.text
        }))
      : [];

    // Create venue object with all required fields
    return {
      id: id,
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      rating: placeDetails.rating || 4.5,
      price: placeDetails.price_level 
        ? '€'.repeat(placeDetails.price_level) + ' - ' + '€'.repeat(placeDetails.price_level + 1)
        : "€€€ - €€€€",
      image: images[0],
      description: "Un lieu de mariage élégant avec un excellent service et des installations modernes pour votre cérémonie et réception.",
      capacity: "Jusqu'à 300 invités",
      amenities: ["Espace de cérémonie", "Salle de réception", "Traiteur", "Parking", "Climatisation", "Sonorisation", "Décoration", "Hébergement"],
      contactPhone: placeDetails.formatted_phone_number || placeDetails.international_phone_number || "+213 00 00 00 00",
      contactEmail: `contact@${placeDetails.name.toLowerCase().replace(/\s/g, '')}.dz`,
      website: placeDetails.website || `https://www.${placeDetails.name.toLowerCase().replace(/\s/g, '')}.dz`,
      googleMapsUrl: `https://maps.google.com/?q=${placeDetails.name}`,
      images: images,
      reviews: reviews,
      location: {
        lat: placeDetails.geometry.location.lat,
        lng: placeDetails.geometry.location.lng
      }
    };
  } catch (error) {
    console.error("Error fetching venue details:", error);
    return null;
  }
}

// This enables static site generation with dynamic data
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  try {
    // Get all cities
    const cities = await getCities();
    const allVenueParams = [];
    
    // For each city, get venues and extract their IDs
    for (const city of cities) {
      const venues = await searchWeddingVenues(city.id);
      const venueParams = venues.map((venue: { id: string }) => ({ id: venue.id }));
      allVenueParams.push(...venueParams);
    }
    
    return allVenueParams;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VenueDetailPage({ params, searchParams }: PageProps) {
  // Await the params since it's now a Promise
  const resolvedParams = await params;
  const venue = await getVenueDetails(resolvedParams.id);
  
  if (!venue) {
    notFound();
  }

  return (
    <AppLayout requireAuth={true}>
      {/* Back button */}
      <Link href="/venues" className="flex items-center gap-2 mb-6 text-sm hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux lieux
      </Link>
      
      {/* Venue header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">{venue.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{venue.rating.toFixed(1)}</span>
              <span className="mx-1">•</span>
              <span className="text-muted-foreground">{venue.reviews.length} avis</span>
            </div>
            <span className="mx-1 hidden sm:inline">•</span>
            <div className="flex items-center mt-1 sm:mt-0">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{venue.address}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Sauvegarder</span>
          </Button>
          <VenueContactDialog venue={venue}>
            <Button>Contacter</Button>
          </VenueContactDialog>
        </div>
      </div>
      
      {/* Gallery */}
      <div className="mb-8">
        {/* Mobile carousel */}
        <div className="block sm:hidden">
          <MobileImageCarousel images={venue.images} alt={venue.name} />
        </div>
        
        {/* Desktop gallery */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2 sm:row-span-2 relative aspect-[4/3]">
            <Image 
              src={venue.images[0]} 
              alt={venue.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority
            />
          </div>
          {venue.images.slice(1, 4).map((image, i) => (
            <div key={i} className="relative aspect-[4/3]">
              <Image 
                src={image} 
                alt={`${venue.name} - Image ${i+2}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Content tabs */}
      <Tabs defaultValue="overview" className="mb-10">
        <TabsList className="mb-6 w-full overflow-x-auto flex-nowrap justify-start sm:justify-center">
          <TabsTrigger value="overview" className="px-3 sm:px-4 py-2 text-sm">Aperçu</TabsTrigger>
          <TabsTrigger value="amenities" className="px-3 sm:px-4 py-2 text-sm">Équipements</TabsTrigger>
          <TabsTrigger value="reviews" className="px-3 sm:px-4 py-2 text-sm">Avis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold font-serif mb-4">À propos de ce lieu</h2>
              <p className="text-muted-foreground mb-6">{venue.description}</p>
              
              <h3 className="text-xl font-bold font-serif mb-3">Détails</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Capacité</Badge>
                  <span>{venue.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Fourchette de prix</Badge>
                  <span>{venue.price}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Réserver ce lieu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Vérifier la disponibilité</span>
                  </div>
                  <VenueContactDialog venue={venue}>
                    <Button className="w-full text-base py-5 sm:py-2">Demander des informations</Button>
                  </VenueContactDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="amenities">
          <h2 className="text-2xl font-bold font-serif mb-6">Équipements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {venue.amenities.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md sm:bg-transparent sm:p-0">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{amenity}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reviews">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-serif mb-2">Avis des clients</h2>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{venue.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">• {venue.reviews.length} avis</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {venue.reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">{review.user}</h3>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                    />
                  ))}
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fixed bottom action bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-2 z-50 sm:hidden">
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
          <Heart className="h-4 w-4" />
          <span>Sauvegarder</span>
        </Button>
        <VenueContactDialog venue={venue}>
          <Button className="flex-1">Contacter</Button>
        </VenueContactDialog>
      </div>
      
      {/* Add padding at the bottom on mobile to account for the fixed bar */}
      <div className="h-16 sm:hidden"></div>
    </AppLayout>
  );
} 