export default function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <section className="weather-card visible">
      <div className="weather-main">
        <div className="weather-info">
          <h2>{weather.city}{weather.country ? `, ${weather.country}` : ''}</h2>
          <p>{weather.condition}</p>
        </div>
        <div className="weather-temp">
          <h1>{Math.round(weather.temperature)}°</h1>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Feels Like</span>
          <span className="detail-value">{Math.round(weather.feelsLike)}°</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{weather.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind</span>
          <span className="detail-value">{weather.windSpeed} km/h</span>
        </div>
      </div>
    </section>
  );
}
