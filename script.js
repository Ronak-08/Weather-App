// app.js
const apiKey = '93882fcb3545a9c1fe878a3350267e00';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const description = document.getElementById('description');
const clouds = document.getElementById('clouds');
const temperature = document.getElementById('temperature');
const minMax = document.getElementById('minMax');
const humidity = document.getElementById('humidity');
const aqi = document.getElementById('aqi');
const forecast = document.getElementById('forecast');
const hourlyForecast = document.getElementById('hourlyForecast');
const aqiBar = document.getElementById('aqi-bar'); // new element for AQI bar
const o3Value = document.getElementById('o3-value'); // new element for O3 value
const no2Value = document.getElementById('no2-value'); // new element for NO2 value
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const rain1h = document.getElementById('rain1h');


document.addEventListener('DOMContentLoaded', () => {
    const savedCity = localStorage.getItem('city');
    if (savedCity) {
        cityInput.value = savedCity;
        fetchWeather(savedCity);
    }
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeather(city);
        localStorage.setItem('city', city);
    }
});

async function fetchWeather(city) {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResponse.json();
        updateCurrentWeather(weatherData);

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);
updateHourlyForecast(forecastData);

        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`);
        const aqiData = await aqiResponse.json();
        updateAQI(aqiData);
        


    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
  
}

function updateCurrentWeather(data) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    description.textContent = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°`
    minMax.textContent = `Low: ${Math.round(data.main.temp_min)}° • High: ${Math.round(data.main.temp_max)}°`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    clouds.textContent = `Clouds: ${data.clouds.all}%`;
     pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
     visibility.textContent = `Visibility: ${data.visibility/1000} km`;
     const rain1 = data.rain ? data.rain['1h'] : 0;
     rain1h.textContent = `Rain (In Last Hour): ${rain1} mm/h`;
  
 
    const weatherCondition = data.weather[0].main;
   
    
    switch (weatherCondition) {
      case 'Clear':
        document.body.style.backgroundImage = 'url("images/clear.webp")';
        break;
      case 'Clouds':
        document.body.style.backgroundImage = 'url("images/cloudy.webp")';
        break;
      case 'Rain':
        document.body.style.backgroundImage = 'url("images/rainy.webp")';
        break;
      case 'Snow':
        document.body.style.backgroundImage = 'url("images/Snowy.webp")';
        break;
      case 'Thunderstorm':
        document.body.style.backgroundImage = 'url("images/Thunderstorm.webp")';
        break;
      default:
        document.body.style.backgroundImage = 'url("images/default.webp")';
    }
    
    
    
     // Update wind data
    const windSpeed = data.wind.speed;
    const windDirection = getWindDirection(data.wind.deg);
    const gustSpeed = data.wind.gust || 'N/A';
    
    document.getElementById('windSpeed').textContent = windSpeed;
    document.getElementById('windDirection').textContent = windDirection;
    document.getElementById('gustSpeed').textContent = gustSpeed;
    
  const arrow = document.getElementById('windArrow');
    arrow.style.transform = `rotate(${windDirection}deg)`;

// Assuming `data` contains the response from OpenWeather API

// Convert UTC sunrise and sunset times to local times directly from the API
const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

// Update the HTML elements with the times provided by the API
document.getElementById('sunriseTime').textContent = sunriseTime;
document.getElementById('sunsetTime').textContent = sunsetTime;

// Calculate the current time in UTC seconds
const currentTime = Math.floor(new Date().getTime() / 1000);

// Calculate the sun's position in degrees (0 to 360)
const sunPosition = ((currentTime - data.sys.sunrise) / (data.sys.sunset - data.sys.sunrise)) * 360;

// Calculate the daylight left percentage
const daylightLeftPercentage = Math.max(0, Math.min(100, ((data.sys.sunset - currentTime) / (data.sys.sunset - data.sys.sunrise)) * 100));

// Update the sun arc and daylight left text
const sunArc = document.getElementById('sun-arc');
sunArc.style.strokeDashoffset = 251.32 - (sunPosition / 360) * 251.32;

const daylightLeft = document.getElementById('daylight-left');
daylightLeft.textContent = `${Math.round(daylightLeftPercentage)}% daylight left`;

  
    
}

// Function to convert wind direction in degrees to cardinal directions
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degrees % 360) / 22.5);
    return directions[index % 16];
}

function getDayName(dateStr, index) {
    const date = new Date(dateStr);
    const options = { weekday: 'long' };
    const dayName = new Intl.DateTimeFormat('en-US', options).format(date);
    return index === 0 ? 'Today' : dayName;
}

function updateForecast(data) {
    forecast.innerHTML = '';
    const dailyData = data.list.filter(reading => reading.dt_txt.includes("12:00:00"));
    dailyData.forEach((day, index) => {
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <h4>${getDayName(day.dt_txt, index)}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon">
            
            <h5>${Math.round(day.main.temp_min)}°</h4>
            <p>/${Math.round(day.main.temp_max)}°</p>
    
        `;
    
        
        forecast.appendChild(forecastDay);
    });
}  
function updateHourlyForecast(data) {
    hourlyForecast.innerHTML = '';
    const hourlyData = data.list.slice(0, 8); // Next 24 hours (3-hour intervals)
    hourlyData.forEach((hour) => {
        const hourBlock = document.createElement('div');
        hourBlock.className = 'hour-block';
        hourBlock.innerHTML = `
            <p>${new Date(hour.dt_txt).getHours()}:00</p>
            <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="Weather Icon">
            <p>${Math.round(hour.main.temp)}°</p>
        `;
        hourlyForecast.appendChild(hourBlock);
    });
}


function updateAQI(data) {
  const aqValue = data.list[0].main.aqi;
  const o3ValueData = data.list[0].components.o3;
  const no2ValueData = data.list[0].components.no2;
  const nh3ValueData = data.list[0].components.nh3;
  const pm_25ValueData = data.list[0].components.pm2_5;

  aq.textContent = `${aqValue}`;
  o3Value.textContent = `O3: ${o3ValueData} μg/m³`;
  no2Value.textContent = `NO2: ${no2ValueData} μg/m³`;
  document.getElementById('nh3-value').textContent = `NH3: ${nh3ValueData} μg/m³`;
  document.getElementById('pm25-value').textContent = `PM 2.5: ${pm_25ValueData} μg/m³`;
  
  
  const aqiBar = document.getElementById('aqi-bar');
  const aqiLevel = aqValue;

  // Calculate the width percentage based on AQI value
  const widthPercentage = (aqValue / 5) * 100;
  aqiBar.style.width = `${widthPercentage}%`;

  // Set the color based on AQI level
  let aqiColor;
  switch (aqiLevel) {
    case 1:
      aqiColor = '#00e400';
      break;
    case 2:
      aqiColor = '#ffff00';
      break;
    case 3:
      aqiColor = '#ff7e00';
      break;
    case 4:
      aqiColor = '#ff0000';
      break;
    case 5:
      aqiColor = '#99004c';
      break;
    default:
      aqiColor = 'gray';
  }

  aqiBar.style.backgroundColor = aqiColor;

  
  
  
  
  const { category, healthImplications } = getAqiCategoryAndHealthImplications(aqValue);
  const aqiCategoryElement = document.getElementById('aqi-category-and-health-implications');
  aqiCategoryElement.innerHTML = `
    <strong>AQI Category:</strong> ${category}    
    <br>
    <strong>Health Implications:</strong> ${healthImplications}
  `;
}

function getAqiCategoryAndHealthImplications(aqiValue) {
  let category, healthImplications;

  if (aqiValue <= 1) {
    category = 'Good';
    healthImplications = 'Air quality is satisfactory, and air pollution poses little or no risk.';
  } else if (aqiValue <= 2) {
    category = 'Moderate';
    healthImplications = 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
  } else if (aqiValue <= 3) {
    category = 'Unhealthy for Sensitive Groups';
    healthImplications = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  } else if (aqiValue <= 4) {
    category = 'Unhealthy';
    healthImplications = 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
  } else {
    category = 'Very Unhealthy';
    healthImplications = 'Health alert: The risk of health effects is increased for everyone.';
  }

  return { category, healthImplications };
}

