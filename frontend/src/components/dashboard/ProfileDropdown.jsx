import { User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({ isOpen, summary, onLogout }) {
  const navigate = useNavigate();
  if (!isOpen || !summary) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <User className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Your Metrics
          </h3>
        </div>

        <div className="space-y-2">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Target
            </div>
            <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {Math.round(summary.targets.calories)} cal
            </div>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              TDEE
            </span>
            <span className="text-xs font-semibold dark:text-white">
              {Math.round(summary.tdee)} cal
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              BMR
            </span>
            <span className="text-xs font-semibold dark:text-white">
              {Math.round(summary.bmr)} cal
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              BMI
            </span>
            <span className="text-xs font-semibold dark:text-white">
              {summary.bmi.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Weight
            </span>
            <span className="text-xs font-semibold dark:text-white">
              {summary.user.weight_kg} kg
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Height
            </span>
            <span className="text-xs font-semibold dark:text-white">
              {summary.user.height_cm} cm
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Goal
            </span>
            <span className="text-xs font-semibold dark:text-white capitalize">
              {summary.user.goal?.replace("_", " ")}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center justify-center space-x-2 w-full mt-4 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium">Update Profile</span>
        </button>

        <button
          onClick={onLogout}
          className="flex items-center justify-center space-x-2 w-full mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
