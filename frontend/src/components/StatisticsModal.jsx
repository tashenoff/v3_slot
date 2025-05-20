import React from 'react';

const StatisticsModal = ({ stats, onClose }) => {
  if (!stats) return null;

  // Названия линий для отображения
  const lineNames = [
    "Верхняя горизонталь", 
    "Средняя горизонталь", 
    "Нижняя горизонталь", 
    "Диагональ ↘", 
    "Диагональ ↗"
  ];

  return (
    <div className="statistics-modal-overlay">
      <div className="statistics-modal">
        <div className="statistics-header">
          <h2>Статистика автоспинов</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="statistics-content">
          <div className="stats-section active-lines-stats">
            <h3>Активные линии для анализа</h3>
            <div className="active-lines-list">
              {stats.active_lines.map(lineIndex => (
                <div key={lineIndex} className={`line-name line-${lineIndex}`}>
                  {lineNames[lineIndex]}
                </div>
              ))}
            </div>
            <div className="stats-item">
              <div className="stats-label">Всего активных линий:</div>
              <div className="stats-value">{stats.lines_count}</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Ставка на линию:</div>
              <div className="stats-value">{stats.bet}</div>
            </div>
            <div className="stats-item">
              <div className="stats-label">Ставка за спин:</div>
              <div className="stats-value">{stats.bet_per_spin}</div>
            </div>
          </div>
          
          <div className="stats-section main-stats">
            <h3>Основные показатели</h3>
            <div className="stats-grid">
              <div className="stats-item">
                <div className="stats-label">Общее количество спинов:</div>
                <div className="stats-value">{stats.spins.toLocaleString()}</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">Ставка:</div>
                <div className="stats-value">{stats.bet}</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">Общая сумма ставок:</div>
                <div className="stats-value">{stats.total_bet.toLocaleString()}</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">Общий выигрыш:</div>
                <div className="stats-value highlight">{stats.total_win.toLocaleString()}</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">RTP:</div>
                <div className="stats-value highlight">{stats.rtp.toFixed(2)}%</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">Количество выигрышей:</div>
                <div className="stats-value">{stats.win_count.toLocaleString()}</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">Частота выигрышей:</div>
                <div className="stats-value">{stats.win_rate.toFixed(2)}%</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">Время выполнения:</div>
                <div className="stats-value">{stats.duration_seconds.toFixed(2)} сек.</div>
              </div>
            </div>
          </div>
          
          <div className="stats-section">
            <h3>Выигрыши по линиям</h3>
            <div className="line-stats">
              {stats.win_by_lines.map((lineStats, index) => (
                <div key={index} className="line-stat-item">
                  <div className="line-name">{lineStats.line_name}</div>
                  <div className="line-wins">{lineStats.wins}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="stats-section">
            <h3>Лучшие комбинации</h3>
            <div className="patterns-stats">
              {stats.top_patterns.length > 0 ? (
                stats.top_patterns.map((pattern, index) => (
                  <div key={index} className="pattern-item">
                    <div className="pattern-visual">
                      {pattern.pattern.split("").map((symbol, i) => (
                        <span key={i} className="pattern-symbol">{symbol}</span>
                      ))}
                    </div>
                    <div className="pattern-count">{pattern.count} ({pattern.percentage.toFixed(1)}%)</div>
                  </div>
                ))
              ) : (
                <div className="no-data">Нет данных о выигрышных комбинациях</div>
              )}
            </div>
          </div>
          
          <div className="stats-section">
            <h3>Лучшие выигрыши по символам</h3>
            <div className="symbol-stats">
              {stats.top_wins_by_symbol.map((symbolStats, index) => (
                <div key={index} className="symbol-item">
                  <div className="symbol-pattern">
                    {symbolStats.pattern.map((s, i) => (
                      <span key={i} className="symbol">{s === '*' ? '-' : s}</span>
                    ))}
                  </div>
                  <div className="symbol-stats-detail">
                    <div className="symbol-count">Количество: {symbolStats.count}</div>
                    <div className="symbol-win">Выигрыш: {symbolStats.total_win.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal; 