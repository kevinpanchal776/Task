import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";
import "./HeroSection.css";

const HeroSection = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [recentCities, setRecentCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [selectedWeather, setSelectedWeather] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // ================= FETCH WEATHER =================
  const fetchWeather = async (city, isRecent = false) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=1&aqi=no`
      );

      setWeatherData((prev) => ({
        ...prev,
        [city]: res.data,
      }));

      if (!isRecent) {
        setSelectedWeather(res.data);

        setRecentCities((prev) => {
          const updated = [city, ...prev.filter((c) => c !== city)];
          const sliced = updated.slice(0, 3);

          // ✅ Save to localStorage
          localStorage.setItem("recentCities", JSON.stringify(sliced));

          return sliced;
        });
      }

    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  // ================= FETCH SUGGESTIONS =================
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setShowDropdown(false);
      return;
    }

    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
      );
      setSuggestions(res.data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Suggestion error:", error);
    }
  };

  // ================= DEFAULT CITY =================
  useEffect(() => {
    const savedCities = JSON.parse(localStorage.getItem("recentCities"));

    if (savedCities && savedCities.length > 0) {
      setRecentCities(savedCities);

      // Fetch weather for saved cities
      savedCities.forEach((city) => {
        fetchWeather(city, true);
      });

      // First city main ma show karva mate
      fetchWeather(savedCities[0], false);
    } else {
      fetchWeather("Ahmedabad", false);
    }
  }, []);

  return (
    <>
      {/* ================= HERO (UNCHANGED) ================= */}
      <div className="hero">
        <div className="overlay"></div>

        <div className="hero-content">
          <div className="search-container">
            <div className="search-box">
              <FiSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search your Address, City or Zip Code"
                value={input}
                onChange={(e) => {
                  const value = e.target.value;
                  setInput(value);
                  if (value.trim()) {
                    fetchSuggestions(value);
                  } else {
                    setShowDropdown(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    fetchWeather(input.trim(), false);
                    setInput("");
                    setShowDropdown(false);
                  }
                }}
              />

              {input && (
                <FiX
                  className="clear-icon"
                  onClick={() => {
                    setInput("");
                    setShowDropdown(false);
                  }}
                />
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="dropdown">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => {
                      fetchWeather(item.name, false);
                      setInput("");
                      setShowDropdown(false);
                    }}
                  >
                    <span className="city-name">{item.name}</span>
                    <span className="city-region">
                      {item.region}, {item.country}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {loading && <p className="loading">Loading...</p>}
          </div>

          {/* ================= RECENT LOCATIONS ================= */}
          <div className="recent-section">
            <p className="recent-title">RECENT LOCATIONS</p>

            <div className="recent-cards">
              {recentCities.map((city, index) => {
                const data = weatherData[city];

                return (
                  <div
                    key={index}
                    className="accu-card"
                    onClick={() => setSelectedWeather(data)}
                  >
                    {data ? (
                      <>
                        <h2>{data.location.name}</h2>
                        <p className="country">
                          {data.location.country}
                        </p>

                        <div className="temp-row">
                          <img
                            src={`https:${data.current.condition.icon}`}
                            alt="icon"
                          />
                          <div className="temp-value">
                            {data.current.temp_c}°
                          </div>
                        </div>
                      </>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= WEATHER SECTION ================= */}
      {selectedWeather && (
        <div className="weather-wrapper">
          {/* TODAY WEATHER */}
          {/* ================= TODAY WEATHER ================= */}
          <div className="today-card">
            <div className="today-header">
              <span>TODAY'S WEATHER</span>
              <span className="today-date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).toUpperCase()}
              </span>
            </div>

            <div className="today-body">
              <div className="today-row">
                <span className="today-icon hot">🌡</span>
                <p>
                  {selectedWeather.forecast.forecastday[0].day.condition.text}
                  {" "}Hi:{" "}
                  {selectedWeather.forecast.forecastday[0].day.maxtemp_c}°
                </p>
              </div>

              <div className="today-row">
                <span className="today-icon moon">🌙</span>
                <p>
                  Tonight:{" "}
                  {selectedWeather.forecast.forecastday[0].day.condition.text}
                  {" "}Lo:{" "}
                  {selectedWeather.forecast.forecastday[0].day.mintemp_c}°
                </p>
              </div>
            </div>
          </div>
          {/* CURRENT WEATHER */}
          {selectedWeather && (
            <div className="current-card">
              <div className="current-header">
                <span>CURRENT WEATHER</span>
                <span>{currentTime}</span>
              </div>

              <div className="current-body">

                {/* LEFT SIDE */}
                <div className="current-left">
                  <div className="temp-row">
                    <img
                      src={`https:${selectedWeather.current.condition.icon}`}
                      alt="weather icon"
                      className="weather-icon"
                    />

                    <h1 className="main-temp">
                      {selectedWeather.current.temp_c}°
                      <span>C</span>
                    </h1>
                  </div>

                  <p className="realfeel">
                    RealFeel® {selectedWeather.current.feelslike_c}°
                  </p>

                  <p className="weather-text">
                    {selectedWeather.current.condition.text}
                  </p>

                  <p className="more-details">MORE DETAILS ›</p>
                </div>

                {/* RIGHT SIDE */}
                <div className="current-right">

                  <div className="detail-row">
                    <span>RealFeel Shade™</span>
                    <span>{selectedWeather.current.feelslike_c}°</span>
                  </div>

                  <div className="detail-row">
                    <span>Wind</span>
                    <span>
                      {selectedWeather.current.wind_dir}{" "}
                      {selectedWeather.current.wind_kph} km/h
                    </span>
                  </div>

                  <div className="detail-row">
                    <span>Wind Gusts</span>
                    <span>{selectedWeather.current.gust_kph} km/h</span>
                  </div>

                  <div className="detail-row">
                    <span>Air Quality</span>
                    <span>
                      {selectedWeather.current.air_quality?.us_epa_index <= 2
                        ? "Good"
                        : selectedWeather.current.air_quality?.us_epa_index <= 3
                          ? "Moderate"
                          : selectedWeather.current.air_quality?.us_epa_index <= 4
                            ? "Unhealthy for Sensitive"
                            : "Poor"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HeroSection;