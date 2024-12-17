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
import ForecastWeatherDetail from "./components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, ] = useAtom(loadingCityAtom);
  
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;
  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    // {queryKey: ['repoData'], queryFn: async () => {
    "repoData", async() => {
      const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${apiKey}&cnt=56`);
      return data;
    });
    
  const firstData = data?.list[0];
  console.log("data: ", data?.city.country);

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  if (isLoading) 
    return (
    <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
    </div>
  );

  const uniqueDates = [
    ...new Set(data?.list.map(
      (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
    ))
  ];

  const firstDatePerDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry?.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    })
  })

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity? <WeatherSkeleton/>:(
        <>{/* data today */}
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
          {firstDatePerDate.map((d, i)=> (
            <ForecastWeatherDetail 
              key={i}
              description={d?.weather[0].description ?? ''} 
              weatherIcon={d?.weather[0].icon ?? '01d'} 
              date = {format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
              day = {format(parseISO(d?.dt_txt ?? ""), "EEEE")}
              feels_like={d?.main.feels_like ?? 0}
              temp={d?.main.temp ?? 0}
              temp_max={d?.main.temp_max ?? 0}
              temp_min={d?.main.temp_min ?? 0}
              airPressure={`${d?.main.pressure} hPa`}
              humidity={`${d?.main.humidity}%`}
              sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702517657), "H:mm")}
              sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
              visibility={`${metersToKm(d?.visibility ?? 1000)}`}
              windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}
            />
          ))}
          
          
        </section>
        </>)}
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8">
      <div className="space-y-2 animate-pulse">
        <div className="flex gap-1 text-2xl items-end">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        <div className="grid grid-cols-2 mdLgrid-cols-4 gap-4">
          {[1,2,3,4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* /* 7 day forecast */}
      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>
        {[1,2,3,4,5,6,7].map((index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-8 w-28 bg-gray-300 rounded"></div>
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="h-8 w-28 bg-gray-300 rounded"></div>
              <div className="h-8 w-28 bg-gray-300 rounded"></div>
            </div>
          ))}
      </div>
    </section>
  )
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

