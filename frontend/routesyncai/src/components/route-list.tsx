"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, DollarSign, AlertTriangle, Navigation, Truck, Ship, Plane, SplitSquareVertical, Route } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { RouteResponse } from "@/lib/types"

interface RouteListProps {
  routes: RouteResponse
  selectedRoute: number
  onRouteSelect: (index: number) => void
}

export function RouteList({ routes, selectedRoute, onRouteSelect }: RouteListProps) {
  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "land": return <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
      case "sea": return <Ship className="w-3 h-3 sm:w-4 sm:h-4" />
      case "air": return <Plane className="w-3 h-3 sm:w-4 sm:h-4" />
      default: return <Route className="w-3 h-3 sm:w-4 sm:h-4" />
    }
  }

  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours.toFixed(1)}h`
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <SplitSquareVertical className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-sky-400">Available Routes</h2>
      </div>
      
      <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
        {routes.paths.map((path, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] border-2 ${
              selectedRoute === index
                ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                : "border-white/20 bg-white/5 hover:border-sky-500/50"
            }`}
            onClick={() => onRouteSelect(index)}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {/* Route Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={selectedRoute === index ? "default" : "outline"}
                    className="text-xs px-2 py-1"
                  >
                    Route {index + 1}
                  </Badge>
                  {selectedRoute === index && (
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      Selected
                    </Badge>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-white/60">
                  {path.path.length} stops
                </div>
              </div>

              {/* Route Stats Grid - Mobile Optimized */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span className="text-xs sm:text-sm text-white/60">Time</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {formatTime(path.time_sum)}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    <span className="text-xs sm:text-sm text-white/60">Cost</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {formatCurrency(path.price_sum)}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-1">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="text-xs sm:text-sm text-white/60">CO₂</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {path.CO2_sum.toFixed(1)}kg
                  </p>
                </div>
              </div>

              {/* Transport Modes */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm text-white/60">Transport Modes:</span>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {Array.from(new Set(path.edges.map(edge => edge.mode))).map((mode, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-1 bg-white/10 px-2 py-1 rounded-full"
                    >
                      {getTransportIcon(mode)}
                      <span className="text-xs sm:text-sm text-white/80 capitalize">
                        {mode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Path - Mobile Optimized */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                <div className="text-xs sm:text-sm text-white/60 mb-2">Route Path:</div>
                <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
                  {path.path.map((location, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-sky-300 font-medium px-1 py-0.5 bg-white/5 rounded">
                        {location}
                      </span>
                      {i < path.path.length - 1 && (
                        <span className="text-white/40 mx-1">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance and Time Summary */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Distance:</span>
                    <span className="text-white font-medium">
                      {path.distance_sum.toFixed(0)} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Segments:</span>
                    <span className="text-white font-medium">
                      {path.edges.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}