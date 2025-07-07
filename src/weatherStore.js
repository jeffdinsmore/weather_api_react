import { create } from "zustand";

export const useWeatherStore = create((set) => ({
  weather: {
    apiCalls: 0,
    date: "",
    degrees: null,
    lastRain: null,
    lastWatered: null,
  },
  setWeather: (newWeather) =>
    set((state) => ({
      weather: {
        ...state.weather,
        ...newWeather, // merge partial updates
      },
    })),
  temperature: {
    today: null,
    tomorrow: null,
    yesterday: null,
  },
  setTemperature: (newTemperature) =>
    set((state) => ({
      temperature: {
        ...state.temperature,
        ...newTemperature,
      },
    })),
  rain: {
    daysSince: null,
    nextRain: null,
  },
  setRain: (newRain) =>
    set((state) => ({
      rain: {
        ...state.rain,
        ...newRain,
      },
    })),
}));

//export const useTemperatureStore = create
