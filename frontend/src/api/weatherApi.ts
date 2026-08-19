import axiosClient from './axiosClient';
import { WeatherResponse } from '../types/weather';

export const weatherApi = {
  getCurrentWeatherByCity: async (city: string): Promise<WeatherResponse> => {
    const response = await axiosClient.get<WeatherResponse>(`/weather/current?city=${encodeURIComponent(city)}`);
    return response.data;
  },

  getCurrentWeatherByCoordinates: async (lat: number, lon: number): Promise<WeatherResponse> => {
    const response = await axiosClient.get<WeatherResponse>(`/weather/current?lat=${lat}&lon=${lon}`);
    return response.data;
  }
};
