import React from 'react';

const LineSelector = ({ activeLines, setActiveLines }) => {
  // Все доступные линии (индексы)
  const allLines = [0, 1, 2, 3, 4];
  
  // Названия линий для отображения
  const lineNames = [
    "Верхняя линия", 
    "Средняя линия", 
    "Нижняя линия", 
    "Диагональ ↘", 
    "Диагональ ↗"
  ];
  
  // Переключение одной линии
  const toggleLine = (lineIndex) => {
    if (activeLines.includes(lineIndex)) {
      // Нельзя отключить все линии
      if (activeLines.length > 1) {
        setActiveLines(activeLines.filter(idx => idx !== lineIndex));
      }
    } else {
      setActiveLines([...activeLines, lineIndex].sort());
    }
  };
  
  // Быстрые кнопки для предустановленных наборов линий
  const setAllLines = () => setActiveLines([...allLines]);
  const setCenterLine = () => setActiveLines([1]); // Только средняя линия
  const setHorizontalLines = () => setActiveLines([0, 1, 2]); // Только горизонтальные линии
  
  return (
    <div className="line-selector">
      <p>Активные линии:</p>
      
      <div className="line-buttons">
        {allLines.map((lineIndex) => (
          <button
            key={lineIndex}
            className={`line-btn ${activeLines.includes(lineIndex) ? 'active' : ''} line-${lineIndex}`}
            onClick={() => toggleLine(lineIndex)}
          >
            {lineIndex + 1}
          </button>
        ))}
      </div>
      
      <div className="line-presets">
        <button className="preset-btn" onClick={setCenterLine}>
          Средняя
        </button>
        <button className="preset-btn" onClick={setHorizontalLines}>
          Горизонтали
        </button>
        <button className="preset-btn" onClick={setAllLines}>
          Все
        </button>
      </div>
      
      <div className="lines-info">
        <div className="lines-count">
          Выбрано линий: <strong>{activeLines.length}</strong>
        </div>
        <div className="lines-names">
          {activeLines.map(idx => (
            <div key={idx} className={`line-name line-${idx}`}>
              {lineNames[idx]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LineSelector; 