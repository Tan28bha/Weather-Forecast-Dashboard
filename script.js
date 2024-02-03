// script.js

// Weather object containing various methods
let weather = {
  apiKey: "651f7aad8ca3d1e2fa31cfcbf29ad4cc",

  // Fetches weather data and forecast for a given city and unit
  fetchWeather: function (city, unit = "metric") {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${this.apiKey}`)
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data));

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${this.apiKey}`)
      .then((response) => {
        if (!response.ok) {
          alert("No forecast found.");
          throw new Error("No forecast found.");
        }
        return response.json();
      })
      .then((data) => this.displayForecast(data.list));
  },

  // Toggles temperature unit (Celsius/Fahrenheit) and fetches weather data
  toggleUnit: function () {
    const unitToggle = document.querySelector(".unit-toggle");
    const selectedUnit = unitToggle.querySelector("input[name='unit']:checked").value;
    this.fetchWeather("Bangalore", selectedUnit);
  },

  // Displays current weather data on the webpage
  displayWeather: function (data) {
    const { name, sys } = data;
    const { icon, description } = data.weather[0];
    const { temp, temp_min, temp_max, humidity } = data.main;
    const unitToggle = document.querySelector(".unit-toggle");
    const selectedUnit = unitToggle.querySelector("input[name='unit']:checked").value;
    const unitSymbol = selectedUnit === "metric" ? "°C" : "°F";
    const { speed } = data.wind;
    const windSpeedUnit = selectedUnit === "metric" ? "m/s" : "mph";
    document.querySelector(".wind").innerText = `Wind speed: ${speed} ${windSpeedUnit}`;

    // Updating HTML elements with weather data
    document.querySelector(".city").innerText = `${name} (${sys.country})`;
    document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = `Temperature: ${temp} ${unitSymbol}`;
    document.querySelector(".temp-min").innerText = `Min Temp: ${temp_min} ${unitSymbol}`;
    document.querySelector(".temp-max").innerText = `Max Temp: ${temp_max} ${unitSymbol}`;
    document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
    document.querySelector(".weather-data").classList.remove("loading");
    document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${name}')`;
  },

  // Displays forecast data on the webpage
  displayForecast: function (forecastData) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    const uniqueDates = this.getUniqueDates(forecastData);
    const unitToggle = document.querySelector(".unit-toggle");
    const selectedUnit = unitToggle.querySelector("input[name='unit']:checked").value;
    const unitSymbol = selectedUnit === "metric" ? "°C" : "°F";

    // Loop through unique dates and display forecast for each date
    uniqueDates.slice(0, 5).forEach((formattedDate) => {
      const relevantForecast = forecastData.find((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const options = { weekday: "short", month: "short", day: "numeric" };
        const forecastFormattedDate = date.toLocaleDateString("en-US", options);
        return forecastFormattedDate === formattedDate;
      });

      if (relevantForecast) {
        const avgTemp = relevantForecast.main.temp;
        const { description, icon } = relevantForecast.weather[0];

        // Creating forecast card and appending to the forecast container
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-day";
        forecastCard.innerHTML = `
          <div>${formattedDate}</div>
          <div>Avg Temp: ${avgTemp} ${unitSymbol}</div>
          <div>${description}</div>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" />
        `;

        forecastContainer.appendChild(forecastCard);
      }
    });
  },

  // Extracts unique dates from forecast data
  getUniqueDates: function (forecastData) {
    const uniqueDates = new Set();
    forecastData.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const options = { weekday: "short", month: "short", day: "numeric" };
      const formattedDate = date.toLocaleDateString("en-US", options);
      uniqueDates.add(formattedDate);
    });
    return Array.from(uniqueDates);
  },

  // Gets user's location and fetches weather data based on the location
  getLocation: function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  },

  // Callback for successful geolocation
  geoSuccess: function (position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Fetch weather data and forecast for the user's location
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.apiKey}`)
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data));

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.apiKey}`)
      .then((response) => {
        if (!response.ok) {
          alert("No forecast found.");
          throw new Error("No forecast found.");
        }
        return response.json();
      })
      .then((data) => this.displayForecast(data.list));
  },

  // Callback for geolocation error
  geoError: function (error) {
    console.error(`Error getting location: ${error.message}`);
  },
};

// Event listeners for user interactions
document.querySelector(".search-btn").addEventListener("click", function () {
  weather.fetchWeather(document.querySelector(".search-bar").value);
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    weather.fetchWeather(document.querySelector(".search-bar").value);
  }
});

document.querySelector(".location-btn").addEventListener("click", function () {
  weather.getLocation();
});

// Initial fetch for a default city
weather.fetchWeather("Bangalore")
