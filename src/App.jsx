import { useState } from "react";
import { useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  setObject,
  fetchWeatherData,
  displayStoredWateredTime,
  updateWateredTimestamp,
} from "./scripts.js";

function App() {
  const [tempToday, setTempToday] = useState("");
  const [tempYesterday, setTempYesterday] = useState("");
  const [tempTomorrow, setTempTomorrow] = useState("");
  const [daysSinceRain, setDaysSinceRain] = useState("");
  const [nextRain, setNextRain] = useState("");
  const [lastWatered, setLastWatered] = useState("");
  const [dateToday, setDateToday] = useState("");
  const [weather, setWeather] = useState({
    apiCalls: 0,
    lastWatered: null,
    date: null,
  });

  useEffect(() => {
    setObject(setWeather, weather);
    async function loadData() {
      const data = await fetchWeatherData(
        setWeather,
        setDateToday,
        setTempToday,
        setTempYesterday,
        setTempTomorrow,
        setDaysSinceRain,
        setNextRain,
        weather
      );
      console.log("weather, ", data);
    }
    loadData();
    displayStoredWateredTime();
    updateWateredTimestamp(setWeather, setLastWatered);
  }, []);

  /*function App() {
  useEffect(() => {
  async function loadData() {
    const data = await fetchWeatherData();
    console.log("Weather:", data);
  }
  loadData();
  displayStoredWateredTime();
  updateWateredTimestamp();
  wateredToday();
  wateredYesterday();
}, []);*/
  const [count, setCount] = useState(0);
  console.log("my oh my", weather);
  return (
    <>
      <h1>Weather Tracker</h1>
      <p>
        Checking weather for: <strong>Portland, Oregon</strong>
      </p>
      <div id="weather">
        <div className="weather-box box">
          <h2>Temperature</h2>
          <p>
            Today's High Temperature:{" "}
            <span id="temp-today">{tempToday ? tempToday : "Loading..."}</span>
            °F
          </p>
          <p>
            Yesterday's Temperature:{" "}
            <span id="temp-yesterday">
              {tempYesterday ? tempYesterday : "Loading..."}
            </span>
            °F
          </p>
          <p>
            Tomorrow's Temperature:{" "}
            <span id="temp-tomorrow">
              {tempTomorrow ? tempTomorrow : "Loading..."}
            </span>
            °F
          </p>
        </div>
        <div className="weather-box box">
          <h2>Rain Information</h2>
          <p>
            Days Since Last Rain:{" "}
            <span id="days-since-rain">
              {daysSinceRain ? daysSinceRain : "Loading..."}
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
        onClick={() => updateWateredTimestamp(setWeather, setLastWatered)}
      >
        I watered the plants
      </button>
      <p id="last-watered">{displayStoredWateredTime(setWeather)}</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
