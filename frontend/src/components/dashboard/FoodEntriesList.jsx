import { useState } from "react";
import {
  Activity,
  RefreshCw,
  Trash2,
  Apple,
  Clock,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";

export default function FoodEntriesList({
  entries,
  onRefresh,
  onClearAll,
  selectedDate,
  setSelectedDate,
}) {
  const [expandedMeals, setExpandedMeals] = useState({});

  const toggleMeal = (entryId, fallbackIndex) => {
    const key = entryId ?? `entry-${fallbackIndex}`;
    setExpandedMeals((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getLocalDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };

  const isToday = selectedDate === getLocalDate();
  const displayDate = isToday
    ? "Today's Food Log"
    : `Food Log (${selectedDate})`;

  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-6 gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center min-w-0">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary-600 flex-shrink-0" />
          <span className="truncate">{displayDate}</span>
          <label
            className="relative ml-1 sm:ml-2 flex items-center cursor-pointer flex-shrink-0"
            title="Select Date"
          >
            <div className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <input
              type="date"
              value={selectedDate || ""}
              max={getLocalDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </h3>
        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={onRefresh}
            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-primary-100 dark:border-primary-900/30 sm:border-none"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-sm font-medium ml-2">
              Refresh
            </span>
          </button>
          {entries.length > 0 && isToday && (
            <button
              onClick={onClearAll}
              className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 sm:border-none"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm font-medium ml-2">
                Clear All
              </span>
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Apple className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No food logged yet today
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Start by describing what you ate above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const hasItems =
              entry.is_combined_meal && entry.meal_items?.length > 0;
            const isExpanded = expandedMeals[entry.id ?? `entry-${index}`];

            return (
              <div
                key={entry.id ?? index}
                className={`p-4 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors ${hasItems ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (hasItems) {
                    toggleMeal(entry.id, index);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></div>
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {entry.food}
                      </h4>
                      <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-auto sm:ml-0">
                        <Clock className="w-4 h-4 mr-1" />
                        {entry.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {entry.is_combined_meal
                        ? entry.meal_summary || entry.portion
                        : entry.portion}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start space-x-2 sm:space-x-6 text-sm mt-3 sm:mt-0 bg-gray-100 dark:bg-gray-800 sm:bg-transparent sm:dark:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                    <div className="text-center">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {Math.round(entry.calories)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        cal
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600 dark:text-red-400">
                        {Math.round(entry.protein)}g
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        protein
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {Math.round(entry.fat)}g
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        fat
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {Math.round(entry.carbs)}g
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        carbs
                      </div>
                    </div>
                    {hasItems && (
                      <div className="text-gray-400 dark:text-gray-500 ml-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {hasItems && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                    {entry.meal_items.map((item, itemIndex) => (
                      <div
                        key={`${entry.id ?? index}-${item.id ?? itemIndex}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {item.food}
                            </h4>
                          </div>
                          <p className="mt-0.5 ml-4.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.portion}
                          </p>
                        </div>

                        <div className="flex items-center space-x-6 text-sm pr-7">
                          <div className="font-semibold text-gray-900 dark:text-white w-12 text-right">
                            {Math.round(item.calories)}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                              cal
                            </span>
                          </div>
                          <div className="font-semibold text-red-600 dark:text-red-400 w-8 text-right">
                            {Math.round(item.protein)}g
                          </div>
                          <div className="font-semibold text-yellow-600 dark:text-yellow-400 w-8 text-right">
                            {Math.round(item.fat)}g
                          </div>
                          <div className="font-semibold text-green-600 dark:text-green-400 w-8 text-right">
                            {Math.round(item.carbs)}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
