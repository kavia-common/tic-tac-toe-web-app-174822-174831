import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title and initial status', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Tic Tac Toe/i })).toBeInTheDocument();
  expect(screen.getByText(/Next Player:\s*X/i)).toBeInTheDocument();
});
