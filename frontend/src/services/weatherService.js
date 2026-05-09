/**
 * src/services/weatherService.js
 * ------------------------------
 * Fetches real weather data from Visual Crossing.
 */

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const GP_LOCATIONS = {
  "Bahrain": "Sakhir, Bahrain",
  "Saudi Arabian": "Jeddah, Saudi Arabia",
  "Australian": "Melbourne, Australia",
  "Japanese": "Suzuka, Japan",
  "Chinese": "Shanghai, China",
  "Miami": "Miami, USA",
  "Emilia Romagna": "Imola, Italy",
  "Monaco": "Monaco",
  "Canadian": "Montreal, Canada",
  "Spanish": "Barcelona, Spain",
  "Austrian": "Spielberg, Austria",
  "British": "Silverstone, UK",
  "Hungarian": "Budapest, Hungary",
  "Belgian": "Spa, Belgium",
  "Dutch": "Zandvoort, Netherlands",
  "Italian": "Monza, Italy",
  "Azerbaijan": "Baku, Azerbaijan",
  "Singapore": "Singapore",
  "United States": "Austin, USA",
  "Mexico City": "Mexico City, Mexico",
  "Sao Paulo": "Sao Paulo, Brazil",
  "Las Vegas": "Las Vegas, USA",
  "Qatar": "Lusail, Qatar",
  "Abu Dhabi": "Abu Dhabi, UAE"
};

export async function fetchTrackWeather(gpName, year) {
  try {
    const location = GP_LOCATIONS[gpName] || gpName;
    // For simplicity, if it's 2026, we fetch current. 
    // If it's past, we could fetch historical, but let's start with Current/Forecast.
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${API_KEY}&contentType=json`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather service unavailable");
    
    const data = await response.json();
    return {
      temp: data.currentConditions.temp,
      humidity: data.currentConditions.humidity,
      wind: data.currentConditions.windspeed,
      status: data.currentConditions.conditions,
      track: data.currentConditions.temp + 5, // Simulated track temp based on air
      isReal: true
    };
  } catch (err) {
    console.error("Weather Error:", err);
    return null;
  }
}
