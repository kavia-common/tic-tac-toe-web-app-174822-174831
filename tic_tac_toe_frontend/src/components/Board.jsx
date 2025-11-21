import React from 'react';
import Square from './Square';

/**
 * Board component renders a 3x3 grid of Square buttons.
 * It handles click events via onPlay and honors gameOver state to disable further moves.
 */

// PUBLIC_INTERFACE
export default function Board({ squares, onPlay, xIsNext, gameOver, winningLine }) {
  /** Renders a single square. */
  const renderSquare = (i) => {
    const value = squares[i];
    const isWinning = Array.isArray(winningLine) ? winningLine.includes(i) : false;

    return (
      <Square
        key={i}
        value={value}
        onClick={() => handleClick(i)}
        disabled={gameOver || Boolean(value)}
        isWinning={isWinning}
        index={i}
      />
    );
  };

  const handleClick = (i) => {
    if (gameOver || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares, i);
  };

  return (
    <div className="board" role="grid" aria-label="Game board" aria-disabled={gameOver}>
      <div className="board-row" role="row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row" role="row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row" role="row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}
