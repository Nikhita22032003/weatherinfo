import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Forecast {
  date: string;
  min: number;
  max: number;
  weatherCode: number;
}

interface WeatherChartsProps {
  forecast: Forecast[];
}

const COLORS = ["#60a5fa", "#f59e0b", "#ef4444", "#10b981"];

export default function WeatherCharts({ forecast }: WeatherChartsProps) {
  const lineData = forecast.map((day) => ({
    date: new Date(day.date).toLocaleDateString(undefined, { weekday: "short" }),
    Min: day.min,
    Max: day.max,
  }));

  const avgMin = Math.round(forecast.reduce((sum, d) => sum + d.min, 0) / forecast.length);
  const avgMax = Math.round(forecast.reduce((sum, d) => sum + d.max, 0) / forecast.length);

  const pieData = [
    { name: "Avg Min Temp", value: avgMin },
    { name: "Avg Max Temp", value: avgMax },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6 w-full max-w-4xl">
      <div className="bg-white/80 p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">🌡️ Temperature Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Max" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Min" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/80 p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">📊 Avg Temperatures</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
