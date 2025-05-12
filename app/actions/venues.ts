'use server';

import axios from 'axios';
import pLimit from 'p-limit';
import { cities } from '@/app/data/cities';

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

// Different search terms to find diverse venue types
const searchTerms = [
  "salle des fetes mariage",
  "lieu de mariage",
  "salle de reception mariage", 
  "espace evenementiel mariage",
  "hotel mariage"
];

// Helper function to delay execution for a specific amount of time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to transform Google Places results into our venue format
const transformPlacesToVenues = (places: any[], city: string, apiKey: string): Venue[] => {
  return places.map((place: any) => {
    // Get a photo URL if available
    let photoUrl = PLACEHOLDER_IMAGE;
    
    if (place.photos && place.photos.length > 0) {
      try {
        const photoReference = place.photos[0].photo_reference;
        if (photoReference) {
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${apiKey}`;
        }
      } catch (photoError) {
        console.warn('Error getting photo for venue:', photoError);
        photoUrl = PLACEHOLDER_IMAGE;
      }
    }
    
    // Default price range since Google Places doesn't provide pricing
    const priceRange = "Prix: Sur demande";
    
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
};

// Function to fetch venues for a specific city and search term with pagination
async function fetchVenuesWithTerm(city: string, searchTerm: string, apiKey: string, maxPages: number = 2): Promise<Venue[]> {
  let allVenues: Venue[] = [];
  let nextPageToken: string | null = null;
  let currentPage = 0;
  
  try {
    do {
      // For the first page, use the standard query
      // For subsequent pages, use the nextPageToken
      const searchUrl: string = nextPageToken
        ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
        : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}+${encodeURIComponent(city)}+Algeria&key=${apiKey}`;
      
      // Wait 2 seconds before requesting with a next_page_token (Google's requirement)
      if (nextPageToken) {
        await delay(2000);
      }
      
      const response: any = await axios.get(searchUrl);
      
      if (response.data.status !== 'OK' || !response.data.results) {
        console.warn(`No results for ${city} with term "${searchTerm}" on page ${currentPage + 1}: ${response.data.status}`);
        break;
      }
      
      // Transform and add venues
      const venues = transformPlacesToVenues(response.data.results, city, apiKey);
      allVenues = [...allVenues, ...venues];
      
      // Get the next page token if available
      nextPageToken = response.data.next_page_token || null;
      
      currentPage++;
      
      // Break if we've reached maxPages
      if (currentPage >= maxPages) {
        break;
      }
      
    } while (nextPageToken);
    
    return allVenues;
    
  } catch (error) {
    console.error(`Error fetching venues for ${city} with term "${searchTerm}":`, error);
    return [];
  }
}

// Function to fetch venues for a specific city with multiple search terms
async function fetchVenuesForCity(city: string, apiKey: string): Promise<Venue[]> {
  try {
    // Create a rate limiter for search terms - max 2 concurrent searches per city
    const limit = pLimit(2);
    
    // Create search term promises with rate limiting
    const searchPromises = searchTerms.map(term => 
      limit(() => fetchVenuesWithTerm(city, term, apiKey))
    );
    
    // Wait for all search term results
    const termResults = await Promise.all(searchPromises);
    
    // Combine and deduplicate results
    const allVenues = termResults.flat();
    const uniqueVenues = Array.from(new Map(allVenues.map(v => [v.id, v])).values());
    
    return uniqueVenues;
  } catch (error) {
    console.error(`Error fetching venues for ${city}:`, error);
    return [];
  }
}

export async function fetchVenues(): Promise<Venue[]> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Places API key is not defined');
    }
    
    // Create a rate limiter with max 3 concurrent requests for cities
    const cityLimit = pLimit(3);
    
    // Create an array of promises for each city search with rate limiting
    const cityPromises = cities.map((city) =>
      cityLimit(() => fetchVenuesForCity(city, API_KEY))
    );
    
    // Wait for all city searches to complete
    const cityResults = await Promise.all(cityPromises);
    
    // Flatten the array of arrays into a single array of venues
    const allVenues = cityResults.flat();
    
    // Final deduplication of venues across all cities
    const uniqueVenues = Array.from(new Map(allVenues.map(v => [v.id, v])).values());
    
    console.log(`Fetched a total of ${uniqueVenues.length} unique venues across ${cities.length} cities`);
    
    // Return all unique venues
    return uniqueVenues;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
} 