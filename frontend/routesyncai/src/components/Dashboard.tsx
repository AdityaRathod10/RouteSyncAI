"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AlertCircle, TrendingUp, Truck, RefreshCw } from "lucide-react";

// Types
interface Shipment {
  id: string;
  origin: string;
  destination: string;
  cargo_weight: number;
  cargo_volume: number;
  priority: string;
  createdAt: string;
  status: string;
  userId: string;
}

interface Disaster {
  type?: string;
  location?: string;
  severity?: number;
  date?: string;
  impact?: string;
}

interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
  change: number;
}

interface WeatherForecast {
  day: string;
  condition: string;
  temperature: number;
  precipitation: number;
}

interface RouteOption {
  id: string;
  routeType: string;
  carrier: string;
  transitTime: number;
  cost: number;
  borderCrossings: number;
  co2Emissions: number;
  reliability: number;
  score: number;
}

interface CurrencyResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface WeatherItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  pop: number;
}

// Custom Hooks
const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch("/api/shipments");
        if (!response.ok) throw new Error("Failed to fetch shipments");
        const data = await response.json();
        setShipments(data);
      } catch {
        setError("Failed to load shipments");
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  return { shipments, loading, error };
};

const useDisasters = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/gdacs");
        if (!response.ok) throw new Error("Failed to fetch disasters");
        const data = await response.json();

        // Map the API response to the Disaster interface
        const mappedDisasters = data.events.features.map((feature: {
          properties: {
            eventtype?: string;
            country?: string;
            severitydata?: { severity?: number };
            fromdate?: string;
            name?: string;
          };
        }) => ({
          type: feature.properties.eventtype || "Unknown",
          location: feature.properties.country || "Unknown",
          severity: feature.properties.severitydata?.severity || 1,
          date: feature.properties.fromdate || new Date().toISOString(),
          impact: feature.properties.name || "Unknown",
        }));

        setDisasters(mappedDisasters);
      } catch {
        setError("Failed to load disasters");
      } finally {
        setLoading(false);
      }
    };
    fetchDisasters();
  }, []);

  return { disasters, loading, error };
};

const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        if (!response.ok) throw new Error("Failed to fetch currencies");
        const data: CurrencyResponse = await response.json();

        const currencyRates: CurrencyRate[] = Object.entries(data.rates)
          .slice(0, 10)
          .map(([code, rate]) => ({
            code,
            name: code,
            rate,
            change: Math.random() * 4 - 2, // Mock change percentage
          }));

        setCurrencies(currencyRates);
      } catch {
        setError("Failed to load currencies");
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  return { currencies, loading, error };
};

const useWeather = () => {
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=London&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error("Failed to fetch weather");
        const data = await response.json();

        const forecasts: WeatherForecast[] = data.list.slice(0, 5).map((item: WeatherItem) => ({
          day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          condition: item.weather[0].main,
          temperature: Math.round(item.main.temp),
          precipitation: Math.round(item.pop * 100),
        }));

        setWeather(forecasts);
      } catch {
        setError("Failed to load weather");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return { weather, loading, error };
};

const Dashboard: React.FC = () => {
  const {
    shipments,
    loading: shipmentsLoading,
    error: shipmentsError,
  } = useShipments();
  const {
    disasters,
    loading: disastersLoading,
    error: disastersError,
  } = useDisasters();
  const {
    currencies,
    loading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies();
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather();

  const [refreshing, setRefreshing] = useState(false);

  // Mock data for charts
  const weeklyShipmentData = [
    { name: "Mon", shipments: 12 },
    { name: "Tue", shipments: 19 },
    { name: "Wed", shipments: 3 },
    { name: "Thu", shipments: 5 },
    { name: "Fri", shipments: 2 },
    { name: "Sat", shipments: 3 },
    { name: "Sun", shipments: 9 },
  ];

  const shipmentsByStatus = [
    { name: "Delivered", value: 400, color: "#10B981" },
    { name: "In Transit", value: 300, color: "#3B82F6" },
    { name: "Pending", value: 200, color: "#F59E0B" },
    { name: "Delayed", value: 100, color: "#EF4444" },
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // You can add logic to refetch data here if needed
    setRefreshing(false);
  };

  if (
    shipmentsLoading ||
    disastersLoading ||
    currenciesLoading ||
    weatherLoading
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Shipping Logistics Dashboard</h1>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {(shipmentsError ||
        disastersError ||
        currenciesError ||
        weatherError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {shipmentsError ||
              disastersError ||
              currenciesError ||
              weatherError}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="shipments">
        <TabsList className="mb-4">
          <TabsTrigger value="shipments" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="disasters" className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Disasters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Shipments
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shipments.length}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyShipmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="shipments" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipments by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={shipmentsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {shipmentsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>
                A list of your recent shipments and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Volume (m³)</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>{shipment.id}</TableCell>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>{shipment.cargo_weight} kg</TableCell>
                      <TableCell>{shipment.cargo_volume} m³</TableCell>
                      <TableCell>{shipment.priority}</TableCell>
                      <TableCell>
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            shipment.status === "DELIVERED"
                              ? "bg-green-500"
                              : shipment.status === "IN_TRANSIT"
                              ? "bg-blue-500"
                              : shipment.status === "PENDING"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }
                        >
                          {shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.userId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disasters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Disasters</CardTitle>
              <CardDescription>
                Global disasters that may affect shipping routes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disasters.map((disaster, index) => (
                    <TableRow key={index}>
                      <TableCell>{disaster.type}</TableCell>
                      <TableCell>{disaster.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (disaster.severity ?? 1) > 3
                              ? "destructive"
                              : (disaster.severity ?? 1) > 2
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {disaster.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {disaster.date
                          ? new Date(disaster.date).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{disaster.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
