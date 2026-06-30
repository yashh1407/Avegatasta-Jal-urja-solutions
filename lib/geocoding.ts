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

  // Use OpenStreetMap Nominatim API directly (free, requires no API keys)
  try {
    console.log(`[Geocoding] Attempting OpenStreetMap Nominatim reverse geocode for: ${latitude}, ${longitude}`);
    
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
