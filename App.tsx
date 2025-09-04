import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import WeatherCharts from "./components/WeatherCharts";
import NewsCard from "./components/NewsCard";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

// Interfaces
interface Forecast {
  date: string;
  min: number;
  max: number;
  weatherCode: number;
  precipitation?: number;
}

interface RawWeatherData {
  daily?: {
    time?: string[];
    pressure_msl?: number[];
    uv_index_max?: number[];
    visibility_max?: number[];
    dewpoint_2m_max?: number[];
    windspeed_10m_max?: number[];
    sunrise?: string[];
    sunset?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weathercode?: number[];
    precipitation_sum?: number[];
  };
  hourly?: {
    temperature_2m?: number[];
    weathercode?: number[];
    relative_humidity_2m?: number[];
  };
}

interface WeatherData {
  city: string;
  temperature: number;
  wind: number;
  weatherCode: number;
  forecast?: Forecast[];
  rawData?: RawWeatherData;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
}

// Utility functions
const getEmojiFromCode = (code?: number) => {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code ?? -1)) return "⛅";
  if ([61, 63, 65, 80, 81, 82].includes(code ?? -1)) return "🌧️";
  if ([71, 73, 75, 85, 86].includes(code ?? -1)) return "❄️";
  if ([95, 96, 99].includes(code ?? -1)) return "⛈️";
  return "🌡️";
};



const getBackground = (code: number | null) => {
  if (code === null) return "from-blue-200 to-indigo-300";
  if (code === 0) return "from-yellow-300 to-orange-400";
  if ([1, 2, 3].includes(code)) return "from-gray-300 to-gray-500";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "from-blue-400 to-blue-700";
  if ([71, 73, 75, 85, 86].includes(code)) return "from-blue-100 to-white";
  if ([95, 96, 99].includes(code)) return "from-purple-600 to-gray-900";
  return "from-blue-200 to-indigo-300";
};

const buildForecast = (weatherData: RawWeatherData, days = 7): Forecast[] => {
  if (!weatherData.daily || !weatherData.daily.temperature_2m_min || !weatherData.daily.temperature_2m_max || !weatherData.daily.weathercode) {
    return [];
  }

  return weatherData.daily.time?.slice(0, days).map((date: string, i: number) => ({
    date,
    min: weatherData.daily!.temperature_2m_min![i],
    max: weatherData.daily!.temperature_2m_max![i],
    weatherCode: weatherData.daily!.weathercode![i],
    precipitation: weatherData.daily!.precipitation_sum?.[i] ?? 0,
  })) ?? [];
};

const getWeatherInsights = (data?: RawWeatherData): string[] => {
  const insights: string[] = [];
  if (!data?.daily) return insights;

  const temps = data.daily.temperature_2m_max;
  const codes = data.daily.weathercode;

  if (temps && codes) {
    const yesterday = temps[0];
    const today = temps[1];

    if (today > yesterday) insights.push("Today is hotter than yesterday 🔥");
    else if (today < yesterday) insights.push("Today is cooler than yesterday ❄️");
    else insights.push("Today’s temperature is similar to yesterday 🌡️");

    const tomorrowCode = codes[2];
    if ([61, 63, 65, 80, 81, 82].includes(tomorrowCode)) insights.push("Expect rain tomorrow 🌧️");
    if ([71, 73, 75, 85, 86].includes(tomorrowCode)) insights.push("Snowfall is likely tomorrow ❄️");
    if ([95, 96, 99].includes(tomorrowCode)) insights.push("Thunderstorms possible tomorrow ⛈️");
  }

  return insights;
};

// Main App
function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);

  const commonParams = "current_weather=true&hourly=temperature_2m,weathercode,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,sunrise,sunset,windspeed_10m_max&timezone=auto";

  // Fetch weather by city
  const fetchWeather = async (city: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setWeather(null);

      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
      const geoData = await geoRes.json();

      if (!geoData.results?.length) {
        setError("City not found. Try again.");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&${commonParams}`);
      const weatherData = await weatherRes.json();

      setWeather({
        city: `${name}, ${country}`,
        temperature: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        weatherCode: weatherData.current_weather.weathercode,
        forecast: buildForecast(weatherData),
        rawData: weatherData,
      });
    } catch {
      setError("Failed to fetch weather data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weather by geolocation
  const fetchWeatherByCoords = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setWeather(null);

      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const geoData = await geoRes.json();

      const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || "Your Location";
      const country = geoData.address?.country || "";

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&${commonParams}`);
      const weatherData = await weatherRes.json();

      setWeather({
        city: `${cityName}, ${country}`,
        temperature: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        weatherCode: weatherData.current_weather.weathercode,
        forecast: buildForecast(weatherData),
        rawData: weatherData,
      });
    } catch {
      setError("Failed to fetch weather data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch news
  const fetchNews = async () => {
    try {
      const res = await fetch(`https://newsapi.org/v2/everything?q=weather OR climate&language=en&sortBy=publishedAt&pageSize=6&apiKey=YOUR_API_KEY`);
      const data = await res.json();
      setNews(data.articles || []);
    } catch (err) {
      console.error("❌ Failed to fetch news:", err);
    }
  };

  useEffect(() => {
    fetchNews();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather("Hyderabad"), // fallback
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchWeather("Hyderabad");
    }
  }, []);

  const hourIdx = (() => {
    try {
      return Number(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false }));
    } catch {
      return 12;
    }
  })();

  const humidityToday = weather?.rawData?.hourly?.relative_humidity_2m?.[hourIdx] ?? 60;
  const humidityTomorrow = weather?.rawData?.hourly?.relative_humidity_2m?.[24 + hourIdx] ?? 58;

  return (
    <>
      {/* Video Background */}
      <video
  autoPlay
  loop
  muted
  playsInline
  className="fixed top-0 left-0 w-full h-full object-cover -z-10"
  src={`${import.meta.env.BASE_URL}videos/clear.mp4`}
/>



      <motion.div
        key={weather?.weatherCode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className={`min-h-screen overflow-y-auto ${getBackground(weather?.weatherCode ?? null)} flex flex-col items-center`}
      >
        <div className="w-full max-w-6xl px-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">🌦️ Weather Dashboard</h1>
            <SearchBar onSearch={fetchWeather} />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-xl shadow-xl text-center">
                <p className="text-lg font-semibold">⏳ Please wait, fetching weather...</p>
              </motion.div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Weather Info */}
          {weather && !isLoading && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WeatherCard city={weather.city} temperature={weather.temperature} wind={weather.wind} weatherCode={weather.weatherCode} forecast={weather.forecast} />

              {/* Today + Tomorrow */}
              <div className="grid grid-cols-2 gap-3">
                {/* Today */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/90 rounded-xl p-3 shadow-lg text-center flex flex-col items-center justify-center space-y-2 hover:scale-105 transition">
                  <h3 className="font-bold text-sm">☀️ Today</h3>
                  <p className="text-lg font-semibold">{weather.forecast?.[0]?.max}° / {weather.forecast?.[0]?.min}°</p>
                  <span className="text-3xl animate-pulse">{getEmojiFromCode(weather.weatherCode)}</span>

                  <div className="w-full h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: "Humidity", value: humidityToday }, { name: "Precip", value: weather.forecast?.[0]?.precipitation ?? 0 }]} dataKey="value" outerRadius={40} label>
                          <Cell fill="#60a5fa" />
                          <Cell fill="#34d399" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-xs">💨 Wind: {weather.wind} km/h</p>
                  <p className="text-xs">🌅 {weather.rawData?.daily?.sunrise?.[0]?.split("T")[1]} | 🌇 {weather.rawData?.daily?.sunset?.[0]?.split("T")[1]}</p>
                  <p className="text-xs">🌡 Pressure: {weather.rawData?.daily?.pressure_msl?.[0] ?? 'Low'} hPa</p>
                  <p className="text-xs">🌞 UV Index: {weather.rawData?.daily?.uv_index_max?.[0] ?? 'Low'}</p>
                  <p className="text-xs">👀 Visibility: {weather.rawData?.daily?.visibility_max?.[0] ?? 'High'}</p>
                  <p className="text-xs">💧 Dew Point: {weather.rawData?.daily?.dewpoint_2m_max?.[0] ?? '60'}%</p>
                </motion.div>

                {/* Tomorrow */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-white/90 rounded-xl p-3 shadow-lg text-center flex flex-col items-center justify-center space-y-2 hover:scale-105 transition">
                  <h3 className="font-bold text-sm">🌤 Tomorrow</h3>
                  <p className="text-lg font-semibold">{weather.forecast?.[1]?.max}° / {weather.forecast?.[1]?.min}°</p>
                  <span className="text-3xl animate-bounce">{getEmojiFromCode(weather.forecast?.[1]?.weatherCode)}</span>

                  <div className="w-full h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: "Humidity", value: humidityTomorrow }, { name: "Precip", value: weather.forecast?.[1]?.precipitation ?? 0 }]} dataKey="value" outerRadius={40} label>
                          <Cell fill="#f59e0b" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-xs">💨 Wind: {weather.rawData?.daily?.windspeed_10m_max?.[1] ?? 12} km/h</p>
                  <p className="text-xs">🌅 {weather.rawData?.daily?.sunrise?.[1]?.split("T")[1]} | 🌇 {weather.rawData?.daily?.sunset?.[1]?.split("T")[1]}</p>
                  <p className="text-xs">🌡 Pressure: {weather.rawData?.daily?.pressure_msl?.[1] ?? 'Low'} hPa</p>
                  <p className="text-xs">🌞 UV Index: {weather.rawData?.daily?.uv_index_max?.[1] ?? 'Low'}</p>
                  <p className="text-xs">👀 Visibility: {weather.rawData?.daily?.visibility_max?.[1] ?? 'High'}</p>
                  <p className="text-xs">💧 Dew Point: {weather.rawData?.daily?.dewpoint_2m_max?.[1] ?? '70'}%</p>
                </motion.div>
              </div>

              {/* Hour parts */}
              <div className="grid grid-cols-3 gap-3 lg:col-span-2">
                <div className="bg-white/85 rounded-xl p-3 shadow text-center">🌅 Morning — {weather.rawData?.hourly?.temperature_2m?.[8]}°C</div>
                <div className="bg-white/85 rounded-xl p-3 shadow text-center">🌤 Afternoon — {weather.rawData?.hourly?.temperature_2m?.[14]}°C</div>
                <div className="bg-white/85 rounded-xl p-3 shadow text-center">🌙 Evening — {weather.rawData?.hourly?.temperature_2m?.[20]}°C</div>
              </div>

              {/* 7-day mini forecast */}
              <div className="lg:col-span-2 bg-white/85 rounded-xl p-3 shadow">
                <h3 className="font-bold mb-2">7-Day Forecast</h3>
                <div className="flex justify-between gap-2">
                  {weather.forecast?.map((d) => (
                    <div key={d.date} className="flex flex-col items-center text-sm">
                      <p>{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</p>
                      <p className="font-semibold">{d.max}°</p>
                      <p className="text-xs">{d.min}°</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="lg:col-span-2 bg-white/85 rounded-xl p-3 shadow">
                <h3 className="text-lg font-semibold mb-2">📈 Weather Insights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {getWeatherInsights(weather.rawData).map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>

              {/* Charts */}
              {weather.forecast && (
                <div className="lg:col-span-2">
                  <WeatherCharts forecast={weather.forecast} />
                </div>
              )}

              {/* News */}
              {news.length > 0 && (
                <div className="lg:col-span-2">
                  <NewsCard articles={news} />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default App;
