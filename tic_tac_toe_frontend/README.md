# Tic Tac Toe – Ocean Professional

A modern, responsive Tic Tac Toe web app built with React. Uses a clean Ocean Professional theme with blue and amber accents, subtle gradients, rounded corners, and soft shadows.

## Quick Start

In the project directory:

- npm install
- npm start

The app will be available at http://localhost:3000

No backend required. Works fully offline.

## How to Play

- The game starts with Player X.
- Click a square to place your mark (X or O).
- The status badge shows the current player, a winner, or a draw.
- After a win or draw, moves are disabled.
- Click Reset Game to start again.
- Optional: Click Show History to time-travel to any previous move.

## Accessibility

- Squares are buttons with aria-labels and keyboard focus outlines.
- Status is readable via screen readers (aria-live enabled).

## Scripts

- npm start – Run the app in development mode.
- npm test – Launch the test runner.
- npm run build – Build for production.

## Notes

- The app does not use any environment variables for gameplay.
- Styling is contained in src/App.css and follows the Ocean Professional palette:
  - Primary #2563EB, Secondary #F59E0B, Error #EF4444, Background #f9fafb, Surface #ffffff, Text #111827.
