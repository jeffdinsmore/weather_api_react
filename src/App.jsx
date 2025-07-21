import { useState } from "react";
import { useEffect } from "react";
import { useWeatherStore } from './weatherStore';
import "./App.css";
import {
  setObject,
  fetchWeatherData,
  displayStoredWateredTime,
  updateWateredTimestamp,
} from "./scripts.js";

function App() {
  const weather = useWeatherStore((state) => state.weather);
  const temp = useWeatherStore((state) => state.temperature);
  const rain = useWeatherStore((state) => state.rain);
  const [tempToday, setTempToday] = useState("");
  const [tempYesterday, setTempYesterday] = useState("");
  const [tempTomorrow, setTempTomorrow] = useState("");
  const [daysSinceRain, setDaysSinceRain] = useState("");
  const [nextRain, setNextRain] = useState("");
  const [isWateredToday, setIsWateredToday] = useState("");
  const [apiTooManyTimes, setApiTooManyTimes] = useState("");
  const [isVisible, setIsVisible] = useState("");

  useEffect(() => {
    setObject();
    async function loadData() {
      const data = await fetchWeatherData(
        setTempToday,
        setTempYesterday,
        setTempTomorrow,
        setDaysSinceRain,
        setNextRain,
        setApiTooManyTimes,
        setIsVisible,
      );
    }
    loadData();
    displayStoredWateredTime();
  }, []);

  useEffect(() => {
      console.log("my oh my", weather, JSON.parse(localStorage.getItem("weatherObject")), isVisible),temp, rain;
  }, [weather]);

  /*<div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>*/
  return (
    <>
      <h1>Weather Tracker</h1>
      <p style={{ color: "black" }}>
        Check weather for: <strong>Portland, Oregon</strong>
      </p>
      <div id="weather">
        <div className="weather-box box">
          <h2>Temperature</h2>
          <p id="temp-today">
            Today's Temperature:{" "}
            <span>{tempToday ? tempToday : "Loading..."}</span>
            {weather.degrees}
          </p>
          <p>
            Tomorrow's Temperature:{" "}
            <span id="temp-tomorrow">
              {tempTomorrow ? tempTomorrow : "Loading..."}
            </span>
            {weather.degrees}
          </p>
          <p>
            Yesterday's Temperature:{" "}
            <span id="temp-yesterday">
              {tempYesterday ? tempYesterday : "Loading..."}
            </span>
            {weather.degrees}
          </p>
        </div>
        <div className="weather-box box">
          <h2>Rain Information</h2>
          <p>
            Days Since Last Rain:{" "}
            <span id="days-since-rain">
              {daysSinceRain || daysSinceRain === 0
                ? daysSinceRain
                : "Loading..."}
            </span>
          </p>
          <p>
            Next Expected Rain:{" "}
            <span id="next-rain">{nextRain ? nextRain : "Loading..."}</span>
          </p>
        </div>
      </div>
      <button
        id="water-button"
        onClick={() => updateWateredTimestamp(setIsWateredToday)}
        disabled={isWateredToday}
      >
        I watered the plants
      </button>
      <p id="last-watered">{displayStoredWateredTime()}</p>
      {isVisible && (
        <div className="weather-box box">
          <span className="too-many-times">{apiTooManyTimes}</span>
        </div>
      )}
    </>
  );
}

export default App;
