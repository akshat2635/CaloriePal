import { useState } from "react";

export default function ConcentricRingsProgress({ macros }) {
  const size = 320;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 18;
  const gap = 4;
  const [hoveredRing, setHoveredRing] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate radius for each ring from outermost to innermost
  const rings = macros.map((macro, index) => {
    const radius = centerX - strokeWidth / 2 - index * (strokeWidth + gap);
    const circumference = 2 * Math.PI * radius;
    const percentage =
      macro.target > 0 ? (macro.current / macro.target) * 100 : 0;
    const strokeDashoffset =
      circumference - (Math.min(percentage, 100) / 100) * circumference;
    const isOverTarget = macro.current > macro.target;

    return {
      ...macro,
      radius,
      circumference,
      strokeDashoffset,
      percentage,
      isOverTarget,
    };
  });

  const handleMouseEnter = (ring, event) => {
    setHoveredRing(ring);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.top });
  };

  const handleMouseLeave = () => {
    setHoveredRing(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-8 sm:gap-12 py-4">
      {/* Concentric Rings */}
      <div className="relative flex items-center justify-center w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] aspect-square flex-shrink-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90 overflow-visible"
        >
          {rings.map((ring, index) => (
            <g key={index}>
              {/* Background Circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={ring.radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress Circle with hover */}
              <circle
                cx={centerX}
                cy={centerY}
                r={ring.radius}
                stroke={ring.isOverTarget ? "#ef4444" : ring.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={ring.circumference}
                strokeDashoffset={ring.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.1))" }}
                onMouseEnter={(e) => handleMouseEnter(ring, e)}
                onMouseMove={(e) => {
                  setTooltipPosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={handleMouseLeave}
              />
            </g>
          ))}
        </svg>

        {/* Center Stats */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            {Math.round(macros[0].current)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
            of {Math.round(macros[0].target)} cal
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-row flex-wrap justify-center gap-3 sm:flex-col sm:space-y-4 sm:gap-0 mt-4 sm:mt-0">
        {rings.map((ring, index) => (
          <div
            key={index}
            className="flex items-center space-x-1.5 sm:space-x-3 bg-gray-50 dark:bg-gray-800 sm:bg-transparent sm:dark:bg-transparent px-2 py-1 sm:p-0 rounded-md sm:rounded-none"
          >
            <div
              className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: ring.color }}
            ></div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ring.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 flex-shrink-0 hidden sm:block" />
              <span className="text-[11px] sm:text-base font-medium text-gray-700 dark:text-gray-300 uppercase sm:capitalize tracking-wider sm:tracking-normal">
                {ring.label.substring(0, 3)}
                <span className="hidden sm:inline">
                  {ring.label.substring(3)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hover Tooltip */}
      {hoveredRing && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 20}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: hoveredRing.isOverTarget
                    ? "#ef4444"
                    : hoveredRing.color,
                }}
              ></div>
              <div className="flex items-center space-x-1">
                <hoveredRing.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {hoveredRing.label}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Current:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(hoveredRing.current)}
                  {hoveredRing.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Target:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(hoveredRing.target)}
                  {hoveredRing.unit}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">
                  {hoveredRing.isOverTarget ? "Over:" : "Remaining:"}
                </span>
                <span
                  className={`font-bold ${hoveredRing.isOverTarget ? "text-red-500" : "text-primary-600 dark:text-primary-400"}`}
                >
                  {hoveredRing.isOverTarget && "+"}
                  {Math.round(
                    Math.abs(hoveredRing.current - hoveredRing.target),
                  )}
                  {hoveredRing.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(hoveredRing.percentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
