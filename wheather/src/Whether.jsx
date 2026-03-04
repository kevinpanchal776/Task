import React, { useState, useEffect } from "react";
import axios from "axios";

function Weather() {
  const [city, setCity] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

 const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const darkMode = true; // Default dark theme

  //  City Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inputValue || inputValue.length < 1) {
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

  //  Forecast (7 Days)
  useEffect(() => {
    if (!city) return;

    axios
      .get(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city.name}&days=7&aqi=no&alerts=no`
      )
      .then((res) => setForecast(res.data));
  }, [city]);

  const today = forecast?.forecast?.forecastday?.[0];

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center text-white"
      style={{
        background: "linear-gradient(135deg,#1e3c72,#2a5298)",
        transition: "0.4s",
        paddingTop: "60px",
      }}
    >
      <div className="container">
        <h1
          className="text-center fw-bold mb-4"
          style={{
            background: "linear-gradient(45deg,#ff9a9e,#fad0c4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {city ? `${city.name} Weather` : "Weather Forecast"}
        </h1>

        {/*  Search */}
        <div className="row justify-content-center mb-5">
          <div className="col-md-6 position-relative">
            <input
              type="text"
              className="form-control form-control-lg rounded-pill ps-5"
              placeholder="Search city..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            {/* Cancel / Clear Button */}
            {inputValue && (
              <button
                className="btn btn-sm position-absolute"
                style={{
                  top: "50%",                  
                  right: "20px",               
                  transform: "translateY(-50%)",
                  zIndex: 1000,
                  color: "white",              
                  background: "transparent",  
                  border: "none",              
                  padding: "0 6px",
                  height: "24px",
                  lineHeight: "24px",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setInputValue("");
                  setOptions([]);
                }}
              >
                ❌
              </button>
            )}

            {/* Dropdown options */}
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
                    }}
                  >
                    {opt.name}, {opt.region}, {opt.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/*  Current Weather Card */}
        {forecast && today && (
          <div className="row justify-content-center mb-5">
            <div className="col-md-6">
              <div
                className="card shadow-lg border-0 rounded-4 p-4 position-relative fade-in"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >
                <img
                  src={forecast.current.condition.icon}
                  alt="icon"
                  style={{
                    width: "80px",
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                  }}
                />
                <h4 className="fw-bold">
                  {forecast.location.name}, {forecast.location.country}
                </h4>
                <h1 className="display-3 fw-bold mt-3">
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

        {/*  Today Hourly Forecast */}
        {forecast && today && (
          <div className="row mb-5">
            <h4 className="mb-3 text-center">Today's Hourly Forecast</h4>
            <div className="d-flex overflow-auto gap-3 pb-3">
              {today.hour
                .filter((hour) => new Date(hour.time).getTime() > new Date().getTime())
                .map((hour) => (
                  <div
                    key={hour.time_epoch}
                    className="card text-center p-3 shadow border-0 rounded-4"
                    style={{
                      minWidth: "140px",
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      transition: "0.3s",
                    }}
                  >
                    <small className="fw-semibold">
                      {new Date(hour.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                    <img
                      src={`https:${hour.condition.icon}`}
                      alt="icon"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                      }}
                    />
                    <div className="fw-bold fs-5">{hour.temp_c}°C</div>
                    <small>💧 {hour.humidity}%</small>
                    <small>🌬 {hour.wind_kph} km/h</small>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/*  7 Day Forecast */}
        {forecast && (
          <div className="row mb-5">
            <h4 className="mb-3 text-center">7 Day Forecast</h4>
            <div className="d-flex flex-column gap-3">
              {forecast.forecast.forecastday.map((day, index) => {
                const isExpanded = expandedDay === index;
                return (
                  <div key={day.date}>
                    <div
                      className="card shadow-sm border-0 rounded-4 p-3 d-flex flex-row align-items-center justify-content-between"
                      style={{
                        cursor: "pointer",
                        background: "rgba(255,255,255,0.15)",
                        color: "white",
                        backdropFilter: "blur(10px)",
                        transition: "0.3s",
                      }}
                      onClick={() =>
                        setExpandedDay(isExpanded ? null : index)
                      }
                    >
                      <div>
                        <div className="fw-bold">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </div>
                        <small>{day.day.condition.text}</small>
                      </div>
                      <img
                        src={`https:${day.day.condition.icon}`}
                        alt="icon"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "contain",
                        }}
                      />
                      <div className="text-end">
                        <div className="fw-bold">{day.day.avgtemp_c}°C</div>
                        <small>🌧 {day.day.daily_chance_of_rain}%</small>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="mt-2 p-3 rounded-4"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          transition: "0.4s",
                        }}
                      >
                        <div className="d-flex overflow-auto gap-3">
                          {day.hour.map((hour) => (
                            <div
                              key={hour.time_epoch}
                              className="card text-center p-2 border-0 shadow-sm rounded-4"
                              style={{
                                minWidth: "110px",
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                              }}
                            >
                              <small>
                                {new Date(hour.time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                              <img
                                src={`https:${hour.condition.icon}`}
                                alt="icon"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "contain",
                                }}
                              />
                              <div className="fw-bold">{hour.temp_c}°C</div>
                              <small>🌧 {hour.chance_of_rain}%</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/*  Animation CSS */}
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