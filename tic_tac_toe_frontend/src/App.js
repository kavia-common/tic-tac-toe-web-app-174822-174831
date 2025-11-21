import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Board from './components/Board';

// PUBLIC_INTERFACE
function App() {
  /**
   * This is the main Tic Tac Toe application entrypoint.
   * - Renders a centered layout with gradient background per Ocean Professional theme
   * - Hosts game state and passes props to Board
   * - Provides Reset control and optional move history toggle
   * This app is fully client-side and does not rely on any backend or environment variables.
   */
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentStep, setCurrentStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const currentSquares = history[currentStep];

  // Apply a data-theme attribute for potential theming (not required for functionality)
  const theme = 'light';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const winnerInfo = useMemo(() => calculateWinner(currentSquares), [currentSquares]);
  const isDraw = useMemo(
    () => !winnerInfo.winner && currentSquares.every((s) => s !== null),
    [winnerInfo.winner, currentSquares]
  );

  // PUBLIC_INTERFACE
  const handlePlay = (nextSquares, moveIndex) => {
    /**
     * Handles a move:
     * - Truncates history if time-travelled
     * - Adds new board state
     * - Advances step and toggles player
     */
    if (winnerInfo.winner || isDraw) return; // prevent play after game end
    const nextHistory = history.slice(0, currentStep + 1);
    setHistory([...nextHistory, nextSquares]);
    setCurrentStep(nextHistory.length);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const jumpTo = (step) => {
    /**
     * Jumps to a specific step in the game history (time travel).
     */
    setCurrentStep(step);
    setXIsNext(step % 2 === 0);
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    /**
     * Resets the game to the initial state.
     */
    setHistory([Array(9).fill(null)]);
    setCurrentStep(0);
    setXIsNext(true);
  };

  const status = winnerInfo.winner
    ? `Winner: ${winnerInfo.winner}`
    : isDraw
    ? 'Draw! No moves left.'
    : `Next Player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="App ocean-bg">
      <header className="app-header">
        <h1 className="app-title" aria-label="Tic Tac Toe">Tic Tac Toe</h1>
        <p className="app-subtitle">Ocean Professional</p>
      </header>

      <main className="game-container" role="main" aria-label="Tic Tac Toe Game Area">
        <section className="game-card" aria-live="polite">
          <div className="status-row">
            <div className={`status-badge ${winnerInfo.winner ? 'status-win' : isDraw ? 'status-draw' : 'status-turn'}`}>
              {status}
            </div>
            <div className="controls">
              <button
                type="button"
                className="btn btn-primary"
                onClick={resetGame}
                aria-label="Reset the game and clear the board"
              >
                Reset Game
              </button>
              <button
                type="button"
                className="btn btn-amber"
                onClick={() => setShowHistory((s) => !s)}
                aria-pressed={showHistory}
                aria-label="Toggle move history panel"
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>
          </div>

          <Board
            squares={currentSquares}
            onPlay={handlePlay}
            xIsNext={xIsNext}
            gameOver={Boolean(winnerInfo.winner) || isDraw}
            winningLine={winnerInfo.line}
          />

          {showHistory && (
            <section className="history-section" aria-label="Move history">
              <h2 className="history-title">Move History</h2>
              <ol className="history-list">
                {history.map((_, move) => {
                  const description = move
                    ? `Go to move #${move}`
                    : 'Go to game start';
                  return (
                    <li key={move}>
                      <button
                        type="button"
                        className={`btn btn-outline ${move === currentStep ? 'btn-active' : ''}`}
                        onClick={() => jumpTo(move)}
                        aria-current={move === currentStep ? 'step' : undefined}
                        aria-label={`Time travel to ${description}`}
                      >
                        {description}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </section>

        <footer className="app-footer">
          <small>
            Works fully offline. No backend required.
          </small>
        </footer>
      </main>
    </div>
  );
}

function calculateWinner(squares) {
  /**
   * Determines the winner of the Tic Tac Toe game.
   * Returns { winner: 'X'|'O'|null, line: number[]|null }
   */
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

export default App;
