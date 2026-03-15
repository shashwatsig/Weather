import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import './history.css';

import BackgroundMesh from './components/BackgroundMesh';
import Header from './components/Header';
import WeatherCard from './components/WeatherCard';
import Loader from './components/Loader';
import SearchHistory from './components/SearchHistory';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Fetch history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      const response = await axios.get(`http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`);
      setWeatherData(response.data);
      adjustBackground(response.data.condition, response.data.isDay);
      // Refresh history after a successful search
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const adjustBackground = (condition, isDay) => {
    const root = document.documentElement;
    let color1, color2, color3;

    if (!isDay) {
        color1 = '#312e81'; 
        color2 = '#1e1b4b'; 
        color3 = '#0f172a'; 
    } else {
        const cond = condition.toLowerCase();
        if (cond.includes('clear')) {
            color1 = '#38bdf8'; 
            color2 = '#fcd34d'; 
            color3 = '#818cf8'; 
        } else if (cond.includes('cloud') || cond.includes('fog')) {
            color1 = '#94a3b8'; 
            color2 = '#cbd5e1'; 
            color3 = '#64748b'; 
        } else if (cond.includes('rain') || cond.includes('drizzle')) {
            color1 = '#3b82f6'; 
            color2 = '#1e3a8a'; 
            color3 = '#64748b'; 
        } else if (cond.includes('thunder')) {
            color1 = '#4c1d95'; 
            color2 = '#1e1b4b'; 
            color3 = '#f59e0b'; 
        } else {
            color1 = '#3b82f6';
            color2 = '#8b5cf6';
            color3 = '#10b981';
        }
    }

    root.style.setProperty('--accent-1', color1);
    root.style.setProperty('--accent-2', color2);
    root.style.setProperty('--accent-3', color3);
  };

  return (
    <>
      <BackgroundMesh />
      <main className="container">
        <Header onSearch={fetchWeather} error={error} />
        
        {loading && <Loader />}
        
        {weatherData && !loading && (
          <WeatherCard weather={weatherData} />
        )}

        {!loading && history.length > 0 && (
          <SearchHistory history={history} onHistoryClick={fetchWeather} />
        )}
      </main>
    </>
  );
}

export default App;
