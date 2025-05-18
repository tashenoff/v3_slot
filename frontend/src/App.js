import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SlotGrid from './components/SlotGrid';
import BetSelector from './components/BetSelector';
import PayTable from './components/PayTable';

// Базовый URL API
const API_BASE_URL = 'http://127.0.0.1:5000';

const App = () => {
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState([]);
  const [wins, setWins] = useState([]); // Список выигрышных линий
  const [totalWin, setTotalWin] = useState(0); // Общий выигрыш
  const [balance, setBalance] = useState(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [paylines, setPaylines] = useState([]); // Информация о линиях выплат
  const [showPaytable, setShowPaytable] = useState(false); // Показывать ли таблицу выплат

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

    if (balance < bet) {
      alert('Недостаточно средств!');
      return;
    }
    
    setIsSpinning(true);
    setBalance(prevBalance => prevBalance - bet);
    setWins([]);
    setTotalWin(0);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/spin`, { bet });
      
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
      setBalance(prevBalance => prevBalance + bet);
      
      if (error.code === 'ERR_NETWORK') {
        setServerStatus('offline');
        alert('Произошла ошибка соединения с сервером. Проверьте, что сервер запущен и доступен.');
      }
    }
  };

  // Переключение отображения таблицы выплат
  const togglePaytable = () => {
    setShowPaytable(!showPaytable);
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
          <div>
            <p>Выберите ставку:</p>
            <BetSelector bet={bet} setBet={setBet} />
          </div>
          
          <button 
            className="spin-btn" 
            onClick={handleSpin} 
            disabled={isSpinning || balance < bet || serverStatus !== 'online'}
          >
            {isSpinning ? 'Вращение...' : serverStatus === 'checking' ? 'Подключение...' : 'Крутить!'}
          </button>
        </div>
        
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
      </div>
    </div>
  );
};

export default App; 