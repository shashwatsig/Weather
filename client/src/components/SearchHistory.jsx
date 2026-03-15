export default function SearchHistory({ history, onHistoryClick }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-container">
      <h3 className="history-title">Recent Searches</h3>
      <div className="history-list">
        {history.map((item, index) => (
          <button 
            key={item._id || index} 
            className="history-item"
            onClick={() => onHistoryClick(item.city)}
            type="button"
          >
            <span className="history-city">{item.city}</span>
            <span className="history-temp">{Math.round(item.temperature)}°</span>
          </button>
        ))}
      </div>
    </div>
  );
}
