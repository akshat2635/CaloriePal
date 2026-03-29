import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { analyticsAPI } from "../../services/api";

const WeeklyProgressChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState("calories"); // calories, protein, carbs, fat

  const metrics = [
    { id: "calories", label: "Calories" },
    { id: "protein", label: "Protein" },
    { id: "carbs", label: "Carbs" },
    { id: "fat", label: "Fat" },
  ];

  const fetchWeeklyData = async (date) => {
    try {
      setLoading(true);
      // Format date to YYYY-MM-DD
      const dateStr = date.toISOString().split("T")[0];
      const response = await analyticsAPI.getWeeklyProgress(dateStr);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch weekly progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData(currentDate);
  }, [currentDate]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Determine if next week navigation should be disabled
  // Compare end of currently viewed week with today
  const isNextWeekDisabled = () => {
    if (!data) return false;
    const weekEnd = new Date(data.week_end);
    const today = new Date();
    // Zero out times for date-only comparison
    weekEnd.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return weekEnd >= today;
  };

  if (loading && !data)
    return (
      <div className="card h-64 flex items-center justify-center">
        Loading chart...
      </div>
    );
  if (!data) return null;

  const metricTargets = data.metrics[selectedMetric];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      if (val === 0) return null; // Don't show tooltip for empty data

      const isAchieved = val >= metricTargets.min && val <= metricTargets.max;

      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-md pointer-events-none mb-14">
          <p className="font-semibold text-white text-sm">{label}</p>
          <p className="text-gray-300 text-xs">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}:{" "}
            <span className="font-bold text-white">
              {val} {selectedMetric === "calories" ? "kcal" : "g"}
            </span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Target Range: {metricTargets.min} - {metricTargets.max}{" "}
            {selectedMetric === "calories" ? "kcal" : "g"}
          </p>
          <p
            className={`text-[10px] font-bold mt-0.5 ${isAchieved ? "text-green-400" : val > metricTargets.max ? "text-red-400" : "text-amber-400"}`}
          >
            {isAchieved
              ? "Goal Achieved! \u2728"
              : val > metricTargets.max
                ? "Over Target"
                : "Under Target"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Pre-process data for X-Axis to include date
  const chartData = data.daily_data.map((d) => {
    const dParts = d.date.split("-"); // ["YYYY", "MM", "DD"]
    const dayNumeric = dParts[2];
    return {
      ...d,
      displayDate: `${d.day_name} ${dayNumeric}`,
    };
  });

  return (
    <div className="card w-full">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
          Weekly Progress
        </h3>

        {/* Metric Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto w-full md:w-auto hide-scrollbar">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id)}
              className={`flex-1 md:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm whitespace-nowrap rounded-md transition-colors ${
                selectedMetric === m.id
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={handlePrevWeek}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap px-2">
            {new Date(data.week_start).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(data.week_end).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <button
            onClick={handleNextWeek}
            disabled={isNextWeekDisabled()}
            className={`p-1 rounded-md ${isNextWeekDisabled() ? "text-gray-400 dark:text-gray-500 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div
        className="h-72 w-full outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            style={{ outline: "none" }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#374151"
            />
            <XAxis
              dataKey="day_name"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax) => Math.max(dataMax, metricTargets.max)]}
              padding={{ top: 20 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
              isAnimationActive={false}
            />

            {/* Target Range Band */}
            <ReferenceArea
              y1={metricTargets.min}
              y2={metricTargets.max}
              fill="#10B981"
              fillOpacity={0.15}
            />

            <Bar dataKey={selectedMetric} radius={[4, 4, 0, 0]} barSize={48}>
              {chartData.map((entry, index) => {
                const val = entry[selectedMetric];
                const isAchieved =
                  val >= metricTargets.min && val <= metricTargets.max;
                const isOver = val > metricTargets.max;

                // Colors: Success (Green) if in range, Error (Red) if over, Warning/Gray if under
                const barColor = isAchieved
                  ? "#10B981" // green-500
                  : isOver
                    ? "#EF4444" // red-500
                    : "#3B82F6"; // blue-500

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColor}
                    opacity={val === 0 ? 0.3 : 0.8}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
