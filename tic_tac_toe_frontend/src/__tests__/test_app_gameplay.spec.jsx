import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

/**
 * Integration-oriented tests exercising App + Board + Square.
 * Covers rendering, gameplay flow, win/draw detection, status messaging, reset, and accessibility.
 */

function getAllSquares() {
  // Squares are buttons with role gridcell on the button and square-value span inside.
  return screen.getAllByRole('gridcell');
}

function clickSquare(index) {
  const squares = getAllSquares();
  return userEvent.click(squares[index]);
}

describe('Tic Tac Toe App - Rendering and Accessibility', () => {
  test('renders title, status badge, and 3x3 grid with accessible buttons', () => {
    render(<App />);

    // Title
    expect(screen.getByRole('heading', { level: 1, name: /Tic Tac Toe/i })).toBeInTheDocument();

    // Status shows Next Player X initially
    expect(screen.getByText(/Next Player: X/i)).toBeInTheDocument();

    // Board and squares
    const board = screen.getByRole('grid', { name: /Game board/i });
    expect(board).toBeInTheDocument();

    const squares = getAllSquares();
    expect(squares).toHaveLength(9);

    // Accessibility: each square has an aria-label
    squares.forEach((sq, idx) => {
      expect(sq).toHaveAttribute('aria-label');
      // Initially empty label text should include "Cell {n}, empty"
      expect(sq.getAttribute('aria-label')).toMatch(new RegExp(`Cell ${idx + 1}`, 'i'));
    });

    // Control buttons present
    expect(screen.getByRole('button', { name: /Reset the game and clear the board/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle move history panel/i })).toBeInTheDocument();
  });

  test('initial squares are empty and enabled', () => {
    render(<App />);
    const squares = getAllSquares();
    squares.forEach((sq) => {
      expect(within(sq).queryByText('X')).not.toBeInTheDocument();
      expect(within(sq).queryByText('O')).not.toBeInTheDocument();
      expect(sq).toBeEnabled();
    });
  });
});

describe('Gameplay - Alternating moves and preventing overwrites', () => {
  test('players alternate between X and O; cannot overwrite a move', async () => {
    render(<App />);
    const user = userEvent.setup();

    // X plays on 0
    await user.click(getAllSquares()[0]);
    expect(getAllSquares()[0]).toHaveTextContent('X');
    expect(screen.getByText(/Next Player: O/i)).toBeInTheDocument();

    // O plays on 1
    await user.click(getAllSquares()[1]);
    expect(getAllSquares()[1]).toHaveTextContent('O');
    expect(screen.getByText(/Next Player: X/i)).toBeInTheDocument();

    // Try to overwrite square 1 (already O) - should not change to X
    await user.click(getAllSquares()[1]);
    expect(getAllSquares()[1]).toHaveTextContent('O');
  });
});

describe('Win detection across rows, columns, and diagonals', () => {
  test('row win is detected and status updates with Winner', async () => {
    render(<App />);
    const user = userEvent.setup();

    // X 0, O 3, X 1, O 4, X 2 -> X wins on top row [0,1,2]
    await user.click(getAllSquares()[0]); // X
    await user.click(getAllSquares()[3]); // O
    await user.click(getAllSquares()[1]); // X
    await user.click(getAllSquares()[4]); // O
    await user.click(getAllSquares()[2]); // X wins

    expect(screen.getByText(/Winner:\s*X/i)).toBeInTheDocument();

    // After win, moves disabled
    const postWinSquares = getAllSquares();
    // winning cells should be disabled (gameOver disables all squares via Board prop)
    postWinSquares.forEach((sq) => expect(sq).toBeDisabled());
  });

  test('column win is detected for O and moves stop', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Sequence to get O winning column [1,4,7]
    // X:0, O:1, X:2, O:4, X:3, O:7 -> O wins
    await user.click(getAllSquares()[0]); // X
    await user.click(getAllSquares()[1]); // O
    await user.click(getAllSquares()[2]); // X
    await user.click(getAllSquares()[4]); // O
    await user.click(getAllSquares()[3]); // X
    await user.click(getAllSquares()[7]); // O wins

    expect(screen.getByText(/Winner:\s*O/i)).toBeInTheDocument();

    // No further moves allowed
    const squares = getAllSquares();
    squares.forEach((sq) => expect(sq).toBeDisabled());
  });

  test('diagonal win is detected', async () => {
    render(<App />);
    const user = userEvent.setup();

    // X:0, O:1, X:4, O:2, X:8 -> X wins diagonal [0,4,8]
    await user.click(getAllSquares()[0]); // X
    await user.click(getAllSquares()[1]); // O
    await user.click(getAllSquares()[4]); // X
    await user.click(getAllSquares()[2]); // O
    await user.click(getAllSquares()[8]); // X wins

    expect(screen.getByText(/Winner:\s*X/i)).toBeInTheDocument();
  });
});

describe('Draw detection', () => {
  test('recognizes a draw and disables further moves', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Fill to draw:
    // X:0 O:1 X:2 O:4 X:3 O:5 X:7 O:6 X:8
    const seq = [0,1,2,4,3,5,7,6,8];
    for (let i = 0; i < seq.length; i += 1) {
      await user.click(getAllSquares()[seq[i]]);
    }

    expect(screen.getByText(/Draw! No moves left./i)).toBeInTheDocument();
    const squares = getAllSquares();
    squares.forEach((sq) => expect(sq).toBeDisabled());
  });
});

describe('Reset behavior and history toggle', () => {
  test('Reset Game clears board and status returns to Next Player: X', async () => {
    render(<App />);
    const user = userEvent.setup();

    await clickSquare(0); // X
    expect(getAllSquares()[0]).toHaveTextContent('X');

    await user.click(screen.getByRole('button', { name: /Reset the game and clear the board/i }));
    const squares = getAllSquares();
    squares.forEach((sq) => {
      expect(sq).toBeEnabled();
      expect(sq).toHaveTextContent('');
    });
    expect(screen.getByText(/Next Player: X/i)).toBeInTheDocument();
  });

  test('History toggle shows and hides the move list; time travel updates state', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Make a couple of moves
    await clickSquare(0); // X
    await clickSquare(4); // O

    // Open history panel
    const historyToggle = screen.getByRole('button', { name: /Toggle move history panel/i });
    expect(historyToggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(historyToggle);
    expect(historyToggle).toHaveAttribute('aria-pressed', 'true');

    // History list should be visible with steps
    const historyRegion = screen.getByLabelText(/Move history/i);
    expect(historyRegion).toBeInTheDocument();

    // Buttons like "Go to game start", "Go to move #1", "Go to move #2"
    const startBtn = within(historyRegion).getByRole('button', { name: /Go to game start/i });
    const move1Btn = within(historyRegion).getByRole('button', { name: /Go to move #1/i });
    const move2Btn = within(historyRegion).getByRole('button', { name: /Go to move #2/i });

    expect(startBtn).toBeInTheDocument();
    expect(move1Btn).toBeInTheDocument();
    expect(move2Btn).toBeInTheDocument();

    // Time travel to move 1 -> only first move should be present on board
    await user.click(move1Btn);
    expect(getAllSquares()[0]).toHaveTextContent('X');
    expect(getAllSquares()[4]).toHaveTextContent(''); // O move undone

    // Current step button has aria-current="step"
    expect(move1Btn).toHaveAttribute('aria-current', 'step');

    // Hide history
    await user.click(historyToggle);
    expect(historyRegion).not.toBeInTheDocument();
  });
});
