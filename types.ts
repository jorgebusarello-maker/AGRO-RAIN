
export interface Gauge {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface RainfallRecord {
  id: string;
  gaugeId: string;
  amount: number; // in mm
  date: string; // ISO format
}

export interface DashboardStats {
  dailyAverage: number;
  maxRainfall: number;
  weeklyTotal: number;
  monthlyTotal: number;
  seasonTotal: number;
}
