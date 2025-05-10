import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { GooglePlaceResult, getPhotoUrl } from "@/lib/actions/venues";
import { cn } from "@/lib/utils";

interface VenueCardProps {
  venue: GooglePlaceResult;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  // Get the first photo or use a placeholder
  const photoUrl = venue.photos && venue.photos.length > 0
    ? getPhotoUrl(venue.photos[0].photo_reference, 600)
    : "/images/venue-placeholder.jpg";

  // Format the address to show only the most relevant part
  const shortAddress = venue.vicinity || venue.formatted_address?.split(',').slice(0, 2).join(',');

  // Format the phone number
  const phoneNumber = venue.formatted_phone_number || venue.international_phone_number || "";

  // Determine if the venue is open
  const isOpen = venue.opening_hours?.open_now;

  return (
    <Link 
      href={`/venues/${venue.place_id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={photoUrl}
          alt={venue.name}
          width={600}
          height={450}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={true} // Since we're using external URLs
        />
        {venue.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{venue.rating.toFixed(1)}</span>
            {venue.user_ratings_total && (
              <span className="text-gray-300">({venue.user_ratings_total})</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-lg line-clamp-1">{venue.name}</h3>
        
        <div className="mt-2 flex items-start gap-1 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{shortAddress}</span>
        </div>
        
        {phoneNumber && (
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{phoneNumber}</span>
          </div>
        )}
        
        {typeof isOpen !== 'undefined' && (
          <div className="mt-1 flex items-center gap-1">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className={cn(
              "text-sm",
              isOpen ? "text-green-600" : "text-red-600"
            )}>
              {isOpen ? "Ouvert" : "Fermé"}
            </span>
          </div>
        )}
        
        <div className="mt-auto pt-4">
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Salle de mariage
          </div>
        </div>
      </div>
    </Link>
  );
} 