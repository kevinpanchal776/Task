import React, { useState, useEffect } from "react";
import axios from "axios";

function Weather() {
  const [city, setCity] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const apiKey = "ecaeed0d2dd14d17b6551431260303";

  // 🔍 City Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inputValue || inputValue.length < 2) {
        setOptions([]);
        return;
      }

      axios
        .get(
          `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${inputValue}`
        )
        .then((res) => setOptions(res.data))
        .catch(() => setOptions([]));
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // 🌤 Forecast (7 Days)
  useEffect(() => {
    if (!city) return;

    axios
      .get(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city.name}&days=7&aqi=no&alerts=no`
      )
      .then((res) => setForecast(res.data));
  }, [city]);

  const today = forecast?.forecast?.forecastday?.[0];

  // 🕒 Current hour detect
  const currentHour = new Date().getHours();

  // ⏰ Future hours only
  const filteredHours =
    today?.hour.filter((hour) => {
      const hourTime = new Date(hour.time).getHours();
      return hourTime > currentHour;
    }) || [];

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center text-white"
      style={{
        background: darkMode
          ? "linear-gradient(135deg,#1e3c72,#2a5298)"
          : "linear-gradient(135deg,#f6d365,#fda085)",
        transition: "0.4s",
        paddingTop: "60px",
      }}
    >
      <div className="container">

        {/* 🌙 Dark Mode Toggle */}
        <div className="text-end mb-3">
          <button
            className="btn btn-sm btn-light"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* 🔍 Search */}
        <div className="row justify-content-center mb-5">
          <div className="col-md-6 position-relative">
            <input
              type="text"
              className="form-control form-control-lg rounded-pill"
              placeholder="Search city..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            {options.length > 0 && (
              <ul
                className="list-group position-absolute w-100 shadow mt-1 rounded"
                style={{ zIndex: 1000 }}
              >
                {options.map((opt, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setCity(opt);
                      setInputValue(`${opt.name}, ${opt.country}`);
                      setOptions([]);
                      setActiveIndex(-1);
                    }}
                  >
                    {opt.name}, {opt.region}, {opt.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 🌤 Current Weather Card */}
        {forecast && today && (
          <div className="row justify-content-center mb-5">
            <div className="col-md-6">
              <div
                className="card shadow-lg border-0 rounded-4 p-4 position-relative fade-in"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  color: darkMode ? "white" : "black",
                }}
              >
                {/* 📌 Fixed Icon */}
                <img
                  src={forecast.current.condition.icon}
                  alt="icon"
                  style={{
                    width: "90px",
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                  }}
                />

                <h4 className="fw-bold">
                  {forecast.location.name}, {forecast.location.country}
                </h4>

                {/* 🌈 Gradient Temp */}
                <h1
                  className="display-3 fw-bold mt-3"
                  style={{
                    color: darkMode ? "white" : "black"
                  }}
                >
                  {forecast.current.temp_c}°C
                </h1>
                <h5>{forecast.current.condition.text}</h5>

                <p className="mt-3">
                  H: {today.day.maxtemp_c}°C | L: {today.day.mintemp_c}°C
                </p>

                <div className="row mt-3">
                  <div className="col">
                    <strong>Humidity</strong>
                    <p>{forecast.current.humidity}%</p>
                  </div>
                  <div className="col">
                    <strong>Wind</strong>
                    <p>{forecast.current.wind_kph} km/h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ⏰ Today Hourly Forecast */}
        {forecast && today && (
          <div className="row mb-5">
            <h4 className="mb-3 text-center">Today's Hourly Forecast</h4>

            <div className="d-flex overflow-auto gap-3 pb-3">
              {filteredHours.map((hour) => (
                <div
                  key={hour.time_epoch}
                  className="card text-center p-3 shadow border-0 rounded-4"
                  style={{
                    minWidth: "120px",
                    background: darkMode
                      ? "rgba(255,255,255,0.15)"
                      : "white",
                    color: darkMode ? "white" : "black",
                  }}
                >
                  <small>{hour.time.split(" ")[1]}</small>

                  <img
                    src={`https:${hour.condition.icon}`}
                    alt="icon"
                    style={{ width: "50px" }}
                  />

                  <div className="fw-bold">{hour.temp_c}°C</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📅 7 Day Forecast */}
        {forecast && (
          <div className="row mb-5">
            <h4 className="mb-3 text-center">7 Day Forecast</h4>

            <div className="d-flex overflow-auto gap-3 pb-2 justify-content-center flex-wrap">
              {forecast.forecast.forecastday.map((day) => (
                <div
                  key={day.date}
                  className="card text-center shadow-sm border-0 rounded-4 p-3"
                  style={{
                    width: "130px",   // 👈 smaller card
                    background: darkMode
                      ? "rgba(255,255,255,0.15)"
                      : "white",
                    color: darkMode ? "white" : "black",
                    backdropFilter: "blur(10px)",
                    transition: "0.3s",
                  }}
                >
                  <small className="fw-semibold">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </small>

                  {/* High quality icon */}
                  <img
                    src={`https:${day.day.condition.icon}`}
                    alt="icon"
                    style={{
                      width: "60px",      // 👈 bigger clean size
                      height: "60px",
                      objectFit: "contain",
                    }}
                  />

                  <div className="fw-bold mt-2">
                    {day.day.avgtemp_c}°C
                  </div>

                  <small className="text-muted">
                    H: {day.day.maxtemp_c}°
                    L: {day.day.mintemp_c}°
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✨ Animation CSS */}
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.6s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default Weather;