import React from 'react';

const BetSelector = ({ bet, setBet }) => {
  const bets = [10, 50, 100];
  
  return (
    <div className="bet-controls">
      {bets.map((value) => (
        <button
          key={value}
          className={`bet-btn ${bet === value ? 'selected' : ''}`}
          onClick={() => setBet(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
};

export default BetSelector; 