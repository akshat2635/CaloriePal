import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Food Entries List Skeleton */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 min-h-[16rem] h-auto flex flex-col justify-between p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-1/2 sm:w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-4 flex-1">
          <div className="h-20 sm:h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-20 sm:h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      {/* Daily Progress and AI Insights Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Progress Skeleton */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-6 min-h-[20rem] h-auto">
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="flex justify-center items-center h-full pb-8">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* AI Insights Skeleton */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-6 min-h-[20rem] h-auto">
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 sm:h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-24 sm:h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart Skeleton */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-6 min-h-[24rem] h-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-1/3 sm:w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-48 sm:h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}
