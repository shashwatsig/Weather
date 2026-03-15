const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const Search = require('./models/Search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/weather-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Main weather API endpoint
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    try {
        // 1. Get Coordinates from Open-Meteo Geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoResponse = await axios.get(geoUrl);

        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }

        const location = geoResponse.data.results[0];
        const { latitude, longitude, name, country } = location;

        // 2. Get Weather from Open-Meteo Weather API
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;
        const weatherResponse = await axios.get(weatherUrl);
        const current = weatherResponse.data.current;

        // Weather codes mapping based on WMO standards (simplified)
        const getWeatherCondition = (code, isDay) => {
            if (code === 0) return isDay ? 'Clear sky' : 'Clear night';
            if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
            if (code === 45 || code === 48) return 'Foggy';
            if (code >= 51 && code <= 55) return 'Drizzle';
            if (code >= 61 && code <= 65) return 'Rain';
            if (code >= 71 && code <= 77) return 'Snow';
            if (code >= 80 && code <= 82) return 'Rain showers';
            if (code >= 95) return 'Thunderstorm';
            return 'Unknown';
        };

        const condition = getWeatherCondition(current.weather_code, current.is_day);

        // Save to search history asynchronously
        try {
            const newSearch = new Search({
                city: name,
                country: country,
                temperature: current.temperature_2m,
                condition: condition
            });
            await newSearch.save();
        } catch (dbError) {
            console.error('Failed to save search history to DB:', dbError.message);
        }

        // Send back consolidated data
        res.json({
            city: name,
            country: country,
            temperature: current.temperature_2m,
            feelsLike: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            condition: condition,
            isDay: current.is_day === 1,
            weatherCode: current.weather_code
        });

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// History endpoint
app.get('/api/history', async (req, res) => {
    try {
        const history = await Search.find().sort({ createdAt: -1 }).limit(10);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
});

// Clear history endpoint (optional, easy cleanup)
app.delete('/api/history', async (req, res) => {
    try {
        await Search.deleteMany({});
        res.json({ message: 'History cleared' });
    } catch (error) {
        console.error('Error clearing history:', error.message);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

// The "catchall" handler: for any request that doesn't match an API route, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
