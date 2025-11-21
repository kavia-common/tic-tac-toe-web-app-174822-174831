import React from 'react';

/**
 * Square component renders a single board cell as a button with
 * accessible labels, focus outlines, and theme-aware styles.
 */

// PUBLIC_INTERFACE
export default function Square({ value, onClick, disabled, isWinning, index }) {
  const label = value
    ? `Cell ${index + 1}, ${value}`
    : `Cell ${index + 1}, empty. Place ${disabled ? '' : 'mark here.'}`;

  return (
    <button
      type="button"
      className={`square ${value ? `square-${value.toLowerCase()}` : ''} ${isWinning ? 'square-win' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      role="gridcell"
    >
      <span className="square-value" aria-hidden="true">{value}</span>
    </button>
  );
}
