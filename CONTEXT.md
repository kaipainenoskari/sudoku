# Sudoku+ — Domain Context

This file is the canonical glossary for Sudoku+. All agents and skills must use these terms exactly. Do not drift to synonyms.

## Core Concepts

**Puzzle** — a 9×9 sudoku grid with some cells pre-filled (given cells) and the rest empty. A puzzle has exactly one valid solution.

**Board** — the current in-memory state of a puzzle being played. The board includes both given cells and player-placed cells.

**Solution** — the complete, valid 9×9 grid that satisfies all sudoku constraints. Generated alongside the puzzle; used to validate player input.

**Given cell** — a cell whose value was pre-filled when the puzzle was generated. The player cannot modify a given cell.

**Placed cell** — a cell the player has filled in during a game session.

**Empty cell** — a cell with no value (given or placed). Represented as `0` internally.

**Clue** — a given cell. The number of clues in a puzzle determines its difficulty: fewer clues = harder.

**Note** — a small candidate digit (1–9) the player marks in a cell as a reminder. Multiple notes can exist in one cell. Notes are cleared when the player places a value in that cell.

**Notes mode** — a toggle that switches player input from placing values to placing/removing notes. Disabled entirely in Hard Mode.

**Difficulty** — one of five levels: `easy`, `medium`, `hard`, `expert`, `evil`. Determined by the number of clues and uniqueness of the solving path.

**Hard Mode** — a play mode with no error indicators, no cell highlights, and no notes. The player must solve entirely from memory and logic.

**Daily Puzzle** — a puzzle seeded by the current date. Every player on the same day sees the identical board. One attempt per day.

**Streak** — the number of consecutive days on which the player has completed at least one puzzle. Breaking a day resets the streak to zero.

**Timer** — elapsed time in seconds from puzzle start to completion. Used for scoring and personal bests.

**Mistake** — a placed cell whose value differs from the solution. Only visible in non-Hard-Mode games.

**Personal best** — the fastest solve time for a given difficulty. Stored locally per device.

## Engine Concepts

**Generator** — the module that produces a valid puzzle and its solution for a given difficulty.

**Solver** — the backtracking constraint solver used both to generate solutions and to verify puzzle uniqueness.

**Uniqueness check** — confirming a puzzle has exactly one solution (via `countSolutions`). Required for all generated puzzles.

**Seeded generation** — deterministic puzzle generation using a numeric seed (used for Daily Puzzle). Same seed always produces the same puzzle.

## Architecture Terms

**Engine** — the pure TypeScript module at `packages/engine/`. No React Native dependencies. Contains the Generator, Solver, and Difficulty grader.

**Store** — the Zustand state store (`stores/gameStore.ts`). Single source of truth for all game state and persisted stats.

**Board component** — the React Native component that renders the 9×9 grid and handles cell selection.

**Number pad** — the React Native component for player input: digits 1–9, erase, notes toggle, undo.

## Vocabulary Rules

- Say **puzzle** not "sudoku board" or "grid" when referring to the generated challenge.
- Say **given cell** not "pre-filled cell", "fixed cell", or "locked cell".
- Say **placed cell** not "user input" or "player digit".
- Say **Hard Mode** (capitalised) not "hard mode" or "no-hint mode".
- Say **Daily Puzzle** (capitalised) not "daily challenge" or "puzzle of the day".
- Say **streak** not "login streak" or "play streak".
- Say **mistake** not "error" or "wrong answer" when referring to an incorrect placed value.
