import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const PayTable = ({ bet }) => {
  const [paytable, setPaytable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaytable = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/paytable`);
        setPaytable(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки таблицы выплат:', err);
        setError('Не удалось загрузить таблицу выплат');
        setIsLoading(false);
      }
    };

    fetchPaytable();
  }, []);

  // Группируем выплаты по символам для более наглядного отображения
  const groupedPayouts = () => {
    if (!paytable) return {};
    
    const grouped = {};
    
    paytable.payouts.forEach(payout => {
      // Определяем символ (первый не-звездочный символ в шаблоне)
      const symbol = payout.pattern.find(s => s !== '*') || '*';
      
      // Определяем количество символов в комбинации (без учета звездочек)
      const symbolCount = payout.pattern.filter(s => s === symbol).length;
      
      if (!grouped[symbol]) {
        grouped[symbol] = [];
      }
      
      grouped[symbol].push({
        pattern: payout.pattern,
        payout: payout.payout,
        count: symbolCount,
        actualPayout: (payout.payout * bet) / 10 // Расчет выплаты с учетом ставки
      });
    });
    
    // Сортируем группы по количеству символов от большего к меньшему
    Object.keys(grouped).forEach(symbol => {
      grouped[symbol].sort((a, b) => b.count - a.count || b.payout - a.payout);
    });
    
    return grouped;
  };

  const formatPattern = (pattern) => {
    return pattern.map(s => s === '*' ? '-' : s).join(' ');
  };

  if (isLoading) return <div className="paytable-loading">Загрузка таблицы выплат...</div>;
  if (error) return <div className="paytable-error">{error}</div>;

  const groups = groupedPayouts();

  return (
    <div className="paytable">
      <h3>Таблица выплат (ставка: {bet})</h3>
      
      <div className="paytable-grid">
        {Object.keys(groups).sort().map(symbol => (
          <div key={symbol} className="paytable-group">
            <h4 className="symbol-header">Символ {symbol}</h4>
            <div className="paytable-items">
              {groups[symbol].map((item, index) => (
                <div key={index} className="paytable-item">
                  <div className="pattern">{formatPattern(item.pattern)}</div>
                  <div className="payout">{item.actualPayout}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayTable; 