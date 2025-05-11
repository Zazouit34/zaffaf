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
import { Phone, Globe, MapPin } from "lucide-react";

interface VenueContactInfo {
  name: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  address: string;
  googleMapsUrl: string;
}

interface VenueContactDialogProps {
  venue: VenueContactInfo;
  children?: React.ReactNode;
}

export function VenueContactDialog({
  venue,
  children
}: VenueContactDialogProps) {
  const [open, setOpen] = useState(false);

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
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold">Phone</h3>
                <a href={`tel:${venue.contactPhone}`} className="text-blue-600 hover:underline">
                  {venue.contactPhone}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold">Website</h3>
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {venue.website.replace('https://', '')}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold">Address</h3>
                <p>{venue.address}</p>
                <a href={venue.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button className="w-full" onClick={() => window.location.href = `mailto:${venue.contactEmail}`}>
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 