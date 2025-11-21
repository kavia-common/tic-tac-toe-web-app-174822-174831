import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Board from '../Board';
import Square from '../Square';

describe('Square component', () => {
  test('renders as a button gridcell with aria-label and value classnames', async () => {
    const onClick = jest.fn();
    render(<Square value={null} onClick={onClick} disabled={false} isWinning={false} index={0} />);

    const cell = screen.getByRole('gridcell');
    expect(cell).toBeEnabled();
    expect(cell).toHaveAttribute('aria-label', expect.stringMatching(/Cell 1/i));

    // Click triggers handler
    const user = userEvent.setup();
    await user.click(cell);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('reflects value-specific classes and disabled state', () => {
    const { rerender } = render(<Square value={'X'} onClick={() => {}} disabled={true} isWinning={true} index={4} />);
    const cell = screen.getByRole('gridcell');
    expect(cell).toBeDisabled();
    expect(cell.className).toMatch(/square-x/);
    expect(cell.className).toMatch(/square-win/);

    // rerender as O not winning
    rerender(<Square value={'O'} onClick={() => {}} disabled={false} isWinning={false} index={7} />);
    const cell2 = screen.getByRole('gridcell');
    expect(cell2).toBeEnabled();
    expect(cell2.className).toMatch(/square-o/);
    expect(cell2.className).not.toMatch(/square-win/);
  });
});

describe('Board component', () => {
  function setupBoard({ squares, xIsNext = true, gameOver = false, winningLine = null, onPlay = jest.fn() } = {}) {
    const defaultSquares = Array(9).fill(null);
    const props = {
      squares: squares ?? defaultSquares,
      xIsNext,
      gameOver,
      winningLine,
      onPlay,
    };
    render(<Board {...props} />);
    return props;
  }

  test('renders 9 squares as gridcells', () => {
    setupBoard();
    expect(screen.getAllByRole('gridcell')).toHaveLength(9);
  });

  test('clicking an empty square calls onPlay with an updated board', async () => {
    const onPlay = jest.fn();
    setupBoard({ onPlay, xIsNext: true });
    const user = userEvent.setup();
    const cells = screen.getAllByRole('gridcell');

    await user.click(cells[0]);

    expect(onPlay).toHaveBeenCalledTimes(1);
    const [nextSquares, moveIndex] = onPlay.mock.calls[0];
    expect(moveIndex).toBe(0);
    expect(nextSquares[0]).toBe('X');
    expect(nextSquares.filter(Boolean)).toHaveLength(1);
  });

  test('prevents click when square already filled or gameOver is true', async () => {
    const onPlay = jest.fn();
    // Case 1: square is already filled
    const filled = Array(9).fill(null);
    filled[3] = 'X';
    setupBoard({ squares: filled, onPlay, xIsNext: false, gameOver: false });
    const user = userEvent.setup();
    const cells = screen.getAllByRole('gridcell');
    await user.click(cells[3]);
    expect(onPlay).not.toHaveBeenCalled();

    // Case 2: gameOver true prevents any moves
    onPlay.mockClear();
    setupBoard({ squares: Array(9).fill(null), onPlay, xIsNext: true, gameOver: true });
    const cells2 = screen.getAllByRole('gridcell');
    await user.click(cells2[0]);
    expect(onPlay).not.toHaveBeenCalled();
  });

  test('applies winning styles via winningLine indices', () => {
    const squares = ['X', 'X', 'X', null, null, null, null, null, null];
    setupBoard({ squares, winningLine: [0, 1, 2] });

    const cells = screen.getAllByRole('gridcell');
    expect(cells[0].className).toMatch(/square-win/);
    expect(cells[1].className).toMatch(/square-win/);
    expect(cells[2].className).toMatch(/square-win/);
  });
});
