import { useState } from "react";
import { useEffect } from "react";
import { useWeatherStore } from "./weatherStore";
import "./App.css";
import {
  setObject,
  fetchWeatherData,
  displayStoredWateredTime,
  updateWateredTimestamp,
  displayReadableWateredTime,
} from "./scripts.js";

function App() {
  const weather = useWeatherStore((state) => state.weather);
  const dailies = useWeatherStore((state) => state.weather.lastWatered);
  const lastRained = useWeatherStore((state) => state.weather.lastRain);
  const lastWatered = useWeatherStore((state) => state.weather.lastWatered);
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
        setIsVisible
      );
    }
    loadData();
    displayReadableWateredTime();
    displayStoredWateredTime();
    setTimeout(() => {
      window.scrollTo(0, window.scrollY); // Freeze current scroll position
    }, 500); // Wait for layout to settle
  }, []);

  useEffect(() => {
    console.log(
      "weather",
      weather,
      "local storage",
      JSON.parse(localStorage.getItem("weatherObject"))
    );
  }, [weather]);

  return (
    <>
      <div id="main">
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
              Next Rain:{" "}
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

        <div className="weather-box box">
          <div className="watered-list-container">
            <h2>Watered Dates</h2>
            <div className="columns-container">
              <div className="column">
                <h3>Watered</h3>
                <ul className="watered-list">
                  {Array.isArray(lastWatered) && lastWatered.length > 0
                    ? lastWatered.map((a, i) => (
                        <li style={{ color: "#2d5d34" }} key={i}>
                          {displayReadableWateredTime(a)}
                        </li>
                      ))
                    : Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} style={{ color: "#ccc" }}>
                          Loading...
                        </li>
                      ))}
                      <li>{lastWatered[16]}</li>
                </ul>
              </div>
              <div className="column">
                <h3>Rain</h3>
                <ul className="rain-list">
                  {Array.isArray(lastRained) && lastRained.length > 0
                    ? lastRained.map((r, i) => (
                        <li style={{ color: "#2d5d34" }} key={i}>
                          {displayReadableWateredTime(r)}
                        </li>
                      ))
                    : Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} style={{ color: "#ccc" }}>
                          Loading...
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
/*{Array.isArray(weather.lastWatered) && weather.lastWatered.length > 0 && 
          ( <ul className="watered-list">
            {dailies.map((a, i) => (
            <li style={{ color: "#222" }}key={i}>{displayReadableWateredTime(a)}</li>
            ))}
            </ul>
          )}
            
          <footer style={{ height: "60px", backgroundColor: "#f2f2f2" }}>
        <p style={{ textAlign: "center", color: "#555" }}></p>
      </footer>
      <div style={{ height: "4px" }} />*/
