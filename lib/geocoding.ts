/**
 * Backend Geocoding & Reverse Geocoding Utility
 */
import { getSetting } from '@/lib/settings';

export async function resolveAddress(lat: number | string, lng: number | string): Promise<string | null> {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  // Prefer the dashboard-managed key (Admin → Site Settings → Integrations),
  // falling back to the GOOGLE_MAPS_API_KEY env var. Trim so a blank/whitespace
  // dashboard value doesn't shadow a working env key.
  const dbKey = (await getSetting('google_maps_api_key'))?.trim();
  const apiKey = dbKey || process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      console.log(`[Geocoding] Attempting reverse geocode using Google Maps API for: ${latitude}, ${longitude}`);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log(`[Geocoding] Google Maps Geocoding success: ${address}`);
          return address;
        } else {
          console.warn(`[Geocoding] Google Maps Geocoding API returned status: ${data.status}`);
        }
      } else {
        console.warn(`[Geocoding] Google Maps Geocoding request failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('[Geocoding] Google Maps Geocoding request error:', err);
    }
  }

  // Fallback to OpenStreetMap Nominatim API
  try {
    console.log(`[Geocoding] Falling back to OpenStreetMap Nominatim reverse geocode for: ${latitude}, ${longitude}`);
    
    // Nominatim requires a custom User-Agent to avoid blocking
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Avegatasta-Sales-Portal-Reverse-Geocoding-Agent/1.0 (contact@avegatasta.com)'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        console.log(`[Geocoding] OpenStreetMap Nominatim success: ${data.display_name}`);
        return data.display_name;
      }
    } else {
      console.warn(`[Geocoding] Nominatim request failed with status: ${response.status}`);
    }
  } catch (err) {
    console.error('[Geocoding] Nominatim reverse geocode error:', err);
  }

  return `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
