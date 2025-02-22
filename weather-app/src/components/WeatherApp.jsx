import React, { useEffect, useState } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiHumidity,
  WiBarometer,
  WiStrongWind,
  WiThermometer,
} from "react-icons/wi";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiRefreshCw,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import { TbTemperatureCelsius, TbTemperatureFahrenheit } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) =>
        console.log("Service Worker registered:", registration)
      )
      .catch((error) =>
        console.log("Service Worker registration failed:", error)
      );
  });
}

const WeatherApp = () => {
  const [searchValue, setSearchValue] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [openWeatherData, setOpenWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [mapUrl, setMapUrl] = useState("");
  const [currentCity, setCurrentCity] = useState(
    () => localStorage.getItem("defaultCity") || "Dhubri"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [suggestions, setSuggestions] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    hourly: true,
    daily: true,
    airQuality: true,
    favorites: true,
    map: true,
    mood: true,
    widget: true,
  });

  const WEATHERAPI_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
  const OPENWEATHERMAP_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;
  const REFRESH_COOLDOWN = 60000;

  const citySuggestions = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Kolkata",
    "Chennai",
    "Dhubri",
    "London",
    "New York",
    "Tokyo",
  ];

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("defaultCity", currentCity);
  }, [currentCity]);
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchWeatherData, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);
  useEffect(() => {
    if (!autoRefresh && Date.now() - lastRefresh < REFRESH_COOLDOWN) {
      const timer = setInterval(() => {
        setRefreshCooldown(REFRESH_COOLDOWN - (Date.now() - lastRefresh));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setRefreshCooldown(0);
    }
  }, [lastRefresh, autoRefresh]);

  // Helper fnc...
  const convertTemp = (temp) =>
    unit === "imperial"
      ? `${Math.round((temp * 9) / 5 + 32)}°F`
      : `${Math.round(temp)}°C`;
  const convertWindSpeed = (speed) =>
    unit === "imperial"
      ? `${Math.round(speed / 1.609)} mph`
      : `${Math.round(speed)} km/h`;
  const formatTime = (timeStr) =>
    new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const getAirQualityLabel = (aqi) => {
    switch (aqi) {
      case 1:
        return { label: "Good", color: "bg-green-500" };
      case 2:
        return { label: "Fair", color: "bg-yellow-500" };
      case 3:
        return { label: "Moderate", color: "bg-orange-500" };
      case 4:
        return { label: "Poor", color: "bg-red-500" };
      case 5:
        return { label: "Very Poor", color: "bg-purple-500" };
      default:
        return { label: "Unknown", color: "bg-gray-500" };
    }
  };
  const getAirQualityAdvice = (aqi) => {
    switch (aqi) {
      case 1:
        return "Air quality is excellent!";
      case 2:
        return "Air is good, enjoy outdoors.";
      case 3:
        return "Moderate, sensitive groups take care.";
      case 4:
        return "Poor, limit outdoor activity.";
      case 5:
        return "Very poor, stay indoors.";
      default:
        return "Air quality data unavailable.";
    }
  };
  const getWeatherIcon = (
    condition,
    size = "w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32"
  ) => {
    const code = condition?.toLowerCase() || "";
    const iconProps = { className: size };
    switch (true) {
      case code.includes("rain"):
        return <WiRain {...iconProps} />;
      case code.includes("cloud"):
        return <WiCloudy {...iconProps} />;
      case code.includes("snow"):
        return <WiSnow {...iconProps} />;
      case code.includes("thunder"):
        return <WiThunderstorm {...iconProps} />;
      case code.includes("fog"):
        return <WiFog {...iconProps} />;
      default:
        return <WiDaySunny {...iconProps} />;
    }
  };
  const getWeatherMood = (condition, temp) => {
    const hour = new Date().getHours();
    const code = condition?.toLowerCase() || "";
    if (hour >= 5 && hour < 12) {
      // Morning
      if (code.includes("rain"))
        return { emoji: "🌧️", message: "Rainy morning, cozy up!" };
      if (code.includes("cloud"))
        return { emoji: "☁️", message: "Cloudy start to the day." };
      if (code.includes("snow"))
        return { emoji: "❄️", message: "Snowy morning delight!" };
      if (code.includes("thunder"))
        return { emoji: "⛈️", message: "Stormy morning, stay in!" };
      if (temp > 25) return { emoji: "😊", message: "Warm morning vibes!" };
      if (temp < 10)
        return { emoji: "🥶", message: "Chilly morning, wrap up!" };
      return { emoji: "🌞", message: "Bright morning ahead!" };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon
      if (code.includes("rain"))
        return { emoji: "🌧️", message: "Rainy afternoon, relax!" };
      if (code.includes("cloud"))
        return { emoji: "☁️", message: "Cloudy afternoon calm." };
      if (code.includes("snow"))
        return { emoji: "❄️", message: "Snowy afternoon fun!" };
      if (code.includes("thunder"))
        return { emoji: "⛈️", message: "Thunderous afternoon!" };
      if (temp > 25)
        return { emoji: "😊", message: "Hot afternoon, stay cool!" };
      if (temp < 10) return { emoji: "🥶", message: "Cool afternoon breeze!" };
      return { emoji: "🌞", message: "Sunny afternoon glow!" };
    } else if (hour >= 17 && hour < 21) {
      // Evening
      if (code.includes("rain"))
        return { emoji: "🌧️", message: "Rainy evening unwind!" };
      if (code.includes("cloud"))
        return { emoji: "☁️", message: "Cloudy evening calm." };
      if (code.includes("snow"))
        return { emoji: "❄️", message: "Snowy evening magic!" };
      if (code.includes("thunder"))
        return { emoji: "⛈️", message: "Stormy evening watch!" };
      if (temp > 25) return { emoji: "😊", message: "Warm evening vibes!" };
      if (temp < 10) return { emoji: "🥶", message: "Chilly evening air!" };
      return { emoji: "🌙", message: "Clear evening skies!" };
    } else {
      // Night
      if (code.includes("rain"))
        return { emoji: "🌧️", message: "Rainy night, sleep tight!" };
      if (code.includes("cloud"))
        return { emoji: "☁️", message: "Cloudy night calm." };
      if (code.includes("snow"))
        return { emoji: "❄️", message: "Snowy night wonder!" };
      if (code.includes("thunder"))
        return { emoji: "⛈️", message: "Stormy night ahead!" };
      if (temp > 25) return { emoji: "😊", message: "Warm night breeze!" };
      if (temp < 10) return { emoji: "🥶", message: "Cold night chill!" };
      return { emoji: "🌙", message: "Starry night peace!" };
    }
  };

  const fetchWeatherData = async () => {
    const now = Date.now();
    if (!autoRefresh && now - lastRefresh < REFRESH_COOLDOWN) return;

    setLoading(true);
    setError(null);
    try {
      const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${currentCity}&days=5&aqi=yes&alerts=yes`;
      const weatherApiResponse = await fetch(weatherApiUrl);
      const weatherApiData = await weatherApiResponse.json();
      if (weatherApiData.error) throw new Error(weatherApiData.error.message);

      setWeatherData({
        ...weatherApiData.current,
        location: weatherApiData.location,
      });
      setForecastData(weatherApiData.forecast);

      const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${OPENWEATHERMAP_KEY}&units=${unit}`;
      const openWeatherResponse = await fetch(openWeatherUrl);
      const openWeatherData = await openWeatherResponse.json();
      if (openWeatherData.cod !== 200) throw new Error(openWeatherData.message);

      setOpenWeatherData(openWeatherData);

      const lat = openWeatherData.coord.lat;
      const lon = openWeatherData.coord.lon;
      const zoom = 6;
      const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
      const y = Math.floor(
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) +
              1 / Math.cos((lat * Math.PI) / 180)
          ) /
            Math.PI) /
          2) *
          Math.pow(2, zoom)
      );
      setMapUrl(
        `https://tile.openweathermap.org/map/precipitation_new/${zoom}/${x}/${y}.png?appid=${OPENWEATHERMAP_KEY}`
      );

      setLastRefresh(now);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [currentCity, unit]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${position.coords.latitude},${position.coords.longitude}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          setCurrentCity(data.location.name);
        } catch (error) {
          setError("Error getting location");
        }
      });
    }
  };

  const toggleFavorite = () => {
    const newFavorites = favorites.includes(currentCity)
      ? favorites.filter((city) => city !== currentCity)
      : [...favorites, currentCity];
    setFavorites(newFavorites);
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length > 1) {
      setSuggestions(
        citySuggestions.filter((city) =>
          city.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const downloadReport = () => {
    const report = `
      Weather Report for ${weatherData.location?.name}
      Date: ${new Date().toLocaleDateString()}
      Current Temperature: ${convertTemp(weatherData.temp_c)}
      Feels Like: ${convertTemp(weatherData.feelslike_c)}
      Humidity: ${weatherData.humidity}%
      Wind Speed: ${convertWindSpeed(weatherData.wind_kph)}
      Pressure: ${weatherData.pressure_mb} hPa
      Forecast (Next 24 Hours):
      ${forecastData.forecastday[0].hour
        .slice(0, 24)
        .map(
          (item) =>
            `${formatTime(item.time)}: ${convertTemp(item.temp_c)} - ${
              item.condition.text
            }`
        )
        .join("\n")}
    `;
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${weatherData.location?.name}_weather_report.txt`;
    link.click();
  };

  const canRefresh = Date.now() - lastRefresh >= REFRESH_COOLDOWN;
  const cooldownProgress =
    refreshCooldown > 0 ? (refreshCooldown / REFRESH_COOLDOWN) * 100 : 0;

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 font-lato ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-blue-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto">
        <div
          className={`flex flex-col sm:flex-row items-center justify-between mb-6 p-4 sm:p-6 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="relative w-full flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchInput}
                onKeyDown={(e) =>
                  e.key === "Enter" && setCurrentCity(searchValue)
                }
                placeholder="Search city..."
                className={`w-full px-4 py-3 pl-10 rounded-lg font-lato ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-100 border-gray-600"
                    : "bg-gray-100 text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400 border`}
              />
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
              {suggestions.length > 0 && (
                <ul
                  className={`absolute z-10 mt-2 w-full rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-100 border-gray-600"
                      : "bg-white text-gray-900 border-gray-200"
                  } max-h-40 overflow-y-auto`}
                >
                  {suggestions.map((city) => (
                    <li
                      key={city}
                      onClick={() => {
                        setCurrentCity(city);
                        setSearchValue("");
                        setSuggestions([]);
                      }}
                      className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer font-lato"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getCurrentLocation}
                className={`p-2 sm:p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
                title="Get current location"
              >
                <FiMapPin className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setUnit(unit === "metric" ? "imperial" : "metric")
                }
                className={`p-2 sm:p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
                title="Toggle temperature unit"
              >
                {unit === "metric" ? (
                  <TbTemperatureCelsius className="w-5 h-5" />
                ) : (
                  <TbTemperatureFahrenheit className="w-5 h-5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={`p-2 sm:p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
                title="Toggle theme"
              >
                {theme === "light" ? (
                  <FiMoon className="w-5 h-5" />
                ) : (
                  <FiSun className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && !loading && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              theme === "dark"
                ? "bg-red-900/20 border-red-700"
                : "bg-red-50 border-red-300"
            } flex items-center gap-2`}
          >
            <FiRefreshCw className="text-red-500" />
            <p
              className={`font-lato ${
                theme === "dark" ? "text-red-300" : "text-red-700"
              }`}
            >
              {error}
            </p>
          </div>
        )}

        {!loading && weatherData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Current Weather */}
            <div
              className={`rounded-lg p-4 sm:p-6 border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-raleway font-semibold text-2xl sm:text-3xl">
                      {weatherData.location?.name}
                    </h1>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={toggleFavorite}
                      className={`p-1 rounded-full transition-colors ${
                        favorites.includes(currentCity)
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      <FiStar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                  </div>
                  <p className="text-gray-400 flex items-center gap-2 font-lato text-base sm:text-lg">
                    <IoLocationSharp />
                    {weatherData.location?.country}
                  </p>
                </div>
                <div
                  className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-white text-xs sm:text-sm font-lato ${
                    getAirQualityLabel(
                      weatherData.air_quality?.["us-epa-index"]
                    )?.color
                  }`}
                >
                  {
                    getAirQualityLabel(
                      weatherData.air_quality?.["us-epa-index"]
                    )?.label
                  }
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center justify-center">
                  {getWeatherIcon(weatherData.condition?.text)}
                  <div className="ml-2 sm:ml-4">
                    <div className="font-lato font-medium text-4xl sm:text-5xl">
                      {convertTemp(weatherData.temp_c)}
                    </div>
                    <p className="text-lg sm:text-xl text-gray-400 font-lato">
                      {weatherData.condition?.text}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 group">
                    <WiThermometer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400 font-lato group-hover:text-blue-400 transition-colors">
                        Feels Like Temperature
                      </p>
                      <p className="font-semibold font-lato text-base sm:text-lg">
                        {convertTemp(weatherData.feelslike_c)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 group">
                    <WiHumidity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400 font-lato group-hover:text-blue-400 transition-colors">
                        Humidity Level
                      </p>
                      <p className="font-semibold font-lato text-base sm:text-lg">
                        {weatherData.humidity}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 group">
                    <WiStrongWind className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400 font-lato group-hover:text-blue-400 transition-colors">
                        Wind Speed
                      </p>
                      <p className="font-semibold font-lato text-base sm:text-lg">
                        {convertWindSpeed(weatherData.wind_kph)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 group">
                    <WiBarometer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400 font-lato group-hover:text-blue-400 transition-colors">
                        Atmospheric Pressure
                      </p>
                      <p className="font-semibold font-lato text-base sm:text-lg">
                        {weatherData.pressure_mb} hPa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {forecastData && (
              <div
                className={`rounded-lg p-4 sm:p-6 border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                    Hourly Forecast
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => toggleSection("hourly")}
                    className="text-gray-400"
                  >
                    {expandedSections.hourly ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.button>
                </div>
                {expandedSections.hourly && (
                  <div className="flex overflow-x-auto gap-2 sm:gap-4 pb-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                    {forecastData.forecastday[0].hour
                      .slice(0, 24)
                      .map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`text-center p-2 sm:p-3 rounded-lg min-w-[80px] sm:min-w-[100px] ${
                            theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <p className="text-xs sm:text-sm text-gray-400 font-lato">
                            {formatTime(item.time)}
                          </p>
                          {getWeatherIcon(
                            item.condition.text,
                            "w-8 h-8 sm:w-10 sm:h-10 mx-auto"
                          )}
                          <p className="font-semibold font-lato text-sm sm:text-base">
                            {convertTemp(item.temp_c)}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {forecastData && (
              <div
                className={`rounded-lg p-4 sm:p-6 border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                    5-Day Forecast
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => toggleSection("daily")}
                    className="text-gray-400"
                  >
                    {expandedSections.daily ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.button>
                </div>
                {expandedSections.daily && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {forecastData.forecastday.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-3 sm:p-4 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <p className="text-xs sm:text-sm text-gray-400 font-lato mb-2">
                          {formatDate(day.date)}
                        </p>
                        <div className="flex items-center justify-between">
                          {getWeatherIcon(
                            day.day.condition.text,
                            "w-8 h-8 sm:w-10 sm:h-10"
                          )}
                          <div className="text-right">
                            <p className="font-semibold font-lato text-sm sm:text-base">
                              {convertTemp(day.day.maxtemp_c)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400 font-lato">
                              {convertTemp(day.day.mintemp_c)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-lato">
                          {day.day.condition.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mapUrl && (
              <div
                className={`rounded-lg p-4 sm:p-6 border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                    Weather Map
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => toggleSection("map")}
                    className="text-gray-400"
                  >
                    {expandedSections.map ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.button>
                </div>
                {expandedSections.map && (
                  <div className="w-full h-48 sm:h-64 overflow-hidden rounded-lg">
                    <img
                      src={mapUrl}
                      alt="Weather Map"
                      className="w-full h-full object-cover"
                      onError={() => setMapUrl("")}
                    />
                    {!mapUrl && (
                      <p className="text-sm text-gray-400 font-lato">
                        Map unavailable
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Weather Mood : ) */}
            {weatherData && (
              <div
                className={`rounded-lg p-4 sm:p-6 border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                    Weather Mood
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => toggleSection("mood")}
                    className="text-gray-400"
                  >
                    {expandedSections.mood ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.button>
                </div>
                {expandedSections.mood && (
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl mb-2">
                      {
                        getWeatherMood(
                          weatherData.condition?.text,
                          weatherData.temp_c
                        ).emoji
                      }
                    </p>
                    <p className="font-lato text-base sm:text-lg">
                      {
                        getWeatherMood(
                          weatherData.condition?.text,
                          weatherData.temp_c
                        ).message
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Air Quality */}
            {weatherData?.air_quality && (
              <div
                className={`rounded-lg p-4 sm:p-6 border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                    Air Quality
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => toggleSection("airQuality")}
                    className="text-gray-400"
                  >
                    {expandedSections.airQuality ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.button>
                </div>
                {expandedSections.airQuality && (
                  <>
                    <p className="font-lato text-base sm:text-lg">
                      {getAirQualityAdvice(
                        weatherData.air_quality["us-epa-index"]
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 font-lato mt-2">
                      AQI: {weatherData.air_quality["us-epa-index"]}
                    </p>
                  </>
                )}
              </div>
            )}

            {favorites.length > 0 && (
              <div
                className={`rounded-lg p-4 sm:p-6 border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                    Favorites
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => toggleSection("favorites")}
                    className="text-gray-400"
                  >
                    {expandedSections.favorites ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.button>
                </div>
                {expandedSections.favorites && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {favorites.map((city) => (
                      <motion.div
                        key={city}
                        whileHover={{ scale: 1.03 }}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <span
                          onClick={() => setCurrentCity(city)}
                          className="cursor-pointer hover:text-blue-500 font-lato text-base sm:text-lg"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setCurrentCity(city)
                          }
                        >
                          {city}
                        </span>
                        <button
                          onClick={() =>
                            setFavorites(
                              favorites.filter((fav) => fav !== city)
                            )
                          }
                          className="text-gray-400 hover:text-red-500"
                          title={`Remove ${city}`}
                          aria-label={`Remove ${city}`}
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              className={`rounded-lg p-4 sm:p-6 border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold font-raleway">
                  Weather Widget
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => toggleSection("widget")}
                  className="text-gray-400"
                >
                  {expandedSections.widget ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </motion.button>
              </div>
              {expandedSections.widget && (
                <div className="space-y-4">
                  <div
                    className={`p-3 sm:p-4 rounded-lg ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    } flex items-center gap-4`}
                  >
                    {getWeatherIcon(
                      weatherData.condition?.text,
                      "w-10 h-10 sm:w-12 sm:h-12"
                    )}
                    <div>
                      <p className="font-lato text-base sm:text-lg">
                        {weatherData.location?.name}
                      </p>
                      <p className="font-lato font-medium text-sm sm:text-base">
                        {convertTemp(weatherData.temp_c)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 font-lato">
                        {weatherData.condition?.text}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={downloadReport}
                    className={`px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-lato transition-colors text-sm sm:text-base`}
                  >
                    Download Report
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-4">
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!autoRefresh && canRefresh) fetchWeatherData();
                setAutoRefresh(!autoRefresh);
              }}
              className={`p-3 sm:p-4 rounded-full ${
                autoRefresh
                  ? "bg-green-500"
                  : canRefresh
                  ? "bg-blue-500"
                  : "bg-gray-500"
              } hover:bg-opacity-90 transition-colors shadow-md relative`}
              title={
                autoRefresh
                  ? "Disable Auto-Refresh"
                  : canRefresh
                  ? "Enable Auto-Refresh"
                  : "Refresh disabled (1 min cooldown)"
              }
            >
              <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              {!autoRefresh && !canRefresh && (
                <svg
                  className="absolute top-0 left-0 w-full h-full"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeDasharray="100"
                    strokeDashoffset={cooldownProgress}
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              )}
            </motion.button>
            {!autoRefresh && !canRefresh && (
              <span className="absolute bottom-12 sm:bottom-14 right-0 bg-gray-800 text-white text-xs font-lato rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Refresh in {Math.ceil(refreshCooldown / 1000)}s
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
