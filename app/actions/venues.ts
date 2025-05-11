'use server';

import axios from 'axios';

interface VenuePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: string;
  image: string;
  isFavorite: boolean;
}

export async function fetchVenues(): Promise<Venue[]> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Places API key is not defined');
    }
    
    // Search for wedding venues in Bordj Bouarreridj
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=salle+des+fetes+mariage+Bordj+Bouarreridj+Algeria&key=${API_KEY}`;
    
    const response = await axios.get(searchUrl);
    
    if (response.data.status !== 'OK' || !response.data.results) {
      throw new Error(`API Error: ${response.data.status}`);
    }
    
    // Transform the API response into our venue format
    const venues: Venue[] = await Promise.all(
      response.data.results.map(async (place: any) => {
        // Get a photo URL if available
        let photoUrl = '/images/venue-placeholder.jpg';
        
        if (place.photos && place.photos.length > 0) {
          const photoReference = place.photos[0].photo_reference;
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${API_KEY}`;
        }
        
        // Default price range since Google Places doesn't provide pricing
        const priceRange = "Sur demande";
        
        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating || 0,
          price: priceRange,
          image: photoUrl,
          isFavorite: false
        };
      })
    );
    
    return venues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
} 