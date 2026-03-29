import { TrendingUp, Flame, Drumstick, Droplet, Wheat } from "lucide-react";
import ConcentricRingsProgress from "./ConcentricRingsProgress";

export default function DailyProgressCard({ summary }) {
  const macros = [
    {
      icon: Flame,
      label: "Calories",
      current: summary.total_calories,
      target: summary.targets.calories,
      unit: "",
      color: "#f97316",
    },
    {
      icon: Drumstick,
      label: "Protein",
      current: summary.total_protein,
      target: summary.targets.protein,
      unit: "g",
      color: "#ef4444",
    },
    {
      icon: Droplet,
      label: "Fat",
      current: summary.total_fat,
      target: summary.targets.fat,
      unit: "g",
      color: "#eab308",
    },
    {
      icon: Wheat,
      label: "Carbs",
      current: summary.total_carbs,
      target: summary.targets.carbs,
      unit: "g",
      color: "#22c55e",
    },
  ];

  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Daily Progress
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {summary.total_calories > summary.targets.calories ? (
                <span className="text-red-500 font-semibold">
                  +
                  {Math.round(
                    summary.total_calories - summary.targets.calories,
                  )}{" "}
                  cal over target
                </span>
              ) : (
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {Math.round(
                    summary.targets.calories - summary.total_calories,
                  )}{" "}
                  cal remaining
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Goal:
          </span>{" "}
          <span className="font-semibold capitalize text-gray-900 dark:text-white">
            {summary.user.goal?.replace("_", " ")}
          </span>
        </div>
      </div>
      <ConcentricRingsProgress macros={macros} />
    </div>
  );
}
