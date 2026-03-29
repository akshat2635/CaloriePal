import { Sparkles } from "lucide-react";

export default function AIInsightsCard({ insights }) {
  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
        AI Insights
      </h3>
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {insights}
      </div>
    </div>
  );
}
