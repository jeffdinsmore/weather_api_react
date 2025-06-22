import { useEffect, useState } from "react";

export function setObject(setWeather, weather) {
  let weatherObject;
  try {
    weatherObject = JSON.parse(localStorage.getItem("weatherObject"));
  } catch (error) {
    console.error("Error parsing appData:", error);
    weatherObject = null;
  }
  if (!weatherObject) {
    // First-time setup
    weatherObject = {
      apiCalls: 0,
      lastWatered: new Date("06-15-2025"),
      date: null,
    };
    localStorage.setItem("weatherObject", JSON.stringify(weatherObject));
    console.log("Object has been created and saved successfully");
  } else {
    console.log("Object already exists");
  }
  setWeather((prev) => ({
    ...prev,
    apiCalls: weatherObject.apiCalls + 1,
    lastWatered: weatherObject.lastWatered,
    date: weatherObject.date,
  }));
}

export const fetchWeatherData = async (
  setWeather,
  setDateToday,
  setTempToday,
  setTempYesterday,
  setTempTomorrow,
  setDaysSinceRain,
  setNextRain,
  setApiTooManyTimes,
  setIsVisible,
  weather
) => {
  let weatherObject = JSON.parse(localStorage.getItem("weatherObject"));
  const lat = 45.523064; // Updated Portland latitude
  const lon = -122.676483; // Updated Portland longitude

  setTheDate(weatherObject, setDateToday, setWeather, weather);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Example client-side tracking
  const formatDate = (d) => d.toISOString().split("T")[0];
  const start = formatDate(
    new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
  );
  const end = formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&temperature_unit=fahrenheit&timezone=auto&start_date=${start}&end_date=${end}`;

  if (weatherObject.apiCalls < 600) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("data: ", data);
      const dates = data.daily.time;
      const temps = data.daily.temperature_2m_max;
      //const maxTemp = data.daily.temperature_2m_max[0].toFixed(1);
      const precips = data.daily.precipitation_sum;

      const idxToday = dates.indexOf(formatDate(today));
      const idxYesterday = dates.indexOf(formatDate(yesterday));
      const idxTomorrow = dates.indexOf(formatDate(tomorrow));
      setTempToday(temps[idxToday].toFixed(1));
      setTempYesterday(temps[idxYesterday].toFixed(1));
      setTempTomorrow(temps[idxTomorrow].toFixed(1));

      let rainData = getRainData(idxToday, idxYesterday, precips, dates);

      setDaysSinceRain(rainData[0]);
      setNextRain(rainData[1]);

      weatherObject.apiCalls += 1;
      weatherObject.date = weatherObject.date;
      weatherObject.lastWatered = weatherObject.lastWatered;

      setWeather((prev) => ({
        ...prev,
        apiCalls: prev.apiCalls + 1,
        lastWatered: prev.lastWatered,
        date: prev.date,
      }));
      localStorage.setItem("weatherObject", JSON.stringify(weatherObject));
      console.log(`API has been called ${weatherObject.apiCalls} times today`);
      setIsVisible(false);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  } else {
    setIsVisible(true);
    setApiTooManyTimes(
      "You have called the api too many times today. Try again tomorrow."
    );
  }

  if (wateredToday(weatherObject.lastWatered)) {
    console.log("Already watered today!");
  } else {
    console.log("You haven't watered the plants today.");
  }
  return weatherObject;
};

function setTheDate(weatherObject, setDateToday, setWeather, weather) {
  const today = new Date().toISOString().substring(0, 10).trim();
  let tempObject = weatherObject;
  const date = tempObject.date ? tempObject.date.trim() : tempObject.date;

  if (date !== today) {
    tempObject.apiCalls = 1;
    tempObject.lastWatered = tempObject.lastWatered;
    tempObject.date = today;
    localStorage.setItem("weatherObject", JSON.stringify(tempObject));

    setDateToday(today);
    setWeather((prev) => ({
      ...prev,
      apiCalls: 1,
      lastWatered: prev.lastWatered,
      date: date,
    }));
    console.log("Date set successfully");
  } else {
    console.log("Date failed to save");
  }
  return tempObject;
}

function getRainData(idxYesterday, idxToday, precips, dates) {
  let SinceRain = 0;

  for (let i = idxYesterday; i >= 0; i--) {
    if (precips[i] > 0) break;
    SinceRain++;
  }

  let nRain = "None in next 7 days";
  for (let i = idxToday + 1; i < precips.length; i++) {
    if (precips[i] > 0) {
      const nextDate = new Date(dates[i + 1]);
      nRain = nextDate.toDateString();
      if (wateredToday(nRain)) {
        nRain = "Today, " + nRain;
      }
      break;
    }
  }
  return [SinceRain, nRain];
}

export function updateWateredTimestamp(
  setWeather,
  setLastWatered,
  setIsWateredToday
) {
  const now = new Date();
  let tempObject = JSON.parse(localStorage.getItem("weatherObject"));

  tempObject.apiCalls = tempObject.apiCalls;
  tempObject.lastWatered = now.toISOString();
  tempObject.date = tempObject.date;
  localStorage.setItem("weatherObject", JSON.stringify(tempObject));
  setWeather((prev) => ({
    ...prev,
    apiCalls: prev.apiCalls,
    lastWatered: tempObject.lastWatered,
    date: prev.date,
  }));
  setLastWatered(now.toLocaleString());
  setIsWateredToday(true);
}

export function displayStoredWateredTime() {
  let tempObject = JSON.parse(localStorage.getItem("weatherObject"));
  const last = tempObject ? tempObject.lastWatered : false;
  if (last) {
    const lastDate = new Date(last);
    if (wateredToday(last)) {
      return "The plants were watered today";
    } else if (wateredYesterday(last)) {
      return "The plants were watered yesterday";
    } else {
      const now = new Date();
      const diffMs = now - lastDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      return (
        diffDays.toString() +
        " day(s) and " +
        diffHours.toString() +
        " hour(s) ago"
      );
    }
  }
  return "The plants have never been watered";
}

function wateredToday(last) {
  if (!last) return false;

  const lastDate = new Date(last);
  const today = new Date();

  return (
    lastDate.getFullYear() === today.getFullYear() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getDate() === today.getDate()
  );
}

export function wateredYesterday(last) {
  if (!last) return false;

  const lastDate = new Date(last);
  const today = new Date();
  return (
    lastDate.getFullYear() === today.getFullYear() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getDate() === today.getDate() - 1
  );
}
