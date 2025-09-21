import { useWeatherStore } from "./weatherStore";

// set local storage object and weather object when opening page
export function setObject() {
  localStorage.removeItem("weatherObject");
  let weatherObject;
  try {
    weatherObject = JSON.parse(localStorage.getItem("weatherObject"));
  } catch (error) {
    console.error("Error parsing weatherObject:", error);
    weatherObject = null;
  }
  if (!weatherObject) {
    // First-time setup
    weatherObject = {
      apiCalls: 0,
      date: null,
      degrees: null,
      lastRain: [
        "2025-05-22T12:00:00",
        "2025-06-20T12:00:00",
        "2025-06-21T12:00:00",
        "2025-06-22T12:00:00",
        "2025-07-21T12:00:00",
        "2025-08-06T12:00:00",
        "2025-08-15T12:00:00",
        "2025-08-16T12:00:00",
        "2025-09-05T12:00:00",
      ],
      lastWatered: [
        "2025-05-24T22:07:04.000",
        "2025-05-30T10:15:55.000",
        "2025-06-08T20:59:24.000",
        "2025-06-15T19:12:17.000",
        "2025-06-25T21:43:52.000",
        "2025-06-30T23:29:02.000",
        "2025-07-06T21:55:14.000",
        "2025-07-13T10:39:58.000",
        "2025-07-20T23:34:51.000",
        "2025-07-28T22:45:05.000",
        "2025-08-04T22:05:32.000",
        "2025-08-11T22:18:37.000",
        "2025-08-21T17:49:22.000",
        "2025-08-26T16:03:14.000",
        "2025-09-02T17:53:06.000",
        "2025-09-07T22:58:25.000",
        "2025-09-11T22:38:20.000",
        "2025-09-18T20:35:22.000",
      ],
    };
    localStorage.setItem("weatherObject", JSON.stringify(weatherObject));
    console.log("Object has been created and saved successfully");
  } else {
    console.log("Object already exists");
  }
  useWeatherStore.getState().setWeather({
    apiCalls: weatherObject.apiCalls,
    date: weatherObject.date,
    degrees: weatherObject.degrees,
    lastRain: weatherObject.lastRain,
    lastWatered: weatherObject.lastWatered,
  });
}

// fetch weather data from meteo api
export const fetchWeatherData = async (
  setTempToday,
  setTempYesterday,
  setTempTomorrow,
  setDaysSinceRain,
  setNextRain,
  setApiTooManyTimes,
  setIsVisible
) => {
  const prevDays = 10;
  const nextDays = 7;
  let weatherObject = useWeatherStore.getState().weather;
  const lat = 45.52447795249103; // Updated Portland latitude
  const lon = -122.6368712593244; // Updated Portland longitude

  setTheDate(weatherObject);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Example client-side tracking
  const formatDate = (d) => convertDate(d).split("T")[0];
  const start = formatDate(
    new Date(today.getTime() - prevDays * 24 * 60 * 60 * 1000)
  );
  const end = formatDate(
    new Date(today.getTime() + nextDays * 24 * 60 * 60 * 1000)
  );

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&temperature_unit=fahrenheit&timezone=auto&start_date=${start}&end_date=${end}`;

  if (weatherObject.apiCalls < 600) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("data: ", data);
      const dates = data.daily.time;
      const temps = data.daily.temperature_2m_max;
      const precips = data.daily.precipitation_sum;
      const idxToday = dates.indexOf(formatDate(today));
      const idxYesterday = dates.indexOf(formatDate(yesterday));
      const idxTomorrow = dates.indexOf(formatDate(tomorrow));

      setTempToday(temps[idxToday].toFixed(1));
      setTempYesterday(temps[idxYesterday].toFixed(1));
      setTempTomorrow(temps[idxTomorrow].toFixed(1));

      let rainData = getRainData(
        idxToday,
        idxYesterday,
        precips,
        dates,
        prevDays
      );
      console.log("rain", rainData)
      setDaysSinceRain(rainData[0]);
      setNextRain(rainData[1]);

      useWeatherStore.getState().setWeather({
        apiCalls: (weatherObject.apiCalls += 1),
        degrees: data.daily_units.temperature_2m_max,
      });

      weatherObject = useWeatherStore.getState().weather;
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

  if (
    wateredToday(
      weatherObject.lastWatered[weatherObject.lastWatered.length - 1]
    )
  ) {
    console.log("Already watered today!");
  } else {
    console.log("You haven't watered the plants today.");
  }
  return weatherObject;
};

// set the date when website is opened to the local storage and weather object; reset apiCalls
function setTheDate(weatherObject) {
  const today = convertDate().substring(0, 10);
  let tempObject = { ...weatherObject };
  const date = tempObject.date ? tempObject.date.trim() : null;

  if (date !== today) {
    useWeatherStore.getState().setWeather({
      apiCalls: 1,
      date: today,
    });
    tempObject = { ...useWeatherStore.getState().weather };
    localStorage.setItem("weatherObject", JSON.stringify(tempObject));

    console.log("Date set successfully");
  } else {
    if (tempObject.date) {
      console.log("Date already exists");
    } else {
      console.log("Date failed to save");
    }
  }
  return tempObject;
}

// get rain data from the api and/or local storage
function getRainData(idxToday, idxYesterday, precips, dates, prevDays) {
  const today = new Date();
  const day = Number(today.getDate());
  let nRain = "None in the next 7 days";
  const weather = useWeatherStore.getState().weather;
  const lastRainDay = !weather.lastRain ? 0 : Number(new Date(weather.lastRain[weather.lastRain.length - 1]).getDate());
  let tempObject = { ...weather };
  let SinceRain = 0;
  let since;
  
  for (let i = idxYesterday; i >= 0; i--) {
    if (precips[i] > 0) break;
    SinceRain++;
  }
  //check if rain is today and set rain in weather and local storage
  if (!tempObject.lastRain[0] && SinceRain >= prevDays) {
    since = "Not Available";
  } else if (SinceRain < prevDays) {
    if (
      !tempObject.lastRain[0] || dates[idxYesterday - SinceRain] + "T12:00:00" !==
      tempObject.lastRain[tempObject.lastRain.length - 1]
    ) {
      tempObject.lastRain.push(dates[idxYesterday - SinceRain] + "T12:00:00");
      useWeatherStore.getState().setWeather({
        lastRain: tempObject.lastRain,
      });
      localStorage.setItem("weatherObject", JSON.stringify(tempObject));
    }
    since = day - lastRainDay;
  } else {
    since = day - lastRainDay;
  }
  
  // Get next Rain data from api
  for (let i = idxToday; i < precips.length; i++) {
    const [year, month, day] = dates[i].split("-").map(Number);
    const localDate = new Date(year, month - 1, day); // Always local

    if (precips[i] > 0) {
      const nextDate = new Date(localDate);
      nRain = nextDate.toDateString();
      if (wateredToday(nRain)) {
        nRain = "Today, " + nRain.substring(0, 10);
      }
      break;
    }
  }
  return [since, nRain];
}

// check the difference in days and hours between two dates
function getDaysHours(lastDate) {
  const now = new Date();
  const diffMs = now - lastDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  return [diffDays, diffHours];
}

// update water time stamp with button push and set weather and local storage
export function updateWateredTimestamp(setIsWateredToday) {
  const now = convertDate();
  const state = useWeatherStore.getState();
  const weather = state.weather;
  let tempObject = { ...weather };
  const updatedWater = [...weather.lastWatered, now];
  tempObject.lastWatered = updatedWater;

  state.setWeather({ lastWatered: updatedWater });
  localStorage.setItem("weatherObject", JSON.stringify(tempObject));
  setIsWateredToday(true);
}

// convert date into readable date configuration
function convertDate(date) {
  const today = date ? new Date(date) : new Date();

  const yyyy = String(today.getFullYear());
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const hh = String(today.getHours()).padStart(2, "0");
  const min = String(today.getMinutes()).padStart(2, "0");
  const sec = String(today.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}.000`;
}

// display the stored watered time for the website
export function displayStoredWateredTime(last) {
  let weather = useWeatherStore.getState().weather;
  let tempObject = { ...weather };

  if (!last) {
    last = tempObject.lastWatered
      ? tempObject.lastWatered[tempObject.lastWatered.length - 1]
      : false;
  }
  if (last) {
    const lastDate = new Date(last);
    if (wateredToday(last)) {
      return "The plants were watered today";
    } else if (wateredYesterday(last)) {
      return "The plants were watered yesterday";
    } else {
      const tempArray = getDaysHours(lastDate);
      const diffDays = tempArray[0];
      const diffHours = tempArray[1];

      let day = diffDays === 1 ? " day" : " days";
      let hour = diffHours === 1 ? " hour" : " hours";
      return (
        diffDays.toString() +
        day +
        " and " +
        diffHours.toString() +
        hour +
        " ago"
      );
    }
  }
  return "The plants have never been watered";
}

// check to see if plants were watered today, returns boolean
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

// check to see if plants were watered yesterday, returns boolean
function wateredYesterday(last) {
  if (!last) return false;

  const lastDate = new Date(last);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return (
    lastDate.getFullYear() === yesterday.getFullYear() &&
    lastDate.getMonth() === yesterday.getMonth() &&
    lastDate.getDate() === yesterday.getDate()
  );
}

export function displayReadableWateredTime(lastWatered) {
  const d = new Date(lastWatered);
  
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.toLocaleString("en-US", {day: "2-digit"});
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

// used to update local storage. has not been implemented yet
function updateLocalStorage(weather) {
  let tempObject = {
    apiCalls: weather.apiCalls,
    lastWatered: weather.lastWatered,
    date: weather.date,
    degrees: weather.degrees,
    lastRain: weather.lastRain,
  };
  localStorage.setItem("weatherObject", JSON.stringify(tempObject));
}
