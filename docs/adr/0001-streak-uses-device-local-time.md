# ADR-0001: Streak calculation uses device local time

## Status

Accepted

## Context

The streak counter tracks consecutive days on which the player completes at least one puzzle. "A day" must be defined relative to some timezone. Options considered: device local time, UTC, server-authoritative time.

## Decision

Use device local time. "Today" is the calendar date in the player's local timezone, formatted as `YYYY-MM-DD` using local date components (not `.toISOString()`, which returns UTC).

The `calculateStreak` pure function accepts an injected `today` string so it never reads the clock itself — the caller is responsible for formatting local time correctly.

## Consequences

- Streak behaviour matches user expectation: playing before local midnight counts for that day.
- A player travelling across timezones may experience edge cases (e.g. gaining or losing a day). Accepted for MVP.
- The Daily Puzzle seed uses UTC date (so all players globally get the same puzzle). Streak and Daily Puzzle therefore use different date references — this is intentional and correct.
- If server-side streak verification is added in future, this decision must be revisited. Do not silently override — open a new ADR.
