'use client'

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useState } from "react";

import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VenueCardProps {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  isFavorite?: boolean;
  city?: string;
}

export function VenueCard({ 
  id, 
  name, 
  address, 
  rating, 
  price, 
  image, 
  isFavorite = false,
  city
}: VenueCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    // Ici vous appelleriez généralement une API pour sauvegarder l'état des favoris
  };

  return (
    <Link href={`/venues/${id}`} className="block">
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
        <div className="p-3 pt-3">
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden">
            <Image
              src={image || "/images/venue-placeholder.jpg"}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full shadow-sm"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-500"}`}
              />
              <span className="sr-only">Ajouter aux favoris</span>
            </Button>
            {city && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center text-white">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{city}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-500">★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{address}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Badge variant="outline" className="font-normal">
            Salle de fête
          </Badge>
          <p className="font-medium">{price}</p>
        </CardFooter>
      </Card>
    </Link>
  );
} 