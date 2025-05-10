import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenueDetails, getPhotoUrl } from "@/lib/actions/venues";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Clock, Phone, Globe, ChevronLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface VenuePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: VenuePageProps) {
  const venueDetails = await getVenueDetails(params.id);
  
  if (!venueDetails || venueDetails.status !== "OK") {
    return {
      title: "Lieu non trouvé - Zaffaf",
    };
  }
  
  return {
    title: `${venueDetails.result.name} - Zaffaf`,
    description: `Découvrez ${venueDetails.result.name} à ${venueDetails.result.vicinity || venueDetails.result.formatted_address?.split(',')[0]}`,
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const venueDetails = await getVenueDetails(params.id);
  
  if (!venueDetails || venueDetails.status !== "OK") {
    notFound();
  }
  
  const venue = venueDetails.result;
  
  // Get photos or use placeholder
  const photos = venue.photos || [];
  const mainPhotoUrl = photos.length > 0 
    ? getPhotoUrl(photos[0].photo_reference, 1200)
    : "/images/venue-placeholder.jpg";
  
  // Additional photos (up to 4)
  const additionalPhotos = photos.slice(1, 5).map(photo => 
    getPhotoUrl(photo.photo_reference, 600)
  );
  
  // Format the phone number
  const phoneNumber = venue.formatted_phone_number || venue.international_phone_number || "";
  
  // Determine if the venue is open
  const isOpen = venue.opening_hours?.open_now;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/venues" 
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Retour aux lieux</span>
        </Link>
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-nunito mb-2">{venue.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{venue.vicinity || venue.formatted_address}</span>
            </div>
            
            {venue.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{venue.rating.toFixed(1)}</span>
                {venue.user_ratings_total && (
                  <span className="text-sm">({venue.user_ratings_total} avis)</span>
                )}
              </div>
            )}
            
            {typeof isOpen !== 'undefined' && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={isOpen ? "text-green-600" : "text-red-600"}>
                  {isOpen ? "Ouvert" : "Fermé"}
                </span>
              </div>
            )}
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main image */}
          <div className="md:col-span-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={mainPhotoUrl}
                alt={venue.name}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
          </div>
          
          {/* Additional images */}
          <div className="grid grid-cols-2 gap-3">
            {additionalPhotos.map((photoUrl, index) => (
              <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={photoUrl}
                  alt={`${venue.name} - Photo ${index + 2}`}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              </div>
            ))}
            {additionalPhotos.length === 0 && (
              <div className="col-span-2 flex items-center justify-center rounded-lg bg-muted h-full">
                <p className="text-muted-foreground text-sm">Pas d'autres photos disponibles</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-bold font-nunito mb-4">À propos de ce lieu</h2>
              <p className="text-muted-foreground">
                {venue.name} est une salle de mariage située à {venue.vicinity || venue.formatted_address?.split(',')[0]}.
                {venue.rating && ` Ce lieu a une note moyenne de ${venue.rating.toFixed(1)}/5 basée sur ${venue.user_ratings_total} avis.`}
              </p>
            </section>
            
            {venue.reviews && venue.reviews.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold font-nunito mb-4">Avis</h2>
                <div className="space-y-4">
                  {venue.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {review.profile_photo_url ? (
                          <Image
                            src={review.profile_photo_url}
                            alt={review.author_name}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">{review.author_name[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{review.author_name}</p>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{review.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="rounded-lg border border-border p-6 sticky top-8">
              <h3 className="text-lg font-bold mb-4">Informations de contact</h3>
              
              <div className="space-y-3">
                {phoneNumber && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <a href={`tel:${phoneNumber}`} className="text-sm text-muted-foreground hover:underline">
                        {phoneNumber}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">
                      {venue.formatted_address}
                    </p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name)}&query_place_id=${venue.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      Voir sur Google Maps
                    </a>
                  </div>
                </div>
                
                {venue.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Site web</p>
                      <a 
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline break-all"
                      >
                        {venue.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Réserver une visite
                </Button>
                <Button variant="outline" className="w-full">
                  Contacter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VenueDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-32 mb-6" />
      
      <Skeleton className="h-10 w-2/3 mb-2" />
      <div className="flex gap-4 mb-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Skeleton className="md:col-span-2 aspect-video w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="rounded-lg border border-border p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 