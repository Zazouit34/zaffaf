"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Clock } from "lucide-react";
import { Venue } from "@/app/actions/venues";

interface VenueContactDialogProps {
  venue: Venue;
  children?: React.ReactNode;
}

export function VenueContactDialog({
  venue,
  children
}: VenueContactDialogProps) {
  const [open, setOpen] = useState(false);

  // Generate Google Maps URL
  const googleMapsUrl = venue.placeUrl || 
    `https://maps.google.com/?q=${encodeURIComponent(venue.name + ' ' + venue.address)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Contact Venue</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">Contact {venue.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            {venue.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold">Téléphone</h3>
                  <a href={`tel:${venue.phoneNumber}`} className="text-blue-600 hover:underline">
                    {venue.phoneNumber}
                  </a>
                  {venue.internationalPhoneNumber && venue.internationalPhoneNumber !== venue.phoneNumber && (
                    <div className="text-sm text-muted-foreground">
                      {venue.internationalPhoneNumber}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {venue.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold">Site Web</h3>
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {venue.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold">Adresse</h3>
                <p>{venue.address}</p>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  Voir sur Google Maps
                </a>
              </div>
            </div>

            {venue.openingHours?.weekdayText && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold">Horaires d'ouverture</h3>
                  <div className="text-sm space-y-1 mt-1">
                    {venue.openingHours.weekdayText.map((day, i) => (
                      <div key={i} className={i === new Date().getDay() ? "font-semibold" : ""}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Button className="w-full" onClick={() => window.location.href = `tel:${venue.phoneNumber || ''}`}>
              Appeler maintenant
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 