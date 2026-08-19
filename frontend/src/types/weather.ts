export interface WeatherResponse {
  city: string;
  temperatureCelsius: number;
  condition: string;
  description: string;
  iconCode: string;
  humidity: number;
  windSpeedKph: number;
}
