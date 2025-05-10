import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
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
}

export function VenueCard({ 
  id, 
  name, 
  address, 
  rating, 
  price, 
  image, 
  isFavorite = false 
}: VenueCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    // Here you would typically call an API to save the favorite status
  };

  return (
    <Link href={`/venues/${id}`} className="block">
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full">
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
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
            onClick={handleFavoriteClick}
          >
            <Heart
              className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-gray-500"}`}
            />
            <span className="sr-only">Add to favorites</span>
          </Button>
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-1 text-sm">
              <span>★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{address}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Badge variant="outline" className="font-normal">
            Wedding Venue
          </Badge>
          <p className="font-medium">{price}</p>
        </CardFooter>
      </Card>
    </Link>
  );
} 