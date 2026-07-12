"use client";

import { Header } from "@/components/Header";
import { useState } from "react";
import { MapIcon, ListIcon } from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [selectedFuel, setSelectedFuel] = useState<"petrol" | "diesel">(
    "petrol"
  );

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Fuel Type Selection */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFuel("petrol")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFuel === "petrol"
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Petrol
              </button>
              <button
                onClick={() => setSelectedFuel("diesel")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFuel === "diesel"
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Diesel
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  viewMode === "map"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          {viewMode === "table" ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Fuel Prices by Station</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-semibold">Station</th>
                      <th className="text-left py-3 px-4 font-semibold">Price (p/L)</th>
                      <th className="text-left py-3 px-4 font-semibold">Distance</th>
                      <th className="text-left py-3 px-4 font-semibold">Cost to Travel</th>
                      <th className="text-left py-3 px-4 font-semibold">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">Example Station</td>
                      <td className="py-3 px-4">165.9p</td>
                      <td className="py-3 px-4">2.3 mi</td>
                      <td className="py-3 px-4">£0.15</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">
                        +£0.50
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Enable location access to see real fuel prices near you.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Fuel Prices Map</h2>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center aspect-video">
                <div className="text-center">
                  <MapIcon className="w-12 h-12 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Map integration coming soon
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                Enable location access to see stations on the map.
              </p>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vehicle Economy (MPG)
              </label>
              <input
                type="number"
                placeholder="30"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Fuel Tank Capacity (Gallons)
              </label>
              <input
                type="number"
                placeholder="55"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
