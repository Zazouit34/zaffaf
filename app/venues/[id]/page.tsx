import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Phone, Globe, Calendar, Check, Heart, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/app-layout";
import { MobileImageCarousel } from "@/components/mobile-image-carousel";
import { VenueContactDialog } from "@/components/venue-contact-dialog";
import { Venue, fetchVenueDetails } from "@/app/actions/venues";

interface PageProps {
  params: { id: string };
}

// Make this a dynamic page since we're fetching data from an external API
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function VenueDetailPage({ params }: PageProps) {
  const venue = await fetchVenueDetails(params.id);
  
  if (!venue) {
    notFound();
  }

  // Create image array with fallback
  const images = venue.photos && venue.photos.length > 0 
    ? venue.photos.slice(0, 4).map(photo => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
    )
    : ['/images/image-venue-landing.png'];

  // Create a description based on venue type
  const venueTypes = venue.types || [];
  let venueDescription = "Un lieu idéal pour votre mariage.";
  
  if (venueTypes.includes("restaurant")) {
    venueDescription = "Un restaurant élégant offrant un cadre parfait pour votre réception de mariage avec service de restauration sur place.";
  } else if (venueTypes.includes("hotel") || venueTypes.includes("lodging")) {
    venueDescription = "Un hôtel de qualité proposant des salles de réception pour mariages avec possibilité d'hébergement pour vos invités.";
  } else if (venueTypes.includes("event_venue") || venueTypes.includes("banquet_hall")) {
    venueDescription = "Une salle de fêtes spacieuse conçue pour accueillir de grands événements comme les mariages avec tous les équipements nécessaires.";
  }

  // Determine amenities based on types and location
  const amenities = [
    "Salle de réception",
    venue.city ? `Situé à ${venue.city}` : "Emplacement stratégique",
  ];
  
  if (venueTypes.includes("restaurant")) amenities.push("Service de restauration");
  if (venueTypes.includes("lodging") || venueTypes.includes("hotel")) amenities.push("Hébergement disponible");
  if (venueTypes.includes("parking")) amenities.push("Parking");
  if (venue.openingHours?.weekdayText) amenities.push("Horaires flexibles");
  
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
              <span className="text-muted-foreground">{venue.userRatingsTotal || 0} avis</span>
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
          <MobileImageCarousel images={images} alt={venue.name} />
        </div>
        
        {/* Desktop gallery */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2 sm:row-span-2 relative aspect-[4/3]">
            <Image 
              src={images[0]} 
              alt={venue.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority
            />
          </div>
          {images.slice(1).map((image, i) => (
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
              <p className="text-muted-foreground mb-6">{venueDescription}</p>
              
              <h3 className="text-xl font-bold font-serif mb-3">Détails</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Localisation</Badge>
                  <span>{venue.city || "Non spécifié"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Fourchette de prix</Badge>
                  <span>{venue.price}</span>
                </div>
                {venue.openingHours?.isOpen !== undefined && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Statut</Badge>
                    <span className={venue.openingHours.isOpen ? "text-green-600" : "text-red-600"}>
                      {venue.openingHours.isOpen ? "Ouvert maintenant" : "Fermé maintenant"}
                    </span>
                  </div>
                )}
              </div>

              {venue.openingHours?.weekdayText && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold font-serif mb-3">Horaires d'ouverture</h3>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {venue.openingHours.weekdayText.map((day, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
            {amenities.map((amenity, i) => (
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
              <span className="text-muted-foreground">• {venue.userRatingsTotal || 0} avis</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {venue.reviews && venue.reviews.length > 0 ? (
              venue.reviews.map((review, index) => (
                <div key={index} className="border-b pb-6">
                  <div className="flex items-start gap-3 mb-2">
                    {review.authorPhoto && (
                      <Image 
                        src={review.authorPhoto} 
                        alt={review.authorName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold">{review.authorName}</h3>
                        <span className="text-sm text-muted-foreground">{review.relativeTime}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">Aucun avis disponible pour ce lieu.</p>
            )}
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