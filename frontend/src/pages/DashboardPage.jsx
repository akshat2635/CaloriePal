import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { foodAPI } from "../services/api";
import FoodLogModal from "../components/FoodLogModal";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import FoodEntriesList from "../components/dashboard/FoodEntriesList";
import DailyProgressCard from "../components/dashboard/DailyProgressCard";
import AIInsightsCard from "../components/dashboard/AIInsightsCard";
import WeeklyProgressChart from "../components/dashboard/WeeklyProgressChart";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const getLocalDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const fetchSummary = async (date = selectedDate) => {
    setLoadingSummary(true);
    try {
      const response = await foodAPI.getSummary(date);
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleLogFood = async (foodInput) => {
    setLoading(true);

    try {
      const response = await foodAPI.logFood(foodInput);
      // Refresh summary
      await fetchSummary();
      return { success: true, message: response.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  const handleClearEntries = async () => {
    if (
      !window.confirm("Are you sure you want to clear all entries for today?")
    )
      return;

    try {
      await foodAPI.clearEntries();
      await fetchSummary();
    } catch (err) {
      console.error("Failed to clear entries:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        user={user}
        summary={summary}
        onLogFood={() => setIsModalOpen(true)}
        onLogout={logout}
        selectedDate={selectedDate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingSummary ? (
          <DashboardSkeleton />
        ) : summary ? (
          <>
            <FoodEntriesList
              entries={summary.entries}
              onRefresh={() => fetchSummary(selectedDate)}
              onClearAll={handleClearEntries}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            {/* Daily Progress and AI Insights - Single Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <DailyProgressCard summary={summary} />
              <AIInsightsCard insights={summary.ai_insights} />
            </div>
            {/* Weekly Progress Chart */}
            <div className="mb-6">
              <WeeklyProgressChart />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Failed to load summary
            </p>
          </div>
        )}
      </main>

      {/* Food Log Modal */}
      <FoodLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLogFood}
        loading={loading}
      />
      {/* </main> */}
    </div>
  );
}
