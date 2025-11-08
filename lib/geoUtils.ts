/**
 * Geo utilities for NYC-based distance and commute calculations
 * WITHOUT external API calls - uses approximate coordinates
 */

export type Coordinates = {
  lat: number;
  lon: number;
};

/**
 * Get approximate coordinates for NYC addresses/boroughs
 * This is a simple fallback that doesn't require external API calls
 */
export function getApproximateCoordinatesForAddress(address: string): Coordinates {
  const lower = address.toLowerCase();

  // Brooklyn
  if (lower.includes("brooklyn") || lower.includes("bk") || lower.includes("bklyn")) {
    return { lat: 40.6782, lon: -73.9442 };
  }
  
  // Queens
  if (lower.includes("queens") || lower.includes("qns")) {
    return { lat: 40.7282, lon: -73.7949 };
  }
  
  // Manhattan / NYC default
  if (lower.includes("manhattan") || lower.includes("new york, ny") || lower.includes("nyc")) {
    return { lat: 40.7831, lon: -73.9712 };
  }
  
  // Bronx
  if (lower.includes("bronx")) {
    return { lat: 40.8448, lon: -73.8648 };
  }
  
  // Staten Island
  if (lower.includes("staten island") || lower.includes("staten")) {
    return { lat: 40.5795, lon: -74.1502 };
  }

  // Fallback: center of NYC
  return { lat: 40.7128, lon: -74.0060 };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistanceMiles(a: Coordinates, b: Coordinates): number {
  const R = 3958.8; // Earth radius in miles
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const aa =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  const distance = R * c;
  
  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

/**
 * Estimate commute time based on distance
 * Assumes NYC transit patterns
 */
export function estimateCommute(distanceMiles: number): string {
  if (distanceMiles <= 2) return "≈10 min walk";
  if (distanceMiles <= 6) return "≈20–30 min subway";
  if (distanceMiles <= 12) return "≈35–45 min subway";
  return "≈1 hr+ commute";
}
