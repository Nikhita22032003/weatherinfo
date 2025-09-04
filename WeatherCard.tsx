import { WiSunrise, WiSunset, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
interface Forecast {
  date: string;
  min: number;
  max: number;
  weatherCode: number;
}

interface WeatherCardProps {
  city: string;
  temperature: number;
  wind: number;
  weatherCode: number;
  forecast?: Forecast[];
  feelsLike?: number;
  sunrise?: string;
  sunset?: string;
  humidity?: number;
  pressure?: number; // ✅ Added forecast prop
}

export default function WeatherCard({  city,
  temperature,
  wind,
  weatherCode,
  forecast,
  feelsLike,
  sunrise,
  sunset,
  humidity,
  pressure,}: WeatherCardProps) {
  // Weather code mapping (from Open-Meteo docs)
  const getCondition = (code: number) => {
    const conditions: Record<number, string> = {
      0: "Clear Sky ☀️",
      1: "Mainly Clear 🌤️",
      2: "Partly Cloudy ⛅",
      3: "Overcast ☁️",
      61: "Rain 🌧️",
      71: "Snow ❄️",
      95: "Thunderstorm ⛈️",
    };

    return conditions[code] || "Unknown Weather";
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 text-center max-w-lg mx-auto mt-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800">{city}</h2>
      <p className="text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>

      {/* Main Weather Info */}
      <div className="mt-4">
        <p className="text-6xl font-extrabold text-blue-600">{temperature}°C</p>
        {feelsLike && <p className="text-gray-600">Feels like {feelsLike}°C</p>}
        <p className="text-lg font-medium mt-1">{getCondition(weatherCode)}</p>
      </div>

      {/* Extra Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700 mt-6">
        {sunrise && (
          <div className="flex flex-col items-center">
            <WiSunrise className="text-3xl text-yellow-500" />
            <span className="text-sm">Sunrise</span>
            <span className="font-semibold">{sunrise}</span>
          </div>
        )}
        {sunset && (
          <div className="flex flex-col items-center">
            <WiSunset className="text-3xl text-orange-500" />
            <span className="text-sm">Sunset</span>
            <span className="font-semibold">{sunset}</span>
          </div>
        )}
        {humidity !== undefined && (
          <div className="flex flex-col items-center">
            <WiHumidity className="text-3xl text-blue-400" />
            <span className="text-sm">Humidity</span>
            <span className="font-semibold">{humidity}%</span>
          </div>
        )}
        {wind !== undefined && (
          <div className="flex flex-col items-center">
            <WiStrongWind className="text-3xl text-gray-500" />
            <span className="text-sm">Wind</span>
            <span className="font-semibold">{wind} km/h</span>
          </div>
        )}
        {pressure !== undefined && (
          <div className="flex flex-col items-center">
            <WiBarometer className="text-3xl text-indigo-500" />
            <span className="text-sm">Pressure</span>
            <span className="font-semibold">{pressure} hPa</span>
          </div>
        )}
      </div>

      {/* ✅ 5-Day Forecast Section */}
      {forecast && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">5-Day Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {forecast.map((day) => (
              <div key={day.date} className="bg-blue-100 p-3 rounded-lg p-2">
                <p className="text-sm font-medium">
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className="text-sm">⬆️ {day.max}°C</p>
                <p className="text-sm">⬇️ {day.min}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
