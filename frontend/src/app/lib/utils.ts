// Interface for geographic coordinates (latitude and longitude)
export interface ICoordinates {
    latitude: number; // Latitude of the location
    longitude: number; // Longitude of the location
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Helper to form URLs (ensure no trailing slash issues)
const buildUrl = (path: string) => `${BACKEND_URL?.replace(/\/$/, "")}${path}`;

/**
 * Fetches the current weather data for specific geographic coordinates.
 *
 * @param param0 - An object of type ICoordinates containing latitude and longitude
 * @returns A promise that resolves to the weather data as JSON
 */
export async function getWeather({ latitude, longitude }: ICoordinates) {
    const url = buildUrl(`/api/get-weather?lat=${latitude}&lon=${longitude}`);
    const res = await fetch(url);
    return await res.json(); // Return the JSON response
}

/**
 * Fetches geographic coordinates (latitude and longitude) based on a search query.
 *
 * @param query - The search query (e.g., city name or address)
 * @returns A promise that resolves to geolocation data as JSON
 */
export async function getGeoCodeFromQuery(query: string) {
    const url = buildUrl(`/api/get-geocode?q=${query}&limit=5`);
    const res = await fetch(url);
    return await res.json(); // Return the JSON response
}

/**
 * Fetches the hourly weather forecast for specific geographic coordinates.
 *
 * @param param0 - An object of type ICoordinates containing latitude and longitude
 * @returns A promise that resolves to the hourly forecast as JSON
 */
export async function getHourlyForecast({ latitude, longitude }: ICoordinates) {
    const url = buildUrl(`/api/get-forecast?lat=${latitude}&lon=${longitude}&period=hourly`);
    const res = await fetch(url);
    return await res.json(); // Return the JSON response
}

/**
 * Fetches the daily weather forecast for specific geographic coordinates.
 *
 * @param param0 - An object of type ICoordinates containing latitude and longitude
 * @returns A promise that resolves to the daily forecast as JSON
 */
export async function getDailyForecast({ latitude, longitude }: ICoordinates) {
    const url = buildUrl(`/api/get-forecast?lat=${latitude}&lon=${longitude}&period=daily`);
    const res = await fetch(url);
    return await res.json(); // Return the JSON response
}

/**
 * Fetches the geographic coordinates for a specific city based on the query.
 *
 * @param query - The name of the city to search for
 * @returns A promise that resolves to the geolocation data as JSON (limited to 1 result)
 */
export async function getGeoCodeFromQueryForCity(query: string) {
    const url = buildUrl(`/api/get-geocode?q=${query}&limit=1`);
    const res = await fetch(url);
    return await res.json(); // Return the JSON response
}

/**
 * Returns a human-readable weather description based on a given input string.
 * Maps specific keywords to general weather descriptions.
 *
 * @param desc - The input weather description string (e.g., forecast data)
 * @returns A promise that resolves to a formatted weather description
 */
export async function getWeatherDescription(desc: string): Promise<string> {
    // Map of general weather descriptions to their associated keywords
    const weatherMapping = new Map<string, Set<string>>([
        ["Sunny", new Set(["clear"])], // Keywords that map to "Sunny"
        ["Cloudy", new Set(["cloud"])], // Keywords that map to "Cloudy"
        ["Light Rain", new Set(["light rain", "drizzle"])], // Keywords that map to "Light Rain"
        ["Heavy Rain", new Set(["heavy rain"])], // Keywords that map to "Heavy Rain"
        ["Rain", new Set(["rain"])], // Keywords that map to "Rain"
        ["Storm", new Set(["thunderstorm"])], // Keywords that map to "Storm"
        ["Snow", new Set(["snow"])], // Keywords that map to "Snow"
        ["Foggy", new Set(["mist", "fog"])], // Keywords that map to "Foggy"
        ["Windy", new Set(["wind"])], // Keywords that map to "Windy"
        ["Hazy", new Set(["haze"])] // Keywords that map to "Hazy"
    ]);

    // Iterate over the entries in the weatherMapping map
    for (const [weather, keywords] of weatherMapping) {
        // Check if the input description includes any keyword from the current set
        if (Array.from(keywords).some(keyword => desc.includes(keyword))) {
            return weather; // Return the mapped general weather description
        }
    }

    // Fallback: Capitalize the first letter of the input description and return it
    return desc.charAt(0).toUpperCase() + desc.slice(1);
}


export function getWeatherIcon(icon_name: string, size: number): string {
    // Ensure the size is constrained to valid values (1, 2, or 4)
    const validSizes = new Set([1, 2, 4]);
    const iconSize = validSizes.has(size) ? size : 2; // Default to 2x if an invalid size is provided

    // Construct and return the URL using the given icon name and size
    return `https://openweathermap.org/img/wn/${icon_name}@${iconSize}x.png`;
}