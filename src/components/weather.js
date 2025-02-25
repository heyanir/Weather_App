import React, { useEffect, useState, useCallback, useRef } from 'react';
import './weather.css';

import Search_Icon from '../assets/search.png';
import ClearDay_Icon from '../assets/Clear_Sunny.png';
import Humidity_Icon from '../assets2/humidity.png';
import WindSpeed_Icon from '../assets2/wind.png';
import AirPressure_Icon from '../assets2/airpressure.png';
import Visibility_Icon from '../assets2/visibility.png';
import Cloudy_Icon from '../assets2/cloud.png';
import Rain_Icon from '../assets2/rain.png';
import Snow_Icon from '../assets2/snow.png';
import Drizzle_Icon from '../assets2/drizzle.png';

// Air Quality Icons
import AQ_Good from '../assets2/aq_good.png';
import AQ_Moderate from '../assets2/aq_moderate.png';
import AQ_Unhealthy from '../assets2/aq_unhealthy.png';

const allIcons = {
  "01d": ClearDay_Icon,
  "01n": ClearDay_Icon,
  "02d": Cloudy_Icon,
  "02n": Cloudy_Icon,
  "03d": Rain_Icon,
  "03n": Rain_Icon,
  "04d": Snow_Icon,
  "04n": Snow_Icon,
  "09d": Drizzle_Icon,
  "09n": Drizzle_Icon,
};

const Weather = () => {
  const inputRef = useRef();
  const [weatherdata, setweatherdata] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [city, setCity] = useState('Phagwara');

  const search = useCallback(async () => {
    if (!city) return;

    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=4830aa09e3203540b254ded35d9d58b2`;
      const response = await fetch(weatherUrl);
      const data = await response.json();

      if (data.cod !== 200) {
        console.error("Error:", data.message);
        setweatherdata(null);
        setAqiData(null);
        return;
      }

      setweatherdata({
        humidity: data.main.humidity,
        windspeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        pressure: data.main.pressure,
        location: data.name,
        visibility: (data.visibility / 1000).toFixed(1),
        icon: allIcons[data.weather[0].icon] || ClearDay_Icon,
        lat: data.coord.lat,
        lon: data.coord.lon,
      });

      fetchAirQuality(data.coord.lat, data.coord.lon);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }, [city]);

  const fetchAirQuality = async (lat, lon) => {
    try {
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=4830aa09e3203540b254ded35d9d58b2`;
      const response = await fetch(aqiUrl);
      const data = await response.json();

      if (data.list && data.list.length > 0) {
        const aqi = data.list[0].main.aqi;

        let aqiCategory = "";
        let aqiColor = "";

        if (aqi === 1) {
          aqiCategory = "Good";
          aqiColor = "green";
        } else if (aqi === 2) {
          aqiCategory = "Moderate";
          aqiColor = "orange";
        } else {
          aqiCategory = "Unhealthy";
          aqiColor = "red";
        }

        setAqiData({ aqi, category: aqiCategory, color: aqiColor });
      }
    } catch (error) {
      console.error("Error fetching AQI data:", error);
    }
  };

  useEffect(() => {
    search();
  }, [search]);

  return (
    <div className="Weather">
      <div className="Search-Bar">
        <input ref={inputRef}
          type="text" 
          placeholder="Enter city name..." 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
        />
        <img src={Search_Icon} alt="Search Icon" onClick={() => search(inputRef.current.value)} />
      </div>

      {weatherdata ? (
        <>
          <img src={weatherdata.icon} alt="Weather Icon" className="Weather-Icon" />
          <p className="Temperature">{weatherdata.temperature} ℃</p>
          <p className="Location">{weatherdata.location}</p>

          <div className="Weather-Data">
            <div className="col1">
              <img src={Humidity_Icon} alt="Humidity Icon" />
              <p>{weatherdata.humidity} %</p>
              <span>Humidity</span>
            </div>

            <div className="col2">
              <img src={WindSpeed_Icon} alt="Wind Speed Icon" />
              <p>{weatherdata.windspeed} km/h</p>
              <span>Wind Speed</span>
            </div>

            <div className="col3">
              <img src={AirPressure_Icon} alt="Air Pressure Icon" />
              <p>{weatherdata.pressure} mb</p>
              <span>Air Pressure</span>
            </div>

            <div className="col4">
              <img src={Visibility_Icon} alt="Visibility Icon" />
              <p>{weatherdata.visibility} km</p>
              <span>Visibility</span>
            </div>

            {/* Air Quality Section */}
            {aqiData && (
              <div className="col5">
                <img 
                  src={aqiData.aqi === 1 ? AQ_Good : aqiData.aqi === 2 ? AQ_Moderate : AQ_Unhealthy} 
                  alt="Air Quality Icon" 
                  style={{ width: "40px", height: "40px" }} 
                />
                <p style={{ color: aqiData.color, fontWeight: "bold" }}>{aqiData.category}</p>
                <span>Air Quality</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>City not found</p>
      )}
    </div>
  );
};

export default Weather;
