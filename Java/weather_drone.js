document.addEventListener("DOMContentLoaded", function () {
    fetch("/readings/data.txt")
        .then(response => response.text())
        .then(data => {
            const sensorData = parseData(data);
            updateWeather(sensorData);
        })
        .catch(error => console.error("Error loading sensor data:", error));
});

// Function to parse the text file and compute averages
function parseData(text) {
    let lines = text.split("\n");
    let dataMap = {}; // Object to store sensor readings
    let countMap = {}; // Object to count occurrences for averaging

    lines.forEach(line => {
        let [key, value] = line.split(":");
        if (key && value) {
            key = key.trim().toLowerCase();
            let numValue = parseFloat(value.trim());

            if (!isNaN(numValue)) {
                if (!dataMap[key]) {
                    dataMap[key] = 0;
                    countMap[key] = 0;
                }
                dataMap[key] += numValue;
                countMap[key] += 1;
            }
        }
    });

    // Compute averages and return the object
    let averagedData = {};
    for (let key in dataMap) {
        averagedData[key] = (dataMap[key] / countMap[key]).toFixed(1); // Average value rounded to 1 decimal place
    }

    return averagedData;
}

// Function to update the webpage with the sensor data
function updateWeather(sensorData) {
    document.getElementById("temperature").textContent = sensorData.temperature || "0";
    updateWeatherImage(sensorData.temperature);

    document.getElementById("humidity").textContent = `${sensorData.humidity || "0"}% (${getHumidityStatus(sensorData.humidity)})`;
    updateHumidityImage(sensorData.humidity);

    document.getElementById("pressure").textContent = `${sensorData.pressure || "0"} hPa (${getPressureStatus(sensorData.pressure)})`;

    document.getElementById("uv").textContent = `${sensorData.uv || "0"} Index (${getuvStatus(sensorData.uv)})`;
    updateUVImage(sensorData.uv);
}

// Function to update the weather image based on temperature
function updateWeatherImage(temperature) {
    let tempValue = parseInt(temperature);  // Convert temperature string to number
    let imageElement = document.getElementById("weather-image");
    let imagePath = "";

    if (tempValue < 0) {
        imagePath = "/temp_images/snow.png"; // Below 0°C - Snow
    } else if (tempValue >= 0 && tempValue < 10) {
        imagePath = "/temp_images/chilly.png"; // 0-10°C - Chilly
    } else if (tempValue >= 10 && tempValue < 25) {
        imagePath = "/temp_images/semi_cloudy.png"; // 10-25°C - Mild Weather
    } else {
        imagePath = "/temp_images/sunny.png"; // Above 25°C - Hot/Sunny
    }

    // Update the image source and make it visible
    imageElement.src = imagePath;
    imageElement.style.display = "block"; // Ensure the image is displayed
}

// Helper functions to determine humidity, pressure and UV status
function getHumidityStatus(humidity) {
    let value = parseInt(humidity);
    if (value < 30) return "Low";
    if (value < 60) return "Moderate";
    return "High";
}

// Function to update the HUMIDITY image based on humidity
function updateHumidityImage(humidity) {
    let humValue = parseInt(humidity);  // Convert humidity string to number
    let imageElementH = document.getElementById("humidity-image");
    let imagePathH = "";

    if (humValue < 30) {                            
        imagePathH = "/hum_images/low_humidity.png"; // below 30% is low humidity
    } else if (humValue >= 30 && humValue < 40) {
        imagePathH = "/hum_images/midlow_humidity.png"; // between 30% - 40% is midlow humidity
    } else if (humValue >= 40 && humValue < 50) {
        imagePathH = "/hum_images/moderate_humidity.png"; // between 40% - 50% is moderate humidity
    } else if (humValue >= 50 && humValue < 60) {
        imagePathH = "/hum_images/midhigh_humidity.png"; // between 50% - 60% is midhigh humidity
    } else {
        imagePathH = "/hum_images/high_humidity.png"; // above 60% is high humidity
    }

    // Update the image source and make it visible
    imageElementH.src = imagePathH;
    imageElementH.style.display = "block"; // Ensure the image is displayed
}

function getPressureStatus(pressure) {
    let value = parseInt(pressure);
    if (value < 1000) return "Low";
    if (value < 1020) return "Moderate";
    return "High";
}

function getuvStatus(uv) {
    let value = parseInt(uv);
    if (value < 3) return "Low";
    if (value < 5) return "Moderate";
    if (value < 7) return "High";
    if (value < 10) return "Very High"
    return "Extreme";
}

// Function to update the UV image based on UV
function updateUVImage(uv) {
    let uvValue = parseInt(uv);  // Convert uv string to number
    let imageElementUV = document.getElementById("uv-image");
    let imagePathUV = "";

    if (uvValue < 3) {                            
        imagePathUV = "/uv_images/low_uv.png"; // below 3 is low uv
    } else if (uvValue >= 3 && uvValue < 6) {
        imagePathUV = "/uv_images/mod_uv.png"; // between 3-5 is moderate uv
    } else if (uvValue >= 6 && uvValue < 8) {
        imagePathUV = "/uv_images/high_uv.png"; // between 6-7 is high uv
    } else if (uvValue >= 8 && uvValue < 11) {
        imagePathUV = "/uv_images/veryhigh_uv.png"; // between 8-10 is very high uv
    } else {
        imagePathUV = "/uv_images/extreme_uv.png"; // 11 and up is extreme uv
    }

    // Update the image source and make it visible
    imageElementUV.src = imagePathUV;
    imageElementUV.style.display = "block"; // Ensure the image is displayed
}

document.addEventListener("DOMContentLoaded", function () {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=33.6846&longitude=-117.8265&hourly=temperature_2m&timezone=auto")
        .then(response => response.json())
        .then(data => {
            const forecastContainer = document.querySelector(".forecast-container");
            const times = data.hourly.time;
            const temperatures = data.hourly.temperature_2m;

            // Get today's date in YYYY-MM-DD format (local time)
            const today = new Date().toISOString().split("T")[0];

            // Define the exact times we want to display (6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM, 12 AM)
            const targetHours = [6, 9, 12, 15, 18, 21, 3, 0];

            forecastContainer.innerHTML = ""; // Clear existing content

            for (let i = 0; i < times.length; i++) {
                const time = new Date(times[i]); // Convert to Date object
                const temperature = temperatures[i];

                // Convert to local time and extract the hour
                const localHour = time.toLocaleString("en-US", { hour12: false, hour: "2-digit", timeZone: "America/Los_Angeles" });
                const localDate = time.toLocaleString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Los_Angeles" }).split(",")[0];

                // Ensure it's today's forecast and at the correct hour
                if (localDate === today && targetHours.includes(parseInt(localHour))) {
                    const forecastItem = document.createElement("div");
                    forecastItem.className = "forecast-item";

                    const timeElement = document.createElement("p");
                    timeElement.className = "time";
                    timeElement.textContent = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: "America/Los_Angeles" });

                    const tempElement = document.createElement("p");
                    tempElement.className = "temp";
                    tempElement.textContent = `${temperature} ºC`;

                    // Determine the appropriate image based on temperature
                    const imgElement = document.createElement("img");
                    imgElement.className = "forecast-image";
                    if (temperature < 0) {
                        imgElement.src = "/temp_images/snow.png";
                        imgElement.alt = "Snow";
                    } else if (temperature >= 0 && temperature < 10) {
                        imgElement.src = "/temp_images/chilly.png";
                        imgElement.alt = "Chilly";
                    } else if (temperature >= 10 && temperature < 25) {
                        imgElement.src = "/temp_images/semi_cloudy.png";
                        imgElement.alt = "Mild Weather";
                    } else {
                        imgElement.src = "/temp_images/sunny.png";
                        imgElement.alt = "Hot/Sunny";
                    }

                    forecastItem.appendChild(timeElement);
                    forecastItem.appendChild(imgElement); // Add image between time and temperature
                    forecastItem.appendChild(tempElement);

                    forecastContainer.appendChild(forecastItem);
                }
            }
        })
        .catch(error => console.error("Error fetching weather data:", error));
});
