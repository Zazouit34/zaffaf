import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { 
  getCachedVenue, 
  setCachedVenue, 
  ENABLE_GOOGLE_FETCH 
} from '@/lib/venues-cache';

// Main GET handler using async params
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: placeId } = await context.params;

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    const cached = await getCachedVenue(placeId);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (!ENABLE_GOOGLE_FETCH) {
      return NextResponse.json({ error: 'Venue not cached and external fetch disabled' }, { status: 404 });
    }

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!API_KEY) {
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=fr&reviews_no_translation=true&fields=name,formatted_address,rating,user_ratings_total,formatted_phone_number,international_phone_number,website,opening_hours,photos,reviews,url,types,geometry&key=${API_KEY}`;

    const response = await axios.get(detailsUrl);

    if (response.data.status !== 'OK' || !response.data.result) {
      return NextResponse.json({ error: `Failed to fetch place details: ${response.data.status}` }, { status: 404 });
    }

    const place = response.data.result;

    const reviews = place.reviews?.map((review: any) => {
      const relativeTime = getRelativeTimeString(review.time);
      return {
        authorName: review.author_name,
        authorPhoto: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relativeTime,
        language: review.language,
      };
    });

    const venueData = {
      id: placeId,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total,
      price: 'Prix sur demande',
      phoneNumber: place.formatted_phone_number,
      internationalPhoneNumber: place.international_phone_number,
      website: place.website,
      openingHours: place.opening_hours
        ? {
            isOpen: place.opening_hours.open_now,
            weekdayText: place.opening_hours.weekday_text,
          }
        : undefined,
      photos: place.photos?.map((photo: any) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
      })),
      reviews,
      placeUrl: place.url,
      types: place.types,
      location: place.geometry?.location
        ? {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          }
        : undefined,
    };

    await setCachedVenue(placeId, venueData);
    return NextResponse.json(venueData);
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return NextResponse.json({ error: 'Failed to fetch venue details' }, { status: 500 });
  }
}

// Helper function for relative time (French)
function getRelativeTimeString(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = now - timestamp;

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diffSeconds < minute) return "à l'instant";
  if (diffSeconds < hour) return `il y a ${Math.floor(diffSeconds / minute)} minute(s)`;
  if (diffSeconds < day) return `il y a ${Math.floor(diffSeconds / hour)} heure(s)`;
  if (diffSeconds < week) return `il y a ${Math.floor(diffSeconds / day)} jour(s)`;
  if (diffSeconds < month) return `il y a ${Math.floor(diffSeconds / week)} semaine(s)`;
  if (diffSeconds < year) return `il y a ${Math.floor(diffSeconds / month)} mois`;

  return `il y a ${Math.floor(diffSeconds / year)} an(s)`;
}
