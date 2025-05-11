const axios = require('axios');

// API key from your .env file
const API_KEY = 'AIzaSyCX0FSwT9Mb7vrv_5jzLy3aOfSEdta38s8';

async function searchWeddingVenues() {
  try {
    console.log('Searching for wedding venues in Bordj Bouarreridj, Algeria...');
    
    // Search for wedding venues in Bordj Bouarreridj
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=salle+des+fetes+mariage+Bordj+Bouarreridj+Algeria&key=${API_KEY}`;
    
    const response = await axios.get(searchUrl);
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.results && response.data.results.length > 0) {
      // Get details for the first result
      const placeId = response.data.results[0].place_id;
      console.log(`\nGetting details for: ${response.data.results[0].name} (${placeId})`);
      
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,place_id,formatted_address,formatted_phone_number,international_phone_number,geometry,website,rating,user_ratings_total,reviews,photos,types,opening_hours&key=${API_KEY}`;
      
      const detailsResponse = await axios.get(detailsUrl);
      console.log('\nPlace Details:', JSON.stringify(detailsResponse.data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

searchWeddingVenues(); 