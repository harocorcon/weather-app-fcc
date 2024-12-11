import Image from "next/image";
import Navbar from "./components/Navbar";
export default function Home() {
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar/>
    </div>
  );
}

// TypeScript Type for Weather Data
export interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherEntry[];
  city: CityInfo;
}

export interface WeatherEntry {
  dt: number;
  main: MainWeather;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number; // Probability of precipitation
  rain?: Rain; // Optional as not all entries may have rain data
  sys: Sys;
  dt_txt: string; // Date-time in string format
}

export interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number; // Internal parameter
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface Clouds {
  all: number; // Cloudiness percentage
}

export interface Wind {
  speed: number;
  deg: number; // Wind direction in degrees
  gust?: number; // Optional gust value
}

export interface Rain {
  "3h": number; // Rain volume for the last 3 hours
}

export interface Sys {
  pod: string; // Part of the day ('n' for night, 'd' for day)
}

export interface CityInfo {
  id: number;
  name: string;
  coord: Coordinates;
  country: string;
  population: number;
  timezone: number; // Offset from UTC in seconds
  sunrise: number; // Sunrise time in UTC seconds
  sunset: number; // Sunset time in UTC seconds
}

export interface Coordinates {
  lat: number;
  lon: number;
}

