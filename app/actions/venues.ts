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

// Placeholder image to use if no photo is available
const PLACEHOLDER_IMAGE = '/images/image-venue-landing.png';

// List of major Algerian cities to search for venues
const cities = [
  "Alger",
  "Oran",
  "Setif",
  "Tlemcen",
  "Annaba",
  "Batna",
  "Constantine",
  "Blida",
  "Bordj Bouarreridj",
  "Béjaïa",
  "Tizi Ouzou",
  "Tipaza",
  "Skikda",
  "Sétif",
  "Souk Ahras",
];

// Normalize the search results to ensure they match the exact city names in our filter
function normalizeCity(address: string, searchedCity: string): string {
  // Check if the address contains any of our city names
  for (const city of cities) {
    // If the city is mentioned in the address, prioritize our standardized name
    if (address.includes(city)) {
      return city;
    }
  }
  
  // If no direct match, return the city we searched for
  return searchedCity;
}

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
          let photoUrl = PLACEHOLDER_IMAGE;
          
          if (place.photos && place.photos.length > 0) {
            try {
              const photoReference = place.photos[0].photo_reference;
              if (photoReference) {
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${API_KEY}`;
              }
            } catch (photoError) {
              console.warn('Error getting photo for venue:', photoError);
              photoUrl = PLACEHOLDER_IMAGE;
            }
          }
          
          // Default price range since Google Places doesn't provide pricing
          const priceRange = "Prix: Sur demande";
          
          // Use the normalized city to ensure consistency
          const normalizedCity = normalizeCity(place.formatted_address, city);
          
          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            price: priceRange,
            image: photoUrl,
            isFavorite: false,
            city: normalizedCity
          };
        });
      } catch (error) {
        console.error(`Error fetching venues for ${city}:`, error);
        return [];
      }
    });
    
    // Wait for all city searches to complete
    const cityResults = await Promise.all(cityPromises);
    
    // Flatten the array of arrays into a single array of venues and filter out duplicates
    const allVenues = cityResults.flat();
    
    // Filter out duplicate venues based on place_id
    const uniqueVenues = allVenues.filter((venue, index, self) => 
      index === self.findIndex((v) => v.id === venue.id)
    );
    
    // Return all unique venues
    return uniqueVenues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
} 