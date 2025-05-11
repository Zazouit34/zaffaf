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
}

// Mock data for venues
const venues: Venue[] = [
  {
    id: "1",
    name: "Grand Palace Wedding Hall",
    address: "123 Luxury Ave, Beverly Hills, CA",
    rating: 4.8,
    price: "$3,000 - $10,000",
    image: "/images/image-venue-landing.png",
    description: "An elegant and spacious wedding hall with crystal chandeliers and marble floors. Perfect for large wedding ceremonies and receptions with a touch of luxury.",
    capacity: "Up to 500 guests",
    amenities: ["Bridal Suite", "Catering Services", "Valet Parking", "Sound System", "Lighting", "Dance Floor", "Outdoor Area"],
    contactPhone: "+1 (555) 123-4567",
    contactEmail: "info@grandpalaceweddings.com",
    website: "https://www.grandpalaceweddings.com",
    googleMapsUrl: "https://maps.google.com/?q=Grand+Palace+Wedding+Hall",
    images: [
      "/images/image-venue-landing.png",
      "/images/zaffaf-landing.png",
      "/images/hero-image-zaffaf.png",
      "/images/service-zeffaf.jpeg",
    ],
    reviews: [
      {
        id: "r1",
        user: "Sarah & Michael",
        date: "June 15, 2023",
        rating: 5,
        comment: "We had our dream wedding at Grand Palace! The staff was incredibly helpful and the venue looked stunning."
      },
      {
        id: "r2",
        user: "Jennifer & David",
        date: "April 22, 2023",
        rating: 4,
        comment: "Beautiful venue with great amenities. The only issue was parking for some of our guests."
      },
      {
        id: "r3",
        user: "Amanda & Robert",
        date: "August 5, 2023",
        rating: 5,
        comment: "Perfect in every way! Our guests couldn't stop talking about how beautiful the venue was."
      }
    ]
  },
  {
    id: "2",
    name: "Seaside Ceremony Resort",
    address: "456 Ocean Dr, Malibu, CA",
    rating: 4.7,
    price: "$5,000 - $15,000",
    image: "/images/zaffaf-landing.png",
    description: "A breathtaking beachfront venue with panoramic ocean views. Ideal for couples dreaming of a romantic seaside wedding ceremony and reception.",
    capacity: "Up to 200 guests",
    amenities: ["Beach Access", "Outdoor Ceremony Space", "Indoor Reception Hall", "Catering", "Bar Service", "Accommodation", "Photography Spots"],
    contactPhone: "+1 (555) 987-6543",
    contactEmail: "bookings@seasideceremony.com",
    website: "https://www.seasideceremony.com",
    googleMapsUrl: "https://maps.google.com/?q=Seaside+Ceremony+Resort+Malibu",
    images: [
      "/images/zaffaf-landing.png",
      "/images/hero-image-zaffaf.png",
      "/images/image-venue-landing.png",
      "/images/service-zeffaf.jpeg",
    ],
    reviews: [
      {
        id: "r1",
        user: "Emily & Jason",
        date: "July 8, 2023",
        rating: 5,
        comment: "Our beach wedding was absolutely magical! The sunset ceremony was everything we dreamed of."
      },
      {
        id: "r2",
        user: "Melissa & Brian",
        date: "May 14, 2023",
        rating: 4,
        comment: "Beautiful location but the wind was a bit challenging. Still, the staff handled everything professionally."
      }
    ]
  },
  {
    id: "3",
    name: "Mountain View Gardens",
    address: "789 Highland Rd, Aspen, CO",
    rating: 4.9,
    price: "$4,500 - $12,000",
    image: "/images/hero-image-zaffaf.png",
    description: "A picturesque mountain venue surrounded by natural beauty. Features stunning gardens, a rustic barn, and breathtaking views of the mountains.",
    capacity: "Up to 250 guests",
    amenities: ["Garden Ceremony Space", "Rustic Barn Reception", "Mountain Views", "Fire Pit", "Outdoor Lighting", "Heaters for Evening", "Parking"],
    contactPhone: "+1 (555) 456-7890",
    contactEmail: "events@mountainviewgardens.com",
    website: "https://www.mountainviewgardens.com",
    googleMapsUrl: "https://maps.google.com/?q=Mountain+View+Gardens+Aspen",
    images: [
      "/images/hero-image-zaffaf.png",
      "/images/image-venue-landing.png",
      "/images/zaffaf-landing.png",
      "/images/service-zeffaf.jpeg",
    ],
    reviews: [
      {
        id: "r1",
        user: "Lauren & Christopher",
        date: "September 12, 2023",
        rating: 5,
        comment: "The mountain backdrop made our wedding photos absolutely incredible! Highly recommend this venue."
      },
      {
        id: "r2",
        user: "Jessica & Thomas",
        date: "August 28, 2023",
        rating: 5,
        comment: "Perfect venue for our rustic-themed wedding. The gardens were in full bloom and looked magical."
      },
      {
        id: "r3",
        user: "Rachel & Daniel",
        date: "July 3, 2023",
        rating: 4,
        comment: "Beautiful location but it gets chilly in the evening, even in summer. Bring extra layers!"
      }
    ]
  },
  {
    id: "4",
    name: "Historic Downtown Chapel",
    address: "101 Main St, Charleston, SC",
    rating: 4.6,
    price: "$2,000 - $7,500",
    image: "/images/service-zeffaf.jpeg",
    description: "A charming historic chapel in the heart of downtown. Features beautiful stained glass windows, classic architecture, and a cozy reception hall.",
    capacity: "Up to 150 guests",
    amenities: ["Historic Chapel", "Reception Hall", "Bridal Room", "Grand Piano", "Central Location", "Photography Allowed", "Wheelchair Accessible"],
    contactPhone: "+1 (555) 234-5678",
    contactEmail: "bookings@historicchapel.com",
    website: "https://www.historicchapel.com",
    googleMapsUrl: "https://maps.google.com/?q=Historic+Downtown+Chapel+Charleston",
    images: [
      "/images/service-zeffaf.jpeg",
      "/images/image-venue-landing.png",
      "/images/zaffaf-landing.png",
      "/images/hero-image-zaffaf.png",
    ],
    reviews: [
      {
        id: "r1",
        user: "Katherine & William",
        date: "October 5, 2023",
        rating: 5,
        comment: "Such a beautiful historic venue with so much character! Perfect for our intimate wedding."
      },
      {
        id: "r2",
        user: "Elizabeth & James",
        date: "May 30, 2023",
        rating: 4,
        comment: "Lovely chapel but limited parking in the downtown area. Plan accordingly."
      }
    ]
  }
];

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  // Return an array of params to pre-render
  return venues.map((venue) => ({
    id: venue.id,
  }));
}

export default async function VenueDetailPage({ params, searchParams }: PageProps) {
  // Await the params since it's now a Promise
  const resolvedParams = await params;
  const venue = venues.find(v => v.id === resolvedParams.id);
  
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