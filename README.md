# Homefarm Simulator

Clean game-only standalone package.

## Run

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Root `/` renders the game directly.

## Balance simulator

Run automated balance checks from the terminal:

```bash
npm run sim -- --runs 100 --days 60 --seed 20260508
```

Useful options:

```txt
--runs  Number of simulation runs
--days  Max days per run
--seed  Deterministic seed
--json  Output machine-readable JSON
```
