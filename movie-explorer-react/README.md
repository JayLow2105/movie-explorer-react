# Movie Explorer (React + TypeScript + Vite)

A React port of your original TMDB movie browser with search, sort, and pagination.

## Quick Start
```bash
npm install
npm run dev
```

## API Key
Create a `.env` file in the project root:
```
VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
```
Or pass the key as a prop to `<MovieExplorer apiKey="..."/>` in `App.tsx`.

## Commands
- `npm run dev` – start dev server
- `npm run build` – type-check + build
- `npm run preview` – preview production build
