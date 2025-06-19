import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
/*import { fetchWeatherData, displayStoredWateredTime, updateWateredTimestamp, wateredToday, wateredYesterday} from "./scripts.js";

fetchWeatherData();
displayStoredWateredTime();
updateWateredTimestamp();
wateredToday();
wateredYesterday();*/

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
