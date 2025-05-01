"use client";

import "tailwindcss";
import "./globals.css";



import { useEffect, useState } from "react";
import {
  getWeather,
  getGeoCodeFromQueryForCity,
  getWeatherIcon,
  getWeatherDescription,
  ICoordinates, getGeoCodeFromQuery,
} from "@/app/lib/utils";
import Image from "next/image";
import useGeolocation from "@/app/lib/useGeolocation";
import Markdown from "react-markdown";

interface WeatherData {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  wind_speed: number;
  weather: { icon: string; description: string }[];
}

interface ForecastItem {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  weather: { icon: string; description: string }[];
}

export default function Home() {
  const [city, setCity] = useState<string>(""); // Default city input
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const {coordinates, error} = useGeolocation();
  const [geminiInput, setGeminiInput] = useState("");
  const [geminiResult, setGeminiResult] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [search_coordinates, setCoordinates] = useState<ICoordinates | null>(null);
  const handleCityInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    if (e.target.value.length >= 2) {
      setLoading(true);
      try {
        const results = await getGeoCodeFromQuery(e.target.value); // returns up to 5
        setSearchResults(Array.isArray(results) ? results : []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };
  const handleSelectResult = (result: any) => {
    setCity(result.name);
    setCoordinates({ latitude: result.lat, longitude: result.lon }); // assuming setCoordinates in your state
    setShowResults(false);
    setSearchResults([]);
  };

  const handleCitySelect = async (city: object) => {
    const geo = await getGeoCodeFromQueryForCity(city.name);
    console.log(city)
    if (!geo?.length) return;
    const { lat, lon } = geo[0];
    console.log(geo[0])
    const newWeather = await getWeather({ latitude:lat, longitude:lon });
    console.log(newWeather)
    setWeather(newWeather.current);
    setCity(city.name);
    setSearchResults([])
    setShowResults(false)
  };




  async function handleGeminiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!geminiInput.trim()) return;
    setGeminiLoading(true);
    setGeminiResult(null);

    // Create a weather summary if weather is available
    let weatherContext = null;
    if (weather) {
      weatherContext = `Temperature: ${Math.round(weather.temp - 273.15)}°C, ` +
          `Feels like: ${Math.round(weather.feels_like - 273.15)}°C, ` +
          `Status: ${weather.weather?.[0]?.description}, ` +
          `Wind: ${weather.wind_speed} m/s, Humidity: ${weather.humidity}%`;
    }

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          prompt: geminiInput.trim(),
          weatherContext
        }),
      });
      const data = await res.json();
      setGeminiResult(data.text || data.error || "No response.");
    } catch (err) {
      setGeminiResult("Error contacting Gemini API.");
    } finally {
      setGeminiLoading(false);
    }
  }


  const searchCity = async () => {
    let coords: ICoordinates | null = null;

    try {
      setLoading(true);

      // Get coordinates from geolocation or city
      if (!city && coordinates) {
        coords = coordinates;
      } else if (city) {
        const geocode = await getGeoCodeFromQueryForCity(city);
        if (!geocode?.[0]?.lat || !geocode?.[0]?.lon) {
          throw new Error("Invalid location");
        }
        coords = {
          latitude: geocode[0].lat,
          longitude: geocode[0].lon,
        };
      }
      if(search_coordinates!=null) coords=search_coordinates;

      if (!coords) {
        throw new Error("Unable to determine location.");
      }

      // Fetch weather data
      const weatherData = await getWeather(coords);
      console.log(weatherData)

      // Format weather description for `current`
      if (weatherData.current.weather?.[0]) {
        weatherData.current.weather[0].description = await getWeatherDescription(
            weatherData.current.weather[0].description
        );
      }

      // Format forecast descriptions for `daily`
      const formattedForecast = weatherData.daily.slice(0, 3).map((item: ForecastItem) => ({
        ...item,
        weather: [
          {
            ...item.weather[0],
            description: getWeatherDescription(item.weather[0].description),
          },
        ],
      }));

      // Update state with fetched data
      setWeather(weatherData.current);
      setForecast(formattedForecast);
    } catch (error) {
      console.error("Error while fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!city && coordinates) {
      // Fetch weather for geolocation if no city is provided
      searchCity();
    }
  }, [ coordinates, search_coordinates]);

  return (
      <div
          className="relative min-h-screen bg-gradient-to-br from-green-500 via-teal-300 to-cyan-400 p-8 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Weather Display Card */}
          <div
              className="bg-white/30 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center shadow-2xl border border-white/40">
            {weather && (
                <>
                  <Image
                      src={getWeatherIcon(weather.weather[0].icon, 4)}
                      alt="Weather Icon"
                      width={192}
                      height={192}
                      className="w-48 h-48 mb-4"
                  />
                  <h2 className="text-6xl font-extrabold text-white mb-2">
                    {Math.round(weather.temp - 273.15)}°C
                  </h2>
                  <p className="text-2xl capitalize font-semibold text-white">
                    {weather.weather[0].description}
                  </p>
                  <div className="mt-8 text-center">
                    <p className="text-md text-white/80 mb-1">
                      {new Date(weather.dt * 1000).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {!showResults&& city}
                    </p>
                  </div>
                </>
            )}
          </div>

          {/* Forecast Section */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            {/* Search Input */}
            <div className="relative w-full">

            <input
                  type="text"
                  value={city}
                  onChange={handleCityInput}
                  className="w-full px-4 py-2 rounded-full border border-gray-300"
                  placeholder="Enter city"
              />
              {showResults && searchResults.length > 0 && (
                  <ul className="absolute left-0 right-0 mt-1 z-10 w-full bg-white shadow border rounded max-h-64 overflow-auto">
                    {searchResults.map((result, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleCitySelect(result)}
                            className="cursor-pointer px-4 py-2 hover:bg-cyan-50"
                        >
                          <span className="font-medium">{result.name}</span>
                          {result.state && <span className="ml-2 text-gray-500">{result.state}</span>}
                          {result.country && <span className="ml-2 text-gray-400">({result.country})</span>}
                        </li>
                    ))}
                  </ul>
              )}

            </div>


            {/* Three-Day Forecast */}
            {forecast.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {forecast.map((item, index) => (
                      <div key={index} className="bg-teal-300 p-4 rounded-2xl text-center shadow-lg">
                        <p className="text-md mb-2 text-teal-900">
                          {new Date(item.dt * 1000).toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </p>
                        <Image
                            src={getWeatherIcon(item.weather[0].icon, 2)}
                            alt="Forecast Icon"
                            width={64}
                            height={64}
                            className="w-16 h-16 mx-auto mb-2"
                        />
                        <p className="text-xl font-bold text-white">
                          {Math.round(item.temp.day - 273.15)}°C{/* Converted from Kelvin to Celsius */}
                        </p>
                        <p className="capitalize text-sm text-black/80">
                          {item.weather[0].description}
                        </p>
                      </div>
                  ))}
                </div>
            )}
            {/* Wind Status & Humidity Tiles at the Bottom */}
            {weather && (
                <div className="fixed bottom-0 left-0 w-full bg-white/50 backdrop-blur-md z-40 px-4 py-6">
                  <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-6 justify-center">
                    {/* Wind Status */}
                    <div className="flex-1 bg-white/80 rounded-2xl p-6 shadow flex flex-col items-center min-w-[160px]">
                      <span className="text-lg font-semibold text-cyan-800 mb-2">Wind Status</span>
                      <span className="text-4xl font-bold text-cyan-700">
                {weather.wind_speed} <span className="text-lg font-medium text-cyan-900">m/s</span>
              </span>
                      <span className="text-sm text-gray-500 mt-1">Current wind speed</span>
                    </div>
                    {/* Humidity with Progress Bar */}
                    <div className="flex-1 bg-white/80 rounded-2xl p-6 shadow flex flex-col items-center min-w-[160px]">
                      <span className="text-lg font-semibold text-teal-800 mb-2">Humidity</span>
                      <span className="text-4xl font-bold text-teal-700">
                {weather.humidity} <span className="text-lg font-medium text-teal-900">%</span>
              </span>
                      <div className="w-full mt-4">
                        <div className="w-full h-4 bg-gray-200 rounded-full">
                          <div
                              className="h-4 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 transition-all duration-300"
                              style={{width: `${weather.humidity}%`}}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 mt-2">Relative humidity</span>
                    </div>
                  </div>
                </div>
            )}
            {/* Gemini AI Assistant Q&A Section */}
            {/* Gemini AI Assistant Modal Trigger */}
            <button
                type="button"
                className="fixed bottom-8 right-8 z-50 bg-cyan-600 text-white rounded-full p-4 shadow-2xl hover:bg-cyan-700 transition"
                onClick={() => setShowGeminiModal(true)}
                aria-label="Ask Gemini AI"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            </button>

            {/* Gemini AI Assistant Modal */}
            {showGeminiModal && (
                <div className="fixed inset-0 z-50 bg-white bg-opacity-30 flex items-center justify-center">
                  <div className="bg-white/90 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-cyan-400 relative">
                    <button
                        className="absolute top-4 right-4 text-cyan-700 hover:text-cyan-900 text-2xl font-bold"
                        onClick={() => setShowGeminiModal(false)}
                        aria-label="Close Gemini AI Modal"
                    >
                      &times;
                    </button>
                    <h2 className="text-2xl font-bold mb-2 text-cyan-900">Ask Gemini AI anything</h2>
                    <form className="flex gap-4 mt-4" onSubmit={handleGeminiSubmit}>
                      <input
                          type="text"
                          className="flex-1 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 text-black"
                          value={geminiInput}
                          onChange={e => setGeminiInput(e.target.value)}
                          placeholder="Ask anything…"
                          disabled={geminiLoading}
                      />
                      <button
                          type="submit"
                          className="px-6 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
                          disabled={geminiLoading}
                      >
                        {geminiLoading ? "Thinking…" : "Ask"}
                      </button>
                    </form>
                    {geminiResult && (
                        <div className="mt-6 bg-cyan-50 rounded p-4 text-cyan-900 shadow-inner overflow-y-auto max-h-64 prose prose-cyan">
                          {/* Parsed/Formatted Markdown output */}
                          <Markdown>{geminiResult}</Markdown>
                        </div>
                    )}
                  </div>
                </div>
            )}


          </div>
        </div>
      </div>
  );
}