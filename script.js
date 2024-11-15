const API_KEY = 'ed47316a45379e2221a75f813229fb46';
const LATITUDE = 31.534442;
const LONGITUDE = 48.724416;

async function getWeatherData() {
    try {
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric&lang=fa`
        );
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric&lang=fa`
        );
        const forecastData = await forecastResponse.json();

        if (currentResponse.ok && forecastResponse.ok) {
            updateCurrentWeather(currentData);
            updateForecast(forecastData);
            updateSunriseSunset(currentData);
        } else {
            throw new Error('خطا در دریافت اطلاعات آب و هوا');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector('.container').innerHTML = `
            <div style="text-align: center; color: red;">
                <h2>خطا در دریافت اطلاعات</h2>
                <p>لطفاً اتصال اینترنت خود را بررسی کنید</p>
            </div>
        `;
    }
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-showers-heavy',
        '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    return iconMap[iconCode] || 'fas fa-question';
}

function updateCurrentWeather(data) {
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('feels-like').textContent = Math.round(data.main.feels_like);
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind-speed').textContent = Math.round(data.wind.speed * 3.6);
    document.getElementById('pressure').textContent = data.main.pressure;
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1);
    
    const windDeg = data.wind.deg;
    document.getElementById('wind-deg').textContent = windDeg;
    const windArrow = document.getElementById('wind-direction');
    windArrow.style.transform = `rotate(${windDeg}deg)`;
    
    // Update weather icon using Font Awesome
    const iconCode = data.weather[0].icon;
    const iconElement = document.getElementById('weather-icon');
    iconElement.className = getWeatherIcon(iconCode);
    iconElement.style.fontSize = '4rem';
    iconElement.style.color = '#333';
}

function updateForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (excluding today)
    const dailyForecasts = [];
    const seenDates = new Set();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString();
        
        if (!seenDates.has(dateString) && date.getHours() >= 12 && date.getHours() <= 15) {
            seenDates.add(dateString);
            dailyForecasts.push(item);
        }
    });

    dailyForecasts.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('fa-IR', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const iconCode = day.weather[0].icon;

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <p class="day-name">${dayName}</p>
            <i class="${getWeatherIcon(iconCode)}" style="font-size: 2rem; color: #333;"></i>
            <p class="day-temp">${temp}°C</p>
            <p class="forecast-desc">${day.weather[0].description}</p>
        `;
        forecastContainer.appendChild(forecastDay);
    });
}

function updateSunriseSunset(data) {
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
}

function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = 
        now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Initial calls
getWeatherData();
updateTime();

// Update intervals
setInterval(getWeatherData, 300000); // Every 5 minutes
setInterval(updateTime, 1000); // Every second