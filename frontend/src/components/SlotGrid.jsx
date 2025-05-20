import React from 'react';

const SlotGrid = ({ grid, winningLines = [] }) => {
  // Вспомогательная функция для проверки, является ли ячейка частью выигрышной линии
  const isWinningCell = (rowIndex, colIndex) => {
    return winningLines.some(line => {
      return line.positions.some(([row, col]) => row === rowIndex && col === colIndex);
    });
  };

  // Получаем индекс линии для ячейки (для применения разного цвета)
  const getLineIndex = (rowIndex, colIndex) => {
    for (const line of winningLines) {
      if (line.positions.some(([row, col]) => row === rowIndex && col === colIndex)) {
        return line.lineIndex % 5; // Модуль для ограничения количеством стилей
      }
    }
    return -1;
  };

  if (!grid || grid.length === 0) {
    return (
      <div className="grid">
        <div className="row">
          {[...Array(5)].map((_, colIndex) => (
            <div key={colIndex} className="cell">?</div>
          ))}
        </div>
        <div className="row">
          {[...Array(5)].map((_, colIndex) => (
            <div key={colIndex} className="cell">?</div>
          ))}
        </div>
        <div className="row">
          {[...Array(5)].map((_, colIndex) => (
            <div key={colIndex} className="cell">?</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((symbol, colIndex) => {
            const isWinning = isWinningCell(rowIndex, colIndex);
            const lineIndex = getLineIndex(rowIndex, colIndex);
            return (
              <div 
                key={colIndex} 
                className={`cell ${isWinning ? `highlighted line-${lineIndex}` : ''}`}
              >
                {symbol}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SlotGrid; 