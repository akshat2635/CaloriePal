import { useState, useEffect } from "react";
import { Apple, Plus, User, ChevronDown } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";

export default function DashboardHeader({
  user,
  summary,
  onLogFood,
  onLogout,
  selectedDate,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const getLocalDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };
  const isToday = selectedDate === getLocalDate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    onLogout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 truncate">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="truncate">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                CaloriePal
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                Welcome back, {user?.name || user?.username}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {isToday && (
              <button
                onClick={onLogFood}
                className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base hidden sm:inline">
                  Log Food
                </span>
              </button>
            )}
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 py-2 sm:px-4 sm:py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Profile</span>
                <ChevronDown className="w-4 h-4 hidden sm:inline" />
              </button>

              <ProfileDropdown
                isOpen={isProfileOpen}
                summary={summary}
                onLogout={handleLogoutClick}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
