"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface Coordinate {
  node: string
  latitude: number
  longitude: number
}

interface RouteEdge {
  from: string
  to: string
  mode: string
  time?: number
  price?: number
  distance?: number
}

interface RouteData {
  path: string[]
  coordinates: Coordinate[]
  edges: RouteEdge[]
  time_sum?: number
  price_sum?: number
  distance_sum?: number
  CO2_sum?: number
}

interface RouteMapProps {
  route: RouteData
}

export const RouteMap: React.FC<RouteMapProps> = ({ route }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([])
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([])

  // Clean up previous route visualization
  const cleanupPreviousRoute = () => {
    // Clear markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Clear polylines
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    polylinesRef.current = []

    // Clear directions renderers
    directionsRenderersRef.current.forEach((renderer) => renderer.setMap(null))
    directionsRenderersRef.current = []

    // Close and clear info windows
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close())
    infoWindowsRef.current = []
  }

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["geometry", "routes", "places"],
      })

      try {
        const google = await loader.load()
        setMapLoaded(true)

        if (mapRef.current && !googleMapRef.current) {
          // Create map with enhanced options
          const mapOptions: google.maps.MapOptions = {
            center: {
              lat: route.coordinates[0].latitude,
              lng: route.coordinates[0].longitude,
            },
            zoom: 3,
            mapTypeId: google.maps.MapTypeId.HYBRID, // Satellite with labels
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: true,
            fullscreenControl: true,
            tilt: 45, // Enable 45-degree perspective
            rotateControl: true,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#193341" }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#2c5a71" }],
              },
            ],
          }

          googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions)
        }

        // Visualize route based on transport modes
        if (googleMapRef.current) {
          cleanupPreviousRoute()
          visualizeRoute(route, google)
        }
      } catch (error) {
        console.error("Error loading Google Maps", error)
      }
    }

    const visualizeRoute = (routeData: RouteData, google: any) => {
      if (!googleMapRef.current || !window.google) return

      // Create a DirectionsService object
      const directionsService = new google.maps.DirectionsService()

      // Process each segment of the route based on transport mode
      const processRouteSegments = async () => {
        // Add markers for each point with custom styling
        routeData.coordinates.forEach((coord, index) => {
          let icon

          if (index === 0) {
            icon = {
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(40, 40),
              labelOrigin: new google.maps.Point(20, -10),
            }
          } else if (index === routeData.coordinates.length - 1) {
            icon = {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(40, 40),
              labelOrigin: new google.maps.Point(20, -10),
            }
          } else {
            icon = {
              url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
              scaledSize: new google.maps.Size(30, 30),
              labelOrigin: new google.maps.Point(15, -10),
            }
          }

          const marker = new google.maps.Marker({
            position: {
              lat: coord.latitude,
              lng: coord.longitude,
            },
            map: googleMapRef.current!,
            title: coord.node,
            icon: icon,
            animation: google.maps.Animation.DROP,
            label: {
              text: coord.node,
              color: "black",
              fontWeight: "bold",
              fontSize: "14px",
            },
          })

          markersRef.current.push(marker)

          // Find the corresponding edge for this node
          const edge = index < routeData.edges.length ? routeData.edges[index] : null

          // Create custom info window content with Tailwind-styled HTML
          const contentString = `
            <div class="p-4 max-w-xs bg-white rounded-lg shadow-lg">
              <h2 class="text-lg font-bold text-black mb-2">${coord.node}</h2>
              <p class="text-black mb-1">Lat: ${coord.latitude.toFixed(4)}</p>
              <p class="text-black mb-1">Lng: ${coord.longitude.toFixed(4)}</p>
              ${
                edge
                  ? `<div class="mt-2 pt-2 border-t border-gray-200">
                  <p class="text-black font-medium">Transport Mode: 
                    <span class="font-bold ${getTransportModeColor(edge.mode)}">
                      ${edge.mode.toUpperCase()}
                    </span>
                  </p>
                  ${edge.time ? `<p class="text-black">Time: ${formatTime(edge.time)}</p>` : ""}
                  ${edge.price ? `<p class="text-black">Price: $${edge.price.toFixed(2)}</p>` : ""}
                  ${edge.distance ? `<p class="text-black">Distance: ${edge.distance.toFixed(2)} km</p>` : ""}
                </div>`
                  : ""
              }
            </div>
          `

          const infoWindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 300,
          })

          infoWindowsRef.current.push(infoWindow)

          marker.addListener("click", () => {
            // Close all other info windows first
            infoWindowsRef.current.forEach((window) => window.close())
            infoWindow.open(googleMapRef.current!, marker)
          })
        })

        // Process each route segment
        for (let i = 0; i < routeData.edges.length; i++) {
          const origin = {
            lat: routeData.coordinates[i].latitude,
            lng: routeData.coordinates[i].longitude,
          }
          const destination = {
            lat: routeData.coordinates[i + 1].latitude,
            lng: routeData.coordinates[i + 1].longitude,
          }
          const mode = routeData.edges[i].mode.toLowerCase()

          // Handle different transport modes
          if (mode === "land") {
            await calculateLandRoute(origin, destination, google)
          } else if (mode === "air") {
            createAirRoute(origin, destination, google)
          } else if (mode === "sea") {
            createSeaRoute(origin, destination, google)
          }
        }
      }

      // Calculate land route using Directions API
      const calculateLandRoute = (
        origin: google.maps.LatLngLiteral,
        destination: google.maps.LatLngLiteral,
        google: any,
      ) => {
        return new Promise<void>((resolve) => {
          const request: google.maps.DirectionsRequest = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
          }

            interface DirectionsResult {
            // Using Google Maps types for results
            directions: google.maps.DirectionsResult
            status: google.maps.DirectionsStatus
            }

            interface PolylineOptions {
            path: google.maps.LatLngLiteral[]
            geodesic: boolean
            strokeColor: string
            strokeWeight: number
            strokeOpacity: number
            map: google.maps.Map
            }

            directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              const renderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer({
              map: googleMapRef.current!,
              directions: result,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#4CAF50", // Green for land
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              })
              directionsRenderersRef.current.push(renderer)
            } else {
              const polyline: google.maps.Polyline = new google.maps.Polyline({
              path: [origin, destination],
              geodesic: true,
              strokeColor: "#4CAF50",
              strokeWeight: 5,
              strokeOpacity: 0.8,
              map: googleMapRef.current!,
              })
              polylinesRef.current.push(polyline)
            }
            resolve()
            })
        })
      }

      // Create air route with curved path and airplane icon
      const createAirRoute = (
        origin: google.maps.LatLngLiteral,
        destination: google.maps.LatLngLiteral,
        google: any,
      ) => {
        // Create a curved path for flight
        const path = getArcPath(origin, destination)

        // Create the flight path
        const flightPath = new google.maps.Polyline({
          path: path,
          geodesic: false,
          strokeColor: "#2196F3", // Blue for air
          strokeOpacity: 0.8,
          strokeWeight: 3,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                fillColor: "#2196F3",
                fillOpacity: 1,
                strokeWeight: 1,
              },
              offset: "50%",
              repeat: "100px",
            },
          ],
          map: googleMapRef.current!,
        })

        polylinesRef.current.push(flightPath)

        // Animate the flight path
        animateCircle(flightPath)
      }

      // Create sea route with specialized styling
      const createSeaRoute = (
        origin: google.maps.LatLngLiteral,
        destination: google.maps.LatLngLiteral,
        google: any,
      ) => {
        // Create a slightly curved path for sea routes
        const path = getArcPath(origin, destination, 0.2)

        // Create the sea path
        const seaPath = new google.maps.Polyline({
          path: path,
          geodesic: false,
          strokeColor: "#0D47A1", // Dark blue for sea
          strokeOpacity: 0.8,
          strokeWeight: 4,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3,
                fillColor: "#0D47A1",
                fillOpacity: 1,
                strokeWeight: 1,
              },
              offset: "0",
              repeat: "20px",
            },
          ],
          map: googleMapRef.current!,
        })

        polylinesRef.current.push(seaPath)
      }

      // Helper function to get transport mode color
      function getTransportModeColor(mode: string): string {
        switch (mode.toLowerCase()) {
          case "land":
            return "text-green-600"
          case "air":
            return "text-blue-600"
          case "sea":
            return "text-indigo-800"
          default:
            return "text-gray-800"
        }
      }

      // Helper function to format time (hours)
      function formatTime(hours: number): string {
        const days = Math.floor(hours / 24)
        const remainingHours = Math.floor(hours % 24)
        const minutes = Math.floor((hours * 60) % 60)

        if (days > 0) {
          return `${days}d ${remainingHours}h ${minutes}m`
        } else {
          return `${remainingHours}h ${minutes}m`
        }
      }

      // Helper function to create arc path between two points
      function getArcPath(
        start: google.maps.LatLngLiteral,
        end: google.maps.LatLngLiteral,
        curvature = 0.5,
      ): google.maps.LatLngLiteral[] {
        const points: google.maps.LatLngLiteral[] = []
        const steps = 50 // Number of points in the curve

        // Calculate midpoint
        const midLat = (start.lat + end.lat) / 2
        const midLng = (start.lng + end.lng) / 2

        // Calculate distance for curvature
        const latDiff = end.lat - start.lat
        const lngDiff = end.lng - start.lng
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)

        // Calculate perpendicular offset for midpoint (creates the curve)
        const offsetLat = -lngDiff * curvature
        const offsetLng = latDiff * curvature

        const controlPoint = {
          lat: midLat + offsetLat,
          lng: midLng + offsetLng,
        }

        // Create the curved path using quadratic Bezier
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const lat = Math.pow(1 - t, 2) * start.lat + 2 * (1 - t) * t * controlPoint.lat + Math.pow(t, 2) * end.lat
          const lng = Math.pow(1 - t, 2) * start.lng + 2 * (1 - t) * t * controlPoint.lng + Math.pow(t, 2) * end.lng

          points.push({ lat, lng })
        }

        return points
      }

      // Animate the flight path
      function animateCircle(line: google.maps.Polyline) {
        let count = 0

        const interval = window.setInterval(() => {
          count = (count + 1) % 200

          const icons = line.get("icons")
          icons[0].offset = count / 2 + "%"
          line.set("icons", icons)
        }, 50)

        // Store interval ID for cleanup
        line.set("intervalID", interval)
      }

      // Process all route segments
      processRouteSegments()

      // Fit map to route bounds
      const bounds = new google.maps.LatLngBounds()
      routeData.coordinates.forEach((coord) => {
        bounds.extend({ lat: coord.latitude, lng: coord.longitude })
      })
      googleMapRef.current.fitBounds(bounds)
    }

    if (route && route.coordinates && route.coordinates.length > 0) {
      initMap()
    }

    // Cleanup function
    return () => {
      // Clear all intervals created for animations
      polylinesRef.current.forEach((line) => {
        const intervalID = line.get("intervalID")
        if (intervalID) {
          window.clearInterval(intervalID)
        }
      })

      cleanupPreviousRoute()
    }
  }, [route]) // Re-run when route changes

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl" style={{ minHeight: "600px" }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-2 text-gray-700 font-medium">Loading map...</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md z-10">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-black text-sm font-medium">Land Route</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-black text-sm font-medium">Air Route</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-800 rounded-full mr-2"></div>
            <span className="text-black text-sm font-medium">Sea Route</span>
          </div>
        </div>
      </div>
      {route.time_sum && route.price_sum && route.distance_sum && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md z-10">
          <div className="flex flex-col space-y-1">
            <h3 className="text-black font-bold text-sm">Route Summary</h3>
            <p className="text-black text-xs">Total Time: {formatTime(route.time_sum)}</p>
            <p className="text-black text-xs">Total Price: ${route.price_sum.toFixed(2)}</p>
            <p className="text-black text-xs">Total Distance: {route.distance_sum.toFixed(2)} km</p>
            {route.CO2_sum && <p className="text-black text-xs">CO₂ Emissions: {route.CO2_sum.toFixed(2)} kg</p>}
          </div>
        </div>
      )}
    </div>
  )

  // Helper function to format time (hours)
  function formatTime(hours: number): string {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.floor(hours % 24)
    const minutes = Math.floor((hours * 60) % 60)

    if (days > 0) {
      return `${days}d ${remainingHours}h ${minutes}m`
    } else {
      return `${remainingHours}h ${minutes}m`
    }
  }
}

