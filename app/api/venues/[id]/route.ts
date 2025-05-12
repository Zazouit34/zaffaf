import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

type RouteParams = {
  params: {
    id: string;
  };
};

// Helper function to delay execution (for rate limiting)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const placeId = context.params.id;
    
    if (!placeId) {
      return NextResponse.json({ error: "Place ID is required" }, { status: 400 });
    }
    
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }
    
    // Fetch the place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=fr&reviews_no_translation=true&fields=name,formatted_address,rating,user_ratings_total,formatted_phone_number,international_phone_number,website,opening_hours,photos,reviews,url,types,geometry&key=${API_KEY}`;
    
    const response = await axios.get(detailsUrl);
    
    if (response.data.status !== 'OK' || !response.data.result) {
      return NextResponse.json({ error: `Failed to fetch place details: ${response.data.status}` }, { status: 404 });
    }
    
    const place = response.data.result;
    
    // Transform the reviews to include relative time
    const reviews = place.reviews?.map((review: any) => {
      // Function to convert timestamp to relative time
      const relativeTime = getRelativeTimeString(review.time);
      
      return {
        authorName: review.author_name,
        authorPhoto: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relativeTime,
        language: review.language
      };
    });
    
    // Transform the place data to our venue format
    const venueData = {
      id: placeId,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total,
      price: "Prix sur demande", // Default price
      phoneNumber: place.formatted_phone_number,
      internationalPhoneNumber: place.international_phone_number,
      website: place.website,
      openingHours: place.opening_hours ? {
        isOpen: place.opening_hours.open_now,
        weekdayText: place.opening_hours.weekday_text
      } : undefined,
      photos: place.photos?.map((photo: any) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })),
      reviews,
      placeUrl: place.url,
      types: place.types,
      location: place.geometry?.location ? {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      } : undefined
    };
    
    return NextResponse.json(venueData);
    
  } catch (error) {
    console.error("Error fetching venue details:", error);
    return NextResponse.json({ error: "Failed to fetch venue details" }, { status: 500 });
  }
}

// Helper function to convert timestamp to relative time in French
function getRelativeTimeString(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = now - timestamp;
  
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diffSeconds < minute) {
    return "à l'instant";
  } else if (diffSeconds < hour) {
    const minutes = Math.floor(diffSeconds / minute);
    return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffSeconds < day) {
    const hours = Math.floor(diffSeconds / hour);
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffSeconds < week) {
    const days = Math.floor(diffSeconds / day);
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (diffSeconds < month) {
    const weeks = Math.floor(diffSeconds / week);
    return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else if (diffSeconds < year) {
    const months = Math.floor(diffSeconds / month);
    return `il y a ${months} mois`;
  } else {
    const years = Math.floor(diffSeconds / year);
    return `il y a ${years} an${years > 1 ? 's' : ''}`;
  }
} 