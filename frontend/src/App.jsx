import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SlotGrid from './components/SlotGrid';
import BetSelector from './components/BetSelector';
import LineSelector from './components/LineSelector';
import PayTable from './components/PayTable';
import StatisticsModal from './components/StatisticsModal';
import LoadingSpinner from './components/LoadingSpinner';

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:5000';

const App = () => {
  const [bet, setBet] = useState(10);
  const [activeLines, setActiveLines] = useState([0, 1, 2, 3, 4]); // По умолчанию все линии активны
  const [grid, setGrid] = useState([]);
  const [wins, setWins] = useState([]); // Список выигрышных линий
  const [totalWin, setTotalWin] = useState(0); // Общий выигрыш
  const [totalBet, setTotalBet] = useState(bet * activeLines.length); // Общая ставка (ставка * кол-во линий)
  const [balance, setBalance] = useState(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [paylines, setPaylines] = useState([]); // Информация о линиях выплат
  const [showPaytable, setShowPaytable] = useState(false); // Показывать ли таблицу выплат
  
  // Состояния для автоспинов
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [autoSpinStats, setAutoSpinStats] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);

  // Обновляем общую ставку при изменении ставки или активных линий
  useEffect(() => {
    const newTotalBet = bet * activeLines.length;
    setTotalBet(newTotalBet);
  }, [bet, activeLines]);

  // Проверяем доступность сервера при загрузке и получаем информацию о линиях выплат
  useEffect(() => {
    const checkServerAndGetPaylines = async () => {
      try {
        await axios.get(`${API_BASE_URL}/test`);
        setServerStatus('online');
        console.log('Сервер доступен');
        
        // Загружаем информацию о линиях выплат
        try {
          const paylinesResponse = await axios.get(`${API_BASE_URL}/paylines`);
          setPaylines(paylinesResponse.data.paylines);
          console.log('Загружены линии выплат:', paylinesResponse.data.paylines);
        } catch (error) {
          console.error('Ошибка загрузки линий выплат:', error);
        }
        
      } catch (error) {
        setServerStatus('offline');
        console.error('Сервер недоступен:', error);
      }
    };

    checkServerAndGetPaylines();
  }, []);

  const handleSpin = async () => {
    if (serverStatus !== 'online') {
      alert('Сервер недоступен. Пожалуйста, попробуйте позже.');
      return;
    }

    if (balance < totalBet) {
      alert('Недостаточно средств!');
      return;
    }
    
    setIsSpinning(true);
    setBalance(prevBalance => prevBalance - totalBet);
    setWins([]);
    setTotalWin(0);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/spin`, { 
        bet, 
        active_lines: activeLines 
      });
      
      // Добавляем небольшую задержку для эффекта вращения
      setTimeout(() => {
        const { grid, wins, total_win } = response.data;
        
        setGrid(grid);
        setWins(wins);
        setTotalWin(total_win);
        
        if (total_win > 0) {
          setBalance(prevBalance => prevBalance + total_win);
        }
        
        setIsSpinning(false);
      }, 500);
    } catch (error) {
      console.error('Ошибка запроса:', error);
      setIsSpinning(false);
      // Возвращаем ставку в случае ошибки
      setBalance(prevBalance => prevBalance + totalBet);
      
      if (error.code === 'ERR_NETWORK') {
        setServerStatus('offline');
        alert('Произошла ошибка соединения с сервером. Проверьте, что сервер запущен и доступен.');
      }
    }
  };

  // Запуск автоспинов
  const handleAutoSpin = async () => {
    if (serverStatus !== 'online') {
      alert('Сервер недоступен. Пожалуйста, попробуйте позже.');
      return;
    }

    if (balance < totalBet) {
      alert('Недостаточно средств!');
      return;
    }
    
    setIsAutoSpinning(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auto_spin`, { 
        count: 1000, // Количество автоспинов
        bet,
        active_lines: activeLines
      });
      
      setAutoSpinStats(response.data);
      
      // Обновляем баланс после автоспинов
      setBalance(prevBalance => prevBalance - response.data.total_bet + response.data.total_win);
      
      // Показываем статистику
      setShowStatistics(true);
      setIsAutoSpinning(false);
    } catch (error) {
      console.error('Ошибка автоспинов:', error);
      setIsAutoSpinning(false);
      
      if (error.code === 'ERR_NETWORK') {
        setServerStatus('offline');
        alert('Произошла ошибка соединения с сервером. Проверьте, что сервер запущен и доступен.');
      } else {
        alert('Произошла ошибка при выполнении автоспинов. Пожалуйста, попробуйте снова.');
      }
    }
  };

  // Переключение отображения таблицы выплат
  const togglePaytable = () => {
    setShowPaytable(!showPaytable);
  };

  // Закрыть модальное окно статистики
  const closeStatistics = () => {
    setShowStatistics(false);
  };

  return (
    <div className="container">
      <h1>Слот-машина</h1>
      
      {serverStatus === 'offline' && (
        <div className="server-error">
          ⚠️ Сервер недоступен. Проверьте, что бэкенд запущен на http://127.0.0.1:5000
        </div>
      )}
      
      <div className="slot-machine">
        <SlotGrid 
          grid={grid} 
          winningLines={wins.map(win => ({ 
            positions: win.positions,
            lineIndex: win.line_index
          }))}
        />
        
        <div className="controls">
          <div className="bet-section">
            <p>Выберите ставку:</p>
            <BetSelector bet={bet} setBet={setBet} />
            
            <LineSelector activeLines={activeLines} setActiveLines={setActiveLines} />
            
            <div className="bet-info">
              <div className="bet-per-line">
                <div className="bet-label">Ставка на линию</div>
                <div className="bet-value">{bet}</div>
              </div>
              <div className="total-bet">
                <div className="bet-label">Общая ставка</div>
                <div className="bet-value">{totalBet}</div>
              </div>
            </div>
          </div>
          
          <button 
            className="spin-btn" 
            onClick={handleSpin} 
            disabled={isSpinning || isAutoSpinning || balance < totalBet || serverStatus !== 'online'}
          >
            {isSpinning ? 'Вращение...' : serverStatus === 'checking' ? 'Подключение...' : 'Крутить!'}
          </button>
          
          <button 
            className="auto-spin-btn" 
            onClick={handleAutoSpin} 
            disabled={isSpinning || isAutoSpinning || balance < totalBet || serverStatus !== 'online'}
          >
            {isAutoSpinning ? 'Выполняется...' : '1000 автоспинов'}
          </button>
        </div>
        
        {isAutoSpinning && (
          <LoadingSpinner message="Выполняются автоспины..." />
        )}
        
        {wins.length > 0 && (
          <div className="wins-container">
            <div className="win-message">
              Вы выиграли {totalWin}!
            </div>
            <div className="win-details">
              {wins.map((win, index) => (
                <div key={index} className="win-line">
                  <span className="win-line-name">{win.line_name}</span>: {win.amount}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="balance">
          Баланс: {balance}
        </div>
        
        <button 
          className="paytable-toggle" 
          onClick={togglePaytable}
        >
          {showPaytable ? 'Скрыть таблицу выплат' : 'Показать таблицу выплат'}
        </button>
        
        {showPaytable && <PayTable bet={bet} />}
        
        {showStatistics && autoSpinStats && (
          <StatisticsModal stats={autoSpinStats} onClose={closeStatistics} />
        )}
      </div>
    </div>
  );
};

export default App; 