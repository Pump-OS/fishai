// ============================================================
// Weather Service — OpenWeather API wrapper (isolated)
// ============================================================

import type { WeatherForecast } from "@/types";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

interface OpenWeatherCurrent {
  main: { temp: number; humidity: number };
  wind: { speed: number };
  weather: Array<{ description: string; icon: string }>;
  name: string;
  sys: { country: string };
}

interface OpenWeatherForecastItem {
  dt: number;
  main: { temp_min: number; temp_max: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
  pop: number;
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: { name: string; country: string };
}

export async function getWeatherForecast(
  city: string,
  country?: string
): Promise<WeatherForecast> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("OpenWeather API key not configured");

  const query = country ? `${city},${country}` : city;

  // Fetch current weather + 5-day forecast in parallel
  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`
    ),
    fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`
    ),
  ]);

  if (!currentRes.ok) {
    throw new Error(`Weather API error: ${currentRes.status} — ${await currentRes.text()}`);
  }

  const current: OpenWeatherCurrent = await currentRes.json();
  const forecastData: OpenWeatherForecastResponse = forecastRes.ok
    ? await forecastRes.json()
    : { list: [], city: { name: city, country: country || "" } };

  // Aggregate forecast into daily entries (take noon reading per day)
  const dailyMap = new Map<string, OpenWeatherForecastItem>();
  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    const hour = new Date(item.dt * 1000).getHours();
    if (!dailyMap.has(date) || Math.abs(hour - 12) < Math.abs(new Date(dailyMap.get(date)!.dt * 1000).getHours() - 12)) {
      dailyMap.set(date, item);
    }
  }

  return {
    city: current.name || city,
    country: current.sys?.country || country || "",
    current: {
      temp_c: Math.round(current.main.temp),
      humidity: current.main.humidity,
      wind_speed_kmh: Math.round(current.wind.speed * 3.6),
      description: current.weather[0]?.description || "unknown",
      icon: current.weather[0]?.icon || "01d",
    },
    daily: Array.from(dailyMap.entries())
      .slice(0, 5)
      .map(([date, item]) => ({
        date,
        temp_min_c: Math.round(item.main.temp_min),
        temp_max_c: Math.round(item.main.temp_max),
        description: item.weather[0]?.description || "unknown",
        icon: item.weather[0]?.icon || "01d",
        wind_speed_kmh: Math.round(item.wind.speed * 3.6),
        pop: Math.round(item.pop * 100),
      })),
  };
}
