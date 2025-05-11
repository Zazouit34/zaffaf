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
  city?: string;
}

// List of major Algerian cities to search for venues
const cities = [
  "Bordj Bouarreridj",
  "Alger",
  "Oran",
  "Setif",
  "Tlemcen",
  "Annaba",
  "Batna",
  "Constantine"
];

export async function fetchVenues(): Promise<Venue[]> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Places API key is not defined');
    }
    
    // Create an array of promises for each city search
    const cityPromises = cities.map(async (city) => {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=salle+des+fetes+mariage+${encodeURIComponent(city)}+Algeria&key=${API_KEY}`;
      
      try {
        const response = await axios.get(searchUrl);
        
        if (response.data.status !== 'OK' || !response.data.results) {
          console.warn(`No results for ${city}: ${response.data.status}`);
          return [];
        }
        
        // Transform the API response into our venue format
        return response.data.results.map((place: any) => {
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
            isFavorite: false,
            city: city
          };
        });
      } catch (error) {
        console.error(`Error fetching venues for ${city}:`, error);
        return [];
      }
    });
    
    // Wait for all city searches to complete
    const cityResults = await Promise.all(cityPromises);
    
    // Flatten the array of arrays into a single array of venues
    const allVenues = cityResults.flat();
    
    // Limit to a reasonable number if there are too many results
    const maxVenues = 24; // Show at most 24 venues
    if (allVenues.length > maxVenues) {
      return allVenues.slice(0, maxVenues);
    }
    
    return allVenues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
} 