'use client';
import Navbar from "./components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "./components/Container";
import { convertKelvinToCelcius } from "@/utils/convertKelvinToCelcius";
import WeatherIcon from "./components/WeatherIcon";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import WeatherDetails from "./components/WeatherDetails";
import { metersToKm } from "@/utils/metersToKm";
import { convertWindSpeed } from "@/utils/windSpeed";

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;
  console.log("api ", apiKey);
  const { isLoading, error, data } = useQuery<WeatherData>(
    // {queryKey: ['repoData'], queryFn: async () => {
    "repoData", async() => {
      const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=hindang&appid=${apiKey}&cnt=56`);
      return data;
    });
    
  const firstData = data?.list[0];
  console.log("data: ", data?.city.country);
  if (isLoading) 
    return (
    <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* data today */}
        <section className="space-y-4">
          <div className="space-y-2"> 
            <h2 className="flex gap-1 text-2xl items-end">
              <p> {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")} </p>
              <p className="text-lg ">{format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")}</p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              {/* temperature left */}
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToCelcius(firstData?.main.temp ?? 296.37)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKelvinToCelcius(firstData?.main.temp_min ?? 0)}°↓{" "}
                  </span>
                  <span>
                  {" "}{convertKelvinToCelcius(firstData?.main.temp_max ?? 0)}°↑
                  </span>
                </p>
              </div>
              {/* time and weather icon */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((d, i)=>
                <div
                  key={i}
                  className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                    <p className="whitespace-nowrap">
                      {format(parseISO(d.dt_txt), "h:mm a")}
                    </p>
                    {/* <WeatherIcon iconname={d.weather[0].icon} /> */}
                    <WeatherIcon iconname={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)} />
                    <p>{convertKelvinToCelcius(d?.main.temp ?? 0)}°</p>
                </div>
                )}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">{firstData?.weather[0].description}</p>
              <WeatherIcon 
                iconname={getDayOrNightIcon(firstData?.weather[0].icon ?? "", firstData?.dt_txt ?? "")} />
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                <WeatherDetails 
                  visibility={metersToKm(firstData?.visibility ?? 10000)} 
                  humidity={`${firstData?.main.humidity}%`}
                  windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                  airPressure={`${firstData?.main.pressure} hPa`}
                  sunrise = {format(fromUnixTime(data?.city.sunrise ?? 1702949452),"H:mm")}
                  sunset = {format(fromUnixTime(data?.city.sunset ?? 1702949452),"H:mm")}
            />
            </Container>
          </div>
        </section>
        {/* 7 day data */}
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forcast (7 days)</p>
        </section>
      </main>
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

