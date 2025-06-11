"use client";

import { useState } from "react";
import { AlertTriangle, Box, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteMap } from "@/components/route-map";
import { RouteList } from "@/components/route-list";
import type { RouteResponse } from "@/lib/types";
import { findPaths } from "@/services/api";

const CARGO_TYPES = [
  { value: "general", label: "General Merchandise" },
  { value: "perishable", label: "Perishable Goods" },
  { value: "hazardous", label: "Hazardous Materials" },
  { value: "fragile", label: "Fragile Items" },
  { value: "bulk", label: "Bulk Goods" },
  { value: "liquid", label: "Liquid Cargo" },
];

const TRANSPORT_MODES = [
  { value: "land", label: "Land" },
  { value: "sea", label: "Sea" },
  { value: "air", label: "Air" },
];

export default function Home() {
  const [formData, setFormData] = useState({
    start: "",
    goal: "",
    avoid_countries: [] as string[],
    top_n: 3,
    time_weight: 0.5,
    price_weight: 0.5,
    allowed_modes: ["land", "sea", "air"],
    prohibited_flag: "avoid",
    restricted_flag: "avoid",
    description: "",
    cargo_type: "general",
    weight: 0,
  });

  const [countryInput, setCountryInput] = useState("");
  const [routes, setRoutes] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);

  const handleModeChange = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      allowed_modes: prev.allowed_modes.includes(mode)
        ? prev.allowed_modes.filter(m => m !== mode)
        : [...prev.allowed_modes, mode]
    }));
  };

  const handleAddCountry = () => {
    if (countryInput && !formData.avoid_countries.includes(countryInput.toUpperCase())) {
      setFormData(prev => ({
        ...prev,
        avoid_countries: [...prev.avoid_countries, countryInput.toUpperCase()]
      }));
      setCountryInput("");
    }
  };

  const handleRemoveCountry = (country: string) => {
    setFormData(prev => ({
      ...prev,
      avoid_countries: prev.avoid_countries.filter(c => c !== country)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await findPaths(formData);
      setRoutes(response);
      setSelectedRoute(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-[1400px] mx-auto p-3 sm:p-6">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 bg-white/5 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-white/10 shadow-xl">
          <Box className="w-8 h-8 sm:w-12 sm:h-12 text-sky-400 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500">
            LogisticsPro Route Optimizer
          </h1>
        </div>

        {/* Main Grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-sky-500/10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-sky-400">Shipment Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Origin/Destination Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-sky-300">Origin</label>
                    <input
                      type="text"
                      value={formData.start}
                      onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                      required
                      placeholder="Enter origin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-sky-300">Destination</label>
                    <input
                      type="text"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                      required
                      placeholder="Enter destination"
                    />
                  </div>
                </div>

                {/* Cargo Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-sky-300">Cargo Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                    required
                    placeholder="Describe your cargo"
                  />
                </div>

                {/* Cargo Type and Weight Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-sky-300">Cargo Type</label>
                    <select
                      value={formData.cargo_type}
                      onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                    >
                      {CARGO_TYPES.map((type) => (
                        <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-sky-300">Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                      required
                      placeholder="Enter weight"
                    />
                  </div>
                </div>

                {/* Number of Routes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-sky-300">Number of Routes</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.top_n}
                    onChange={(e) => setFormData({ ...formData, top_n: Number(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                {/* Transportation Modes - Mobile Optimized */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-sky-300">Transportation Modes</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                    {TRANSPORT_MODES.map((mode) => (
                      <label key={mode.value} className="relative flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.allowed_modes.includes(mode.value)}
                          onChange={() => handleModeChange(mode.value)}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-sky-500/30 rounded bg-white/5 text-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-colors"
                        />
                        <span className="text-sm sm:text-base font-medium group-hover:text-sky-400 transition-colors">{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Countries to Avoid - Mobile Optimized */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-sky-300">Countries to Avoid</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value.slice(0, 2))}
                      placeholder="ISO-2 code (e.g., US)"
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                      maxLength={2}
                    />
                    <button
                      type="button"
                      onClick={handleAddCountry}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-sky-500/25 text-sm sm:text-base"
                    >
                      Add Country
                    </button>
                  </div>
                  {formData.avoid_countries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.avoid_countries.map((country) => (
                        <div key={country} className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center space-x-2 group text-sm">
                          <span>{country}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCountry(country)}
                            className="text-red-400 hover:text-red-300 transition-colors text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Weighting */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-sky-300">Priority Weighting</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.time_weight}
                    onChange={(e) => {
                      const timeWeight = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        time_weight: timeWeight,
                        price_weight: 1 - timeWeight,
                      });
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:appearance-none hover:[&::-webkit-slider-thumb]:bg-sky-400 transition-colors"
                  />
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-sky-300">Cost Priority</span>
                    <span className="text-sky-300">Time Priority</span>
                  </div>
                </div>

                {/* Prohibited Country Handling */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-sky-300">Prohibited Country Handling</label>
                  <select
                    value={formData.prohibited_flag}
                    onChange={(e) => setFormData({ ...formData, prohibited_flag: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="avoid" className="bg-slate-800">Avoid if possible</option>
                    <option value="strict" className="bg-slate-800">Strictly avoid</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-500 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
                >
                  {loading ? "Calculating Routes..." : "Calculate Routes"}
                </button>
              </form>
            </div>

            {/* Route List - Mobile Optimized */}
            {routes && Array.isArray(routes.paths) && (
              <div className="block xl:hidden">
                <RouteList
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onRouteSelect={setSelectedRoute}
                />
              </div>
            )}
          </div>

          {/* Results Section - Desktop & Mobile */}
          <div className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <p className="text-sm sm:text-base">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-[300px] sm:h-[400px] w-full rounded-xl" />
                <Skeleton className="h-[150px] sm:h-[200px] w-full rounded-xl" />
              </div>
            ) : routes && Array.isArray(routes.paths) ? (
              <>
                {/* Route Map */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-sky-500/10">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-sky-400">Route Visualization</h2>
                  </div>
                  <div className="h-[300px] sm:h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
                    <RouteMap route={routes.paths[selectedRoute]} />
                  </div>
                </div>

                {/* Route Information - Mobile Optimized */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-sky-500/10">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-sky-400">Route Information</h3>
                  
                  {/* Avoided Countries */}
                  {routes.avoided_countries.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center space-x-2 text-amber-400 mb-2 sm:mb-3">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">Avoided Countries</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/70">
                        {routes.avoided_countries.join(", ")}
                      </p>
                    </div>
                  )}
                  
                  {/* Route Steps */}
                  <div className="space-y-3">
                    {routes.paths[selectedRoute].edges.map((edge, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-sm bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-medium text-sky-300 truncate">{edge.from}</span>
                          <span className="text-white/50">→</span>
                          <span className="font-medium text-sky-300 truncate">{edge.to}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:ml-auto">
                          <span className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs whitespace-nowrap">
                            {edge.mode}
                          </span>
                          <span className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs whitespace-nowrap">
                            {edge.time.toFixed(1)}h
                          </span>
                          <span className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs whitespace-nowrap">
                            ${edge.price.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Route List */}
                <div className="hidden xl:block">
                  <RouteList
                    routes={routes}
                    selectedRoute={selectedRoute}
                    onRouteSelect={setSelectedRoute}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}