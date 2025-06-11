export interface Coordinate {
  name: string
  latitude: number
  longitude: number
}

export interface RouteEdge {
  from: string
  to: string
  mode: string
  time: number
  price: number
  distance: number
}

export interface RoutePath {
  path: string[]
  coordinates: Coordinate[]
  edges: RouteEdge[]
  time_sum: number
  price_sum: number
  distance_sum: number
  CO2_sum: number
}

export interface RouteResponse {
  avoided_countries: string[]
  penalty_countries: string[]
  paths: RoutePath[]
}

export interface PathRequest {
  start: string
  goal: string
  avoid_countries: string[]
  top_n: number
  time_weight: number
  price_weight: number
  allowed_modes: string[]
  prohibited_flag: string
  restricted_flag: string
  description: string
}

