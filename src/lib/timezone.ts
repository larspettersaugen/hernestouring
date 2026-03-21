const FALLBACK_CITIES: Record<string, string> = {
  oslo: 'Europe/Oslo',
  bergen: 'Europe/Oslo',
  trondheim: 'Europe/Oslo',
  stavanger: 'Europe/Oslo',
  copenhagen: 'Europe/Copenhagen',
  stockholm: 'Europe/Stockholm',
  gothenburg: 'Europe/Stockholm',
  helsinki: 'Europe/Helsinki',
  reykjavik: 'Atlantic/Reykjavik',
  london: 'Europe/London',
  berlin: 'Europe/Berlin',
  amsterdam: 'Europe/Amsterdam',
  paris: 'Europe/Paris',
  madrid: 'Europe/Madrid',
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
};

/**
 * Look up IANA timezone from a city name.
 * Uses city-timezones when available, with fallback for common cities.
 */
export function getTimezoneFromCity(city: string): string | null {
  if (!city?.trim()) return null;
  const key = city.trim().toLowerCase();
  const fallback = FALLBACK_CITIES[key];
  if (fallback) return fallback;
  try {
    const cityTimezones = require('city-timezones');
    const matches = cityTimezones.lookupViaCity(city.trim());
    if (Array.isArray(matches) && matches.length > 0) {
      const tz = matches[0].timezone;
      return typeof tz === 'string' ? tz : null;
    }
  } catch {
    // city-timezones not installed or lookup failed
  }
  return null;
}

/** Common timezones for dropdown selection */
export const COMMON_TIMEZONES = [
  'Europe/Oslo',
  'Europe/Stockholm',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];
